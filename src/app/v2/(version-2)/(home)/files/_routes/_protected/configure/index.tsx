import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/configure/")({
	beforeLoad: () => {
		throw redirect({ to: "/configure/storage", replace: true });
	},
});
