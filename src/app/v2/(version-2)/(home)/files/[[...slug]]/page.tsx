"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { NIMBUS_CSS_VERSION } from "@nimbus/_lib/nimbus-css-version";

// The Nimbus app is a client-only TanStack Router SPA (it reads `window` while the router is created), so it is loaded
// without SSR. TanStack Router owns every URL below /v2/files (see `_lib/base-path.ts`), hence the optional catch-all.
const NimbusApp = dynamic(() => import("@nimbus/_lib/nimbus-app"), {
	ssr: false,
	loading: () => (
		<div className="flex h-svh w-full items-center justify-center">
			<Loader2 className="size-6 animate-spin text-muted-foreground" />
		</div>
	),
});

// Nimbus's Tailwind v4 stylesheet is compiled separately (`npm run files:css`) because the host app is on Tailwind v3.
// It is scoped to `.nimbus-root` and attached only while this route is mounted.
const NIMBUS_CSS_ID = "nimbus-files-css";

function useNimbusStylesheet() {
	useEffect(() => {
		let link = document.getElementById(NIMBUS_CSS_ID) as HTMLLinkElement | null;
		if (!link) {
			link = document.createElement("link");
			link.id = NIMBUS_CSS_ID;
			link.rel = "stylesheet";
			link.href = `/files/nimbus.css?v=${NIMBUS_CSS_VERSION}`;
			document.head.appendChild(link);
		}
		return () => {
			document.getElementById(NIMBUS_CSS_ID)?.remove();
		};
	}, []);
}

export default function FilesPage() {
	useNimbusStylesheet();

	return (
		<div className="nimbus-root flex h-svh w-full flex-col overflow-auto">
			<NimbusApp />
		</div>
	);
}
