import { NextRequest, NextResponse } from "next/server";
import { tasksProxyBlockReason } from "@/lib/tasks-proxy-policy";

// Proxy to the Kaneo tasks service (../tasks), which runs as its own backend.
//
// There is no airsend-api call here, so tasks keep working when airsend-api is down. Kaneo has no sign-in: it
// verifies the AirSend JWT itself (same secret) and looks the user up by email in the tasks schema. The user, their
// membership and their active/inactive state are written into that schema by airsend-api ONCE, when access is
// granted or removed. A user without the tasks scope is inactive there, so Kaneo refuses their calls.
// Identity, workspace and membership changes are refused here (tasks-proxy-policy): AirSend owns them.

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

const tasksBackendUrl = () =>
  stripTrailingSlashes(process.env.TASKS_API_URL || "http://localhost:1337");

function userToken(request: NextRequest): string | null {
  const cookie = request.cookies.get("access_token")?.value;
  const header = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  return cookie || header || null;
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

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  else if (body) headers["Content-Type"] = "application/json";
  const windowId = request.headers.get("x-kaneo-window-id");
  if (windowId) headers["X-Kaneo-Window-Id"] = windowId;
  // Kaneo remembers the user's active workspace in this cookie; nothing else from the browser's cookies is sent.
  const activeWorkspace = request.cookies.get("tasks_active_workspace")?.value;
  if (activeWorkspace) headers["Cookie"] = `tasks_active_workspace=${encodeURIComponent(activeWorkspace)}`;

  try {
    const backendRes = await fetch(`${tasksBackendUrl()}/api/${targetPath}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      ...(body ? { body } : {}),
    });

    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "content-disposition", "etag", "last-modified"]) {
      const value = backendRes.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    // Kaneo sets its active-workspace cookie; pass it through.
    for (const cookie of backendRes.headers.getSetCookie()) responseHeaders.append("set-cookie", cookie);

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
