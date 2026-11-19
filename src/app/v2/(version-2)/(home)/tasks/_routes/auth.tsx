import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSafeRedirectPath } from "@tasks/_components/auth/auth-methods";

// Tasks has no sign-in screen: it runs inside the AirSend shell, and the session is established
// by `ensureSession` in the authenticated layout. Every legacy `/auth/*` URL (old bookmarks, the
// invite / device / MCP flows that still link here) just continues to where it was going.
export const Route = createFileRoute("/auth")({
  beforeLoad: ({ location }) => {
    const { redirect: target } = location.search as { redirect?: unknown };
    throw redirect({
      to:
        getSafeRedirectPath(typeof target === "string" ? target : undefined) ??
        "/dashboard",
      replace: true,
    });
  },
});
