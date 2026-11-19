// Stand-in for the Nimbus backend's `AppType` (the Hono router type exported by `@nimbus/server`). The backend lives in
// its own repo, so the typed Hono client in ../../_utils/client.ts is intentionally loosely typed here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppType = any;
