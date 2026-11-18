import { NextRequest, NextResponse } from "next/server";

// Tickets and tasks live in the Kaneo service (../tasks). Every call is authorized by airsend-api first:
//   - only users whose domain (or email) is under an organization may use it,
//   - each domain gets its own Kaneo workspace (created on first use),
//   - only the Kaneo routes the UI uses are allowed, and ids must belong to the caller's workspace.
// The service API key can reach every tenant's workspace, so nothing here trusts a client-supplied
// workspaceId or forwards the browser's credentials to Kaneo.

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

const tasksBackendUrl = () => stripTrailingSlashes(process.env.TASKS_API_URL || "http://localhost:1337");
const airsendApiUrl = () => stripTrailingSlashes(process.env.APP_URL || "http://localhost:9501");

function userToken(request: NextRequest): string | null {
  const cookie = request.cookies.get("access_token")?.value;
  const header = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  return cookie || header || null;
}

type Authorization =
  | { ok: true; workspaceId: string }
  | { ok: false; status: number; message: string; backendOffline?: boolean };

async function authorize(token: string, method: string, path: string, body: unknown): Promise<Authorization> {
  try {
    const res = await fetch(`${airsendApiUrl()}/api/v1/workspace-access/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method, path, body }),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success && json.result?.workspace_id) {
      return { ok: true, workspaceId: json.result.workspace_id as string };
    }
    const status = [401, 403, 404].includes(res.status) ? res.status : 502;
    return { ok: false, status, message: json?.message || "Could not authorize this request." };
  } catch (error: any) {
    return { ok: false, status: 503, message: error?.message || "Could not reach the AirSend API.", backendOffline: true };
  }
}

/** Keep only the caller's workspace in a `workspace` list response (array, single object or { workspaces }). */
function onlyWorkspace(data: any, workspaceId: string): any {
  if (Array.isArray(data)) return data.filter((w) => w?.id === workspaceId);
  if (data && Array.isArray(data.workspaces)) return { ...data, workspaces: data.workspaces.filter((w: any) => w?.id === workspaceId) };
  if (data && typeof data === "object" && "id" in data) return data.id === workspaceId ? data : [];
  return data;
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetPath = Array.isArray(path) ? path.join("/") : path || "";
  const method = request.method;

  const token = userToken(request);
  if (!token) {
    return NextResponse.json({ success: false, error: "Please sign in." }, { status: 401 });
  }

  let bodyText: string | undefined;
  let bodyJson: unknown;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    bodyText = (await request.text().catch(() => "")) || undefined;
    if (bodyText) {
      try {
        bodyJson = JSON.parse(bodyText);
      } catch {
        return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
      }
    }
  }

  const auth = await authorize(token, method, targetPath, bodyJson);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message, ...(auth.backendOffline ? { backendOffline: true } : {}) },
      { status: auth.status }
    );
  }

  // Always scope list calls to the caller's own workspace, whatever the client asked for.
  const params = new URLSearchParams(request.nextUrl.search);
  if (targetPath === "project" || targetPath === "task/assigned") {
    params.set("workspaceId", auth.workspaceId);
  } else {
    params.delete("workspaceId");
  }
  const search = params.toString() ? `?${params.toString()}` : "";
  const targetUrl = `${tasksBackendUrl()}/api/${targetPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("Content-Type") || "application/json",
  };
  const serviceKey = process.env.TASKS_API_KEY;
  if (serviceKey) headers["x-api-key"] = serviceKey;

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      ...(bodyText ? { body: bodyText } : {}),
    });
    const contentType = backendRes.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      let data = await backendRes.json();
      if (targetPath === "workspace" && backendRes.ok) data = onlyWorkspace(data, auth.workspaceId);
      return NextResponse.json(data, { status: backendRes.status });
    }

    const text = await backendRes.text();
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to connect to tasks backend",
        backendOffline: true,
      },
      { status: 503 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
