import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@nimbus/_packages/auth/auth-client";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ location }) => {
		try {
			// Check if user is authenticated
			const session = await authClient.getSession();

			if (!session?.data?.user) {
				// No Nimbus sign-in here: AirSend owns identity, so send the user to AirSend's own login.
				window.location.assign(`/v2?redirect=${encodeURIComponent(`/v2/files${location.pathname}`)}`);
				return new Promise<never>(() => {});
			}

			// Return session data to be available in route context
			return {
				session,
			};
		} catch (error) {
			// If it's already a redirect, re-throw it
			if (error instanceof Error && error.message.includes("redirect")) {
				throw error;
			}

			// The files backend could not be reached or did not accept the AirSend session.
			throw error;
		}
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	return <Outlet />;
}
