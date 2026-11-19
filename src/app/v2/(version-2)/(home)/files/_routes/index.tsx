import { createFileRoute, redirect } from "@tanstack/react-router";

// Inside AirSend the user is already signed in, so there is no landing page: the app starts at the dashboard.
export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard" });
	},
});
