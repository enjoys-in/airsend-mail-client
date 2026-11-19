/** Same-origin Next.js proxy that forwards to the Kaneo backend (see src/app/api/tasks). */
export const DEFAULT_TASKS_API_URL = "/api/tasks";

/**
 * Resolves the Hono client base URL from `NEXT_PUBLIC_TASKS_API_URL` (or default).
 * If the value already ends with `/api` or the `/api/tasks` proxy path, it is returned
 * as-is; otherwise `/api` is appended.
 */
export function resolveApiBaseUrl(publicApiUrl: string | undefined): string {
  const raw = publicApiUrl || DEFAULT_TASKS_API_URL;
  const baseUrl = raw.replace(/\/+$/, "");
  return baseUrl.endsWith("/api") || baseUrl.endsWith("/api/tasks")
    ? baseUrl
    : `${baseUrl}/api`;
}
