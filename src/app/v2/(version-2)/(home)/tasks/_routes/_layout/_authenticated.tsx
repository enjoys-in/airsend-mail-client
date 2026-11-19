import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GlobalShortcuts } from "@tasks/_components/shortcuts/global-shortcuts";
import { useTrackSignup } from "@tasks/_hooks/use-track-signup";
import { useUserWebSocket } from "@tasks/_hooks/use-user-websocket";
import { getCachedSession } from "@tasks/_lib/cached-session";
import { ensureSession } from "@tasks/_lib/ensure-session";

// Protects all child routes. There is no sign-in screen: a missing session is created silently
// (`ensureSession`), and if that fails the route error boundary shows a retry state.
export const Route = createFileRoute("/_layout/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    const cached = getCachedSession();
    if (cached) return { session: cached, sessionError: false };
    const session = await ensureSession();
    return { session, sessionError: false };
  },
});

function AuthenticatedLayout() {
  const { session } = Route.useRouteContext();
  useUserWebSocket();
  useTrackSignup(session?.user);
  return (
    <>
      <GlobalShortcuts />
      <Outlet />
    </>
  );
}
