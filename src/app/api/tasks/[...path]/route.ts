import { NextRequest, NextResponse } from "next/server";

function getTasksBackendUrl(): string {
  const url = process.env.TASKS_API_URL || "http://localhost:1337";
  return url.replace(/\/+$/, "");
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const targetPath = Array.isArray(path) ? path.join("/") : (path || "");
  let search = request.nextUrl.search || "";
  const backendBase = getTasksBackendUrl();

  // If workspaceId is not specified in query params and default is configured, inject it
  const defaultWs = process.env.TASKS_DEFAULT_WORKSPACE_ID;
  if (
    defaultWs &&
    !search.includes("workspaceId") &&
    (targetPath === "project" || targetPath === "task/assigned")
  ) {
    search = search ? `${search}&workspaceId=${encodeURIComponent(defaultWs)}` : `?workspaceId=${encodeURIComponent(defaultWs)}`;
  }

  const targetUrl = `${backendBase}/api/${targetPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("Content-Type") || "application/json",
  };

  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  const cookie = request.headers.get("Cookie");
  if (cookie) headers["Cookie"] = cookie;

  const email = request.headers.get("X-User-Email");
  if (email) headers["X-User-Email"] = email;

  // Use caller's api key or fallback to configured service api key
  const apiKey = request.headers.get("x-api-key") || process.env.TASKS_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  try {
    const fetchInit: RequestInit = {
      method: request.method,
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      try {
        const bodyText = await request.text();
        if (bodyText) {
          fetchInit.body = bodyText;
        }
      } catch {
        // no body
      }
    }

    const backendRes = await fetch(targetUrl, fetchInit);
    const contentType = backendRes.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const data = await backendRes.json();
      return NextResponse.json(data, {
        status: backendRes.status,
      });
    }

    const text = await backendRes.text();
    return new NextResponse(text, {
      status: backendRes.status,
      headers: {
        "Content-Type": contentType || "text/plain",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to connect to tasks backend",
        targetUrl,
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
