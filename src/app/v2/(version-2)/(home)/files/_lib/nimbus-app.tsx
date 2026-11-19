"use client";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "../_routeTree.gen";
import { FILES_BASE_PATH } from "./base-path";

// Create a new router instance. It is mounted under /v2/files inside the AirSend app.
const router = createRouter({
	routeTree,
	basepath: FILES_BASE_PATH,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	context: undefined!,
	// defaultPendingComponent: () => LoadingStatePage,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export default function NimbusApp() {
	return <RouterProvider router={router} />;
}
