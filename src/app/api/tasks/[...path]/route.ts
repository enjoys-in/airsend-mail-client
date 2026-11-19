import { NextRequest, NextResponse } from "next/server";
import { tasksProxyBlockReason } from "@/lib/tasks-proxy-policy";

// Proxy to the Kaneo tasks service (../tasks), which runs as its own backend.
//
// Kaneo has no sign-up or sign-in: it trusts the AirSend JWT (same secret) and looks the user up by email in
// the tasks schema, but it never creates users. So before forwarding, airsend-api is asked to make sure the
// user and their workspace membership exist (POST /api/v1/workspace-access/tasks-provision), which also
// answers 403 with the reason when the account may not use tasks. The user's own AirSend token is then
// forwarded to Kaneo as the Bearer credential. Identity, workspaces and membership changes are refused here
// (see tasks-proxy-policy) because AirSend owns them.

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

const tasksBackendUrl = () =>
  stripTrailingSlashes(process.env.TASKS_API_URL || "http://localhost:1337");
const airsendApiUrl = () =>
  stripTrailingSlashes(process.env.APP_URL || "http://localhost:9501");

function userToken(request: NextRequest): string | null {
  const cookie = request.cookies.get("access_token")?.value;
  const header = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  return cookie || header || null;
}

type ProvisionResult =
  | { ok: true; workspaceId: string }
  | { ok: false; status: number; message: string };

// Provisioning is idempotent and only needs repeating when the user could have changed, so a positive answer is
// cached briefly. A removed user is refused by Kaneo itself (membership is checked on every request).
const PROVISION_TTL_MS = 60_000;
const provisionCache = new Map<string, { at: number; workspaceId: string }>();

async function provision(token: string, fresh = false): Promise<ProvisionResult> {
  const hit = provisionCache.get(token);
  if (!fresh && hit && Date.now() - hit.at < PROVISION_TTL_MS) {
    return { ok: true, workspaceId: hit.workspaceId };
  }
  try {
    const res = await fetch(`${airsendApiUrl()}/api/v1/workspace-access/tasks-provision`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.result?.workspace_id) {
      const workspaceId = json.result.workspace_id as string;
      if (provisionCache.size > 500) provisionCache.clear();
      provisionCache.set(token, { at: Date.now(), workspaceId });
      return { ok: true, workspaceId };
    }
    provisionCache.delete(token);
    const status = [401, 403, 404].includes(res.status) ? res.status : 502;
    return { ok: false, status, message: json?.message || "Could not authorize access to tasks." };
  } catch (error: any) {
    return { ok: false, status: 503, message: error?.message || "AirSend API is unreachable." };
  }
}

async function callKaneo(
  request: NextRequest,
  targetPath: string,
  body: ArrayBuffer | undefined,
  token: string,
  workspaceId: string,
): Promise<Response> {
  const params = new URLSearchParams(request.nextUrl.search);
  // These two list endpoints are scoped by workspace; default to the user's own.
  if ((targetPath === "project" || targetPath === "task/assigned") && !params.has("workspaceId")) {
    params.set("workspaceId", workspaceId);
  }
  const search = params.toString() ? `?${params.toString()}` : "";

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  else if (body) headers["Content-Type"] = "application/json";
  const windowId = request.headers.get("x-kaneo-window-id");
  if (windowId) headers["X-Kaneo-Window-Id"] = windowId;

  return fetch(`${tasksBackendUrl()}/api/${targetPath}${search}`, {
    method: request.method,
    headers,
    ...(body ? { body } : {}),
  });
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = Array.isArray(path) ? path.join("/") : path || "";

  const blocked = tasksProxyBlockReason(request.method, targetPath);
  if (blocked) {
    return NextResponse.json({ success: false, error: blocked, message: blocked }, { status: 403 });
  }

  const token = userToken(request);
  if (!token) {
    return NextResponse.json({ success: false, error: "Sign in to use tasks." }, { status: 401 });
  }

  let body: ArrayBuffer | undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const raw = await request.arrayBuffer().catch(() => undefined);
    if (raw && raw.byteLength > 0) body = raw;
  }

  const provisioned = await provision(token);
  if (!provisioned.ok) {
    return NextResponse.json(
      { success: false, error: provisioned.message, message: provisioned.message },
      { status: provisioned.status },
    );
  }

  try {
    let backendRes = await callKaneo(request, targetPath, body, token, provisioned.workspaceId);
    if (backendRes.status === 401) {
      // Kaneo may not have known the user yet (or they were just re-added): provision again once and retry.
      const renewed = await provision(token, true);
      if (!renewed.ok) {
        return NextResponse.json(
          { success: false, error: renewed.message, message: renewed.message },
          { status: renewed.status },
        );
      }
      backendRes = await callKaneo(request, targetPath, body, token, renewed.workspaceId);
    }

    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "content-disposition", "etag", "last-modified"]) {
      const value = backendRes.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(backendRes.status === 204 ? null : await backendRes.arrayBuffer(), {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reach tasks backend", backendOffline: true },
      { status: 503 },
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
