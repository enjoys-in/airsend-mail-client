"use client";

/**
 * Next.js native fetch-based client for Files API.
 * Replaces Hono client with native Next.js fetch, without any external Hono dependency.
 */

export interface ClientRequestOptions {
  headers?: Record<string, string> | HeadersInit;
  init?: RequestInit;
}

export interface RequestArgs {
  query?: Record<string, any>;
  param?: Record<string, string>;
  json?: any;
  form?: any;
  init?: RequestInit;
}

export type DriveProviderClient = any;

let authContext: { openSignIn: () => void } | null = null;

// This function allows us to access the auth context outside of React components
export const setAuthContext = (context: { openSignIn: () => void }) => {
  authContext = context;
};

export async function handleUnauthorizedError<T extends () => Promise<Response>>(
  requestFn: T,
  errorMessage: string
): Promise<Awaited<ReturnType<T>>> {
  const response = await requestFn();

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => response.statusText);
    if (response.status === 401) {
      if (errorDetails.includes("re-authenticate") || errorDetails.includes("Authentication expired")) {
        authContext?.openSignIn();
      }
    }
    throw new Error(`${errorMessage}. Status: ${response.status}. ${errorDetails}`);
  }

  return response as Awaited<ReturnType<T>>;
}

function createFetchProxy(
  pathSegments: string[] = [],
  clientOptions?: ClientRequestOptions
): any {
  const handler: ProxyHandler<any> = {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string" || prop === "then" || prop === "toJSON") {
        return undefined;
      }

      // Handle HTTP execution methods: $get, $post, $put, $delete, $patch
      if (prop.startsWith("$")) {
        const method = prop.slice(1).toUpperCase();
        return async (args?: RequestArgs) => {
          let resolvedSegments = [...pathSegments];
          // Strip leading 'api' if present since Next.js proxy route is /api/files/...
          if (resolvedSegments[0] === "api") {
            resolvedSegments.shift();
          }

          let pathStr = resolvedSegments.join("/");

          // Replace URL params like :id, :fileId, :tagId
          if (args?.param) {
            for (const [pk, pv] of Object.entries(args.param)) {
              pathStr = pathStr
                .replace(`:${pk}`, encodeURIComponent(pv))
                .replace(`$${pk}`, encodeURIComponent(pv));
            }
            // Fallback: if only one param provided and a colon param remains in path
            const paramValues = Object.values(args.param);
            if (paramValues.length === 1 && /:[a-zA-Z0-9_-]+/.test(pathStr)) {
              pathStr = pathStr.replace(/:[a-zA-Z0-9_-]+/, encodeURIComponent(paramValues[0]));
            }
          }

          // Build query parameters
          let queryString = "";
          if (args?.query) {
            const sp = new URLSearchParams();
            for (const [qk, qv] of Object.entries(args.query)) {
              if (qv !== undefined && qv !== null) {
                if (Array.isArray(qv)) {
                  qv.forEach((item) => sp.append(qk, String(item)));
                } else {
                  sp.set(qk, String(qv));
                }
              }
            }
            const qs = sp.toString();
            if (qs) queryString = `?${qs}`;
          }

          // Separate files backend: when NEXT_PUBLIC_FILES_API_URL is set the browser calls it
          // directly (CORS + credentials); otherwise it goes through the same-origin /api/files
          // proxy, which forwards to FILES_API_URL on the server.
          const directBackend = process.env.NEXT_PUBLIC_FILES_API_URL?.trim().replace(/\/+$/, "");
          const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
          const url = directBackend
            ? `${directBackend}/api/${pathStr}${queryString}`
            : `${baseUrl}/api/files/${pathStr}${queryString}`;

          // Assemble headers
          const headers: Record<string, string> = {};
          if (clientOptions?.headers) {
            if (clientOptions.headers instanceof Headers) {
              clientOptions.headers.forEach((v, k) => {
                headers[k] = v;
              });
            } else if (typeof clientOptions.headers === "object") {
              Object.assign(headers, clientOptions.headers);
            }
          }

          let body: BodyInit | undefined = undefined;
          if (args?.form) {
            if (args.form instanceof FormData) {
              body = args.form;
            } else if (typeof args.form === "object") {
              const fd = new FormData();
              for (const [fk, fv] of Object.entries(args.form)) {
                if (fv !== undefined && fv !== null) {
                  fd.append(fk, fv as any);
                }
              }
              body = fd;
            }
            delete headers["Content-Type"];
          } else if (args?.json !== undefined) {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(args.json);
          }

          const fetchInit: RequestInit = {
            method,
            credentials: "include",
            ...clientOptions?.init,
            ...args?.init,
            headers: {
              ...headers,
              ...((args?.init?.headers as Record<string, string>) || {}),
            },
            body,
          };

          return await fetch(url, fetchInit);
        };
      }

      // Continue proxying next segment
      return createFetchProxy([...pathSegments, prop], clientOptions);
    },
    apply(_target, _thisArg, _args) {
      return createFetchProxy(pathSegments, clientOptions);
    },
  };

  return new Proxy(() => {}, handler);
}

export const createClient = (options?: ClientRequestOptions): any => {
  return createFetchProxy([], options);
};

export const publicClient: any = createClient();

export const createProtectedClient = (options?: ClientRequestOptions): any =>
  createClient({
    ...options,
    init: {
      ...options?.init,
      credentials: "include",
    },
  });

export const protectedClient: any = createProtectedClient();
