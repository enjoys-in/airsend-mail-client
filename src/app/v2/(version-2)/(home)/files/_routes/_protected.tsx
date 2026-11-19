import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FilesForbiddenError, getSession, ORG_ONLY_MESSAGE } from "@nimbus/_lib/session";
import { OrgAccessDenied } from "@nimbus/_components/org-access-denied";
import { withFilesBasePath } from "@nimbus/_lib/base-path";

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ location }) => {
		// The backend answers from the AirSend access_token cookie. It throws FilesForbiddenError on 403 and an Error when
		// it cannot be reached; both are shown by the route's errorComponent.
		const session = await getSession();

		if (!session?.user) {
			// No Nimbus sign-in here: AirSend owns identity, so send the user to AirSend's own login.
			window.location.assign(`/v2?redirect=${encodeURIComponent(withFilesBasePath(location.pathname))}`);
			return new Promise<never>(() => {});
		}

		// Storage belongs to an organization: an account outside one has no files.
		if (!session.organization) throw new FilesForbiddenError(ORG_ONLY_MESSAGE);

		return { session };
	},
	component: ProtectedLayout,
	errorComponent: ProtectedError,
});

function ProtectedLayout() {
	return <Outlet />;
}

function ProtectedError({ error, reset }: { error: Error; reset: () => void }) {
	if (error instanceof FilesForbiddenError) return <OrgAccessDenied message={error.message} />;
	return <OrgAccessDenied title="Couldn't open files" message={error.message || "The files service could not be reached."} onRetry={reset} />;
}
