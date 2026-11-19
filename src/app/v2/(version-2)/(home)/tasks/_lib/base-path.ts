/**
 * The Kaneo app is mounted inside the AirSend Next.js app under this path
 * (see `../page.tsx`). TanStack Router is created with it as `basepath`, so
 * router-aware links already include it; code that reads `window.location`
 * directly goes through these helpers instead.
 */
export const TASKS_BASE_PATH = "/v2/tasks";

/** `/v2/tasks/dashboard/x` -> `/dashboard/x` (router-relative path). */
export function stripTasksBasePath(pathname: string): string {
  if (pathname === TASKS_BASE_PATH) return "/";
  return pathname.startsWith(`${TASKS_BASE_PATH}/`)
    ? pathname.slice(TASKS_BASE_PATH.length)
    : pathname;
}

/** `/dashboard/x` -> `/v2/tasks/dashboard/x` (browser path). */
export function withTasksBasePath(path: string): string {
  return `${TASKS_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
