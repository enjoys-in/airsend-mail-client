"use client";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createEmbeddedHistory, syncEmbeddedHistory } from "@/components/common/embedded-history";
import { routeTree } from "../_routeTree.gen";
import { FILES_BASE_PATH } from "./base-path";

// The router is mounted under /v2/files inside the AirSend app. It is created in an effect, not at module load: creating it
// touches `window.history`, which must wait until Next's own router has initialized, and it gets a private history so Next's
// URL updates (made inside an insertion effect) do not run this router's subscribers (see components/common/embedded-history.ts).
function buildRouter() {
	return createRouter({
		routeTree,
		basepath: FILES_BASE_PATH,
		history: createEmbeddedHistory(),
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		context: undefined!,
		// defaultPendingComponent: () => LoadingStatePage,
	});
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof buildRouter>;
	}
}

export default function NimbusApp() {
	const [router, setRouter] = useState<ReturnType<typeof buildRouter> | null>(null);

	useEffect(() => {
		const created = buildRouter();
		setRouter(created);
		return () => created.history.destroy();
	}, []);

	// A navigation Next starts inside the app (e.g. an AirSend sidebar link to /v2/files/...) changes the URL without the
	// embedded router hearing about it any more; this passes it on.
	const pathname = usePathname();
	useEffect(() => {
		if (router) syncEmbeddedHistory(router.history);
	}, [router, pathname]);

	return router ? <RouterProvider router={router} /> : null;
}
