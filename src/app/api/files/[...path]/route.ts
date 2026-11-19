import { NextRequest, NextResponse } from "next/server";
import { checkFeatureAccess } from "@/lib/server/airsend-access";

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

const filesBackendUrl = () =>
  stripTrailingSlashes(process.env.FILES_API_URL || "http://localhost:1284");

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  // Files needs a `files` scope in the profile (/me); checked here against fresh scopes, not the UI.
  const token = request.cookies.get("access_token")?.value || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ success: false, error: "Sign in to use files." }, { status: 401 });
  }
  const access = await checkFeatureAccess(token, "files");
  if (!access.ok) {
    return NextResponse.json({ success: false, error: access.message, message: access.message }, { status: access.status });
  }

  try {
    const { path } = await context.params;
    const targetPath = Array.isArray(path) ? path.join("/") : path || "";
    const method = request.method;
    const search = request.nextUrl.search || "";
    const targetUrl = `${filesBackendUrl()}/api/${targetPath}${search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Drop host and hop-by-hop headers
      if (!["host", "content-length", "connection"].includes(lower)) {
        headers.set(key, value);
      }
    });

    // Pass credentials and provider headers
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("cookie", cookie);

    const init: RequestInit = {
      method,
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        init.body = await request.formData();
      } else {
        const text = await request.text().catch(() => null);
        if (text) init.body = text;
      }
    }

    const backendResponse = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    // If binary download
    const contentType = backendResponse.headers.get("content-type") || "";
    if (
      contentType.includes("octet-stream") ||
      contentType.includes("application/zip") ||
      contentType.includes("pdf")
    ) {
      const blob = await backendResponse.blob();
      return new NextResponse(blob, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
      });
    }

    const responseBody = await backendResponse.text();
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Files API Proxy Error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to communicate with Files service" },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = () => new NextResponse(null, { status: 204 });
