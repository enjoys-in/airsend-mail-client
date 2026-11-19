/**
 * The Kaneo tasks backend, called directly from the browser (it verifies the AirSend token itself, so there is no
 * proxy). Dev default; the real value comes from the runtime config (server env `TASKS_API_URL`).
 */
export const DEFAULT_TASKS_API_URL = "http://localhost:1337";

/** Reads a value from `window.__RUNTIME_CONFIG__`, which the root layout injects from the server env. */
export function runtimeConfig(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as { __RUNTIME_CONFIG__?: Record<string, string> }).__RUNTIME_CONFIG__?.[key] || undefined;
}

/** The tasks API base as configured at runtime (`TASKS_API_URL`), or undefined for the dev default. */
export const getTasksApiUrl = (): string | undefined => runtimeConfig("TASKS_API_URL");

/**
 * Resolves the Hono client base URL from the runtime `TASKS_API_URL` (or default).
 * If the value already ends with `/api` it is returned as-is; otherwise `/api` is appended.
 */
export function resolveApiBaseUrl(publicApiUrl: string | undefined): string {
  const raw = publicApiUrl || DEFAULT_TASKS_API_URL;
  const baseUrl = raw.replace(/\/+$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
}
