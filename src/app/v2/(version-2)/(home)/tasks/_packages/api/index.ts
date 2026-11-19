// Stand-in for the Kaneo backend's `AppType` (the Hono router type exported by
// `@kaneo/api`). The backend is not part of this repo, so the typed Hono client in
// `../libs/hono.ts` is intentionally loosely typed here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppType = any;
