/**
 * The Kaneo tasks backend, called directly from the browser (it verifies the AirSend token itself, so there is no
 * proxy). Dev default; set NEXT_PUBLIC_TASKS_API_URL for any other environment.
 */
export const DEFAULT_TASKS_API_URL = "http://localhost:1337";

/**
 * Resolves the Hono client base URL from `NEXT_PUBLIC_TASKS_API_URL` (or default).
 * If the value already ends with `/api` it is returned as-is; otherwise `/api` is appended.
 */
export function resolveApiBaseUrl(publicApiUrl: string | undefined): string {
  const raw = publicApiUrl || DEFAULT_TASKS_API_URL;
  const baseUrl = raw.replace(/\/+$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
}
