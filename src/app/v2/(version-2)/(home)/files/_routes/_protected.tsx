import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getSession } from "@nimbus/_lib/session";
import { withFilesBasePath } from "@nimbus/_lib/base-path";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ location }) => {
		// The backend answers from the AirSend access_token cookie; throws if it cannot be reached (route error UI).
		const session = await getSession();

		if (!session?.user) {
			// No Nimbus sign-in here: AirSend owns identity, so send the user to AirSend's own login.
			window.location.assign(`/v2?redirect=${encodeURIComponent(withFilesBasePath(location.pathname))}`);
			return new Promise<never>(() => {});
		}

		return { session };
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	return <Outlet />;
}
