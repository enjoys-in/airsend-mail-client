"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { FILES_CSS_VERSION } from "@/app/v2/(version-2)/(home)/files/_lib/files-css-version";
import { nimbusPortalContainer } from "@/app/v2/(version-2)/(home)/files/_lib/portal-container";

// Fills the space below the AirSend header (3.5rem on mobile, 3rem from md up, same as the calendar page) so the page
// never overflows the host's scroll area.
const FRAME_HEIGHT = "h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)]";

// The Nimbus app is a client-only TanStack Router SPA (it reads `window` while the router is created), so it is loaded
// without SSR. TanStack Router owns every URL below /v2/files (see `_lib/base-path.ts`), hence the optional catch-all.
const NimbusApp = dynamic(() => import("@/app/v2/(version-2)/(home)/files/_lib/nimbus-app"), {
	ssr: false,
	loading: () => (
		<div className={`flex ${FRAME_HEIGHT} w-full items-center justify-center`}>
			<Loader2 className="size-6 animate-spin text-muted-foreground" />
		</div>
	),
});

// Nimbus's Tailwind v4 stylesheet is compiled separately (`npm run files:css`) because the host app is on Tailwind v3.
// It is scoped to `.nimbus-root` and attached only while this route is mounted.
const FILES_CSS_ID = "files-css";

function useNimbusStylesheet() {
	useEffect(() => {
		let link = document.getElementById(FILES_CSS_ID) as HTMLLinkElement | null;
		if (!link) {
			link = document.createElement("link");
			link.id = FILES_CSS_ID;
			link.rel = "stylesheet";
			link.href = `/files/files.css?v=${FILES_CSS_VERSION}`;
			document.head.appendChild(link);
		}
		return () => {
			document.getElementById(FILES_CSS_ID)?.remove();
		};
	}, []);
}

export default function FilesPage() {
	useNimbusStylesheet();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const setPortalHost = useCallback((element: HTMLDivElement | null) => {
		nimbusPortalContainer.current = element;
	}, []);

	return (
		<>
			{/* `contain: layout` makes Nimbus's `position: fixed` sidebar relative to this box rather than the window. */}
			<div className={`nimbus-root flex ${FRAME_HEIGHT} w-full flex-col overflow-y-auto overflow-x-hidden`} style={{ contain: "layout" }}>
				<NimbusApp />
			</div>
			{/* Popups (dialogs, menus, tooltips) portal here so they keep Nimbus's scoped styles. It lives on <body>, not in this
			    page: the page scrolls and clips, so a menu opened from the AirSend sidebar (outside it) would be cut off. */}
			{mounted ? createPortal(<div ref={setPortalHost} className="nimbus-root contents" />, document.body) : null}
		</>
	);
}
