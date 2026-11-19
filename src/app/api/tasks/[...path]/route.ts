import { NextRequest, NextResponse } from "next/server";

// Proxy to the Kaneo tasks service (../tasks), which runs as its own backend.
//
// Every AirSend user acts in Kaneo as themselves. The user's AirSend token is exchanged at airsend-api
// (POST /api/v1/workspace-access/tasks-credentials) for that user's own Kaneo API key; airsend-api syncs the
// user, their workspace membership and the key into the tasks schema first. The key is sent to Kaneo as a
// Bearer credential, so there is no shared service key and no Kaneo sign-in. Kaneo's own membership and
// permission checks then apply per user.

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

type Credentials = { workspaceId: string; apiKey: string };
type CredentialsResult =
  | { ok: true; credentials: Credentials }
  | { ok: false; status: number; message: string };

const CREDENTIALS_TTL_MS = 5 * 60_000;
const credentialsCache = new Map<string, { at: number; credentials: Credentials }>();

async function getCredentials(token: string, fresh = false): Promise<CredentialsResult> {
  const hit = credentialsCache.get(token);
  if (!fresh && hit && Date.now() - hit.at < CREDENTIALS_TTL_MS) {
    return { ok: true, credentials: hit.credentials };
  }
  try {
    const res = await fetch(`${airsendApiUrl()}/api/v1/workspace-access/tasks-credentials`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.result?.api_key && json.result.workspace_id) {
      const credentials = { workspaceId: json.result.workspace_id as string, apiKey: json.result.api_key as string };
      if (credentialsCache.size > 500) credentialsCache.clear();
      credentialsCache.set(token, { at: Date.now(), credentials });
      return { ok: true, credentials };
    }
    credentialsCache.delete(token);
    const status = [401, 403, 404].includes(res.status) ? res.status : 502;
    return { ok: false, status, message: json?.message || "Could not authorize access to tasks." };
  } catch (error: any) {
    return { ok: false, status: 503, message: error?.message || "AirSend API is unreachable." };
  }
}

// Kaneo's auth layer can still set cookies (e.g. on sign-out); pass them through to the browser.
function forwardSetCookies(from: Response, to: NextResponse) {
  for (const cookie of from.headers.getSetCookie()) {
    to.headers.append("set-cookie", cookie);
  }
}

async function callKaneo(
  request: NextRequest,
  targetPath: string,
  body: ArrayBuffer | undefined,
  credentials: Credentials,
): Promise<Response> {
  const params = new URLSearchParams(request.nextUrl.search);
  // These two list endpoints are scoped by workspace; default to the user's own.
  if ((targetPath === "project" || targetPath === "task/assigned") && !params.has("workspaceId")) {
    params.set("workspaceId", credentials.workspaceId);
  }
  const search = params.toString() ? `?${params.toString()}` : "";

  const headers: Record<string, string> = { Authorization: `Bearer ${credentials.apiKey}` };
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

  const token = userToken(request);
  if (!token) {
    return NextResponse.json({ success: false, error: "Sign in to use tasks." }, { status: 401 });
  }

  let body: ArrayBuffer | undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const raw = await request.arrayBuffer().catch(() => undefined);
    if (raw && raw.byteLength > 0) body = raw;
  }

  const creds = await getCredentials(token);
  if (!creds.ok) {
    return NextResponse.json(
      { success: false, error: creds.message, message: creds.message },
      { status: creds.status },
    );
  }

  try {
    let backendRes = await callKaneo(request, targetPath, body, creds.credentials);
    if (backendRes.status === 401) {
      // The key may have been removed on the tasks side: re-issue it once and retry.
      const renewed = await getCredentials(token, true);
      if (renewed.ok) backendRes = await callKaneo(request, targetPath, body, renewed.credentials);
    }

    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "content-disposition", "etag", "last-modified"]) {
      const value = backendRes.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    const res = new NextResponse(backendRes.status === 204 ? null : await backendRes.arrayBuffer(), {
      status: backendRes.status,
      headers: responseHeaders,
    });
    forwardSetCookies(backendRes, res);
    return res;
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
