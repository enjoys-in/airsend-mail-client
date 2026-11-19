import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/configure/storage")({
	component: () => <Outlet />,
});
