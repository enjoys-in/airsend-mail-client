import { createFileRoute, redirect } from "@tanstack/react-router";
import { configQueryOptions } from "@tasks/_hooks/queries/config/use-get-config";
import { instanceStatusQueryOptions } from "@tasks/_hooks/queries/instance/use-instance-status";
import { authClient } from "@tasks/_lib/auth-client";
import { getSettledSession } from "@tasks/_lib/cached-session";
import { signOutState } from "@tasks/_lib/sign-out-state";

async function resolveSession() {
  const settled = getSettledSession();
  if (settled !== undefined) return settled;
  try {
    const { data } = await authClient.getSession();
    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("getSession failed", error);
    // getSession() rejected (e.g. network error): treat as unauthenticated,
    // allow auth pages to render
    return null;
  }
}

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ location }) => {
    const session = await resolveSession();
    const isPasswordRecovery = [
      "/auth/forgot-password",
      "/auth/reset-password",
    ].includes(location.pathname.replace(/\/$/, ""));
    if (session && !isPasswordRecovery && !signOutState.isRedirecting) {
      throw redirect({
        to: "/dashboard",
      });
    }
    return { session };
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(configQueryOptions()),
      context.queryClient.ensureQueryData(instanceStatusQueryOptions()),
    ]).catch(() => undefined),
});
