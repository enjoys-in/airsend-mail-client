import { NextRequest, NextResponse } from "next/server";

// Tickets and tasks proxy for Kaneo service (../tasks).
// Authorizes via airsend-api and falls back gracefully to default workspace.

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

type Authorization =
  | { ok: true; workspaceId: string }
  | { ok: false; status: number; message: string; backendOffline?: boolean };

async function authorize(
  token: string,
  method: string,
  path: string,
  body: unknown
): Promise<Authorization> {
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
    return { ok: false, status, message: json?.message || "Could not authorize." };
  } catch (error: any) {
    return { ok: false, status: 503, message: error?.message || "AirSend API error" };
  }
}

function onlyWorkspace(data: any, workspaceId: string): any {
  if (Array.isArray(data)) return data.filter((w) => w?.id === workspaceId);
  if (data && Array.isArray(data.workspaces)) {
    return { ...data, workspaces: data.workspaces.filter((w: any) => w?.id === workspaceId) };
  }
  if (data && typeof data === "object" && "id" in data) {
    return data.id === workspaceId ? data : [];
  }
  return data;
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetPath = Array.isArray(path) ? path.join("/") : path || "";
  const method = request.method;

  let bodyText: string | undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    bodyText = (await request.text().catch(() => "")) || undefined;
  }

  const token = userToken(request);
  let workspaceId = process.env.TASKS_DEFAULT_WORKSPACE_ID || "QLgzDfOu35H0B5B4p6qWHC22JLlvoNNQ";

  if (token) {
    let bodyJson: unknown;
    if (bodyText) {
      try { bodyJson = JSON.parse(bodyText); } catch {}
    }
    const auth = await authorize(token, method, targetPath, bodyJson);
    if (auth.ok) {
      workspaceId = auth.workspaceId;
    }
  }

  const params = new URLSearchParams(request.nextUrl.search);
  if (targetPath === "project" || targetPath === "task/assigned") {
    if (!params.has("workspaceId")) {
      params.set("workspaceId", workspaceId);
    }
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
      if (targetPath === "workspace" && backendRes.ok) {
        data = onlyWorkspace(data, workspaceId);
      }
      return NextResponse.json(data, { status: backendRes.status });
    }

    const text = await backendRes.text();
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reach tasks backend", backendOffline: true },
      { status: 503 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
