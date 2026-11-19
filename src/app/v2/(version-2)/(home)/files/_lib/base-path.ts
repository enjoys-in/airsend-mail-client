/**
 * The Nimbus (files) app is mounted inside the AirSend Next.js app under this path (see `../[[...slug]]/page.tsx`).
 * TanStack Router is created with it as `basepath`, so router-aware links already include it; plain `<a href>`s and
 * `window.location` go through these helpers instead.
 */
export const FILES_BASE_PATH = "/v2/files";

/** `/dashboard/x` -> `/v2/files/dashboard/x` (browser path). */
export function withFilesBasePath(path: string): string {
	return `${FILES_BASE_PATH}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
}
