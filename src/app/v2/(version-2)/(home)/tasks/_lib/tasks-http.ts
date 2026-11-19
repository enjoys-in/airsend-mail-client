import { resolveApiBaseUrl } from "@tasks/_packages/libs/api-url";

/** The Kaneo tasks API (direct; it accepts the AirSend token). */
export const TASKS_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_TASKS_API_URL);

/** fetch() against the tasks API with the AirSend cookie included (cross-origin, same site). */
export const tasksFetch = (input: string, init: RequestInit = {}) =>
  fetch(input, { credentials: "include", ...init });
