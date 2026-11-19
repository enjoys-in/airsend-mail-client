"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { kaneoPortalContainer } from "@tasks/_lib/portal-container";

// Fills the space below the AirSend header (3.5rem on mobile, 3rem from md up, same as the
// calendar page) so the page never overflows the host's scroll area.
const FRAME_HEIGHT = "h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)]";

function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex ${FRAME_HEIGHT} w-full items-center justify-center`}
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// The Kaneo app is a client-only TanStack Router SPA (it reads `window` while the
// router is created), so it is loaded without SSR. TanStack Router owns every URL
// below /v2/tasks (see `_lib/base-path.ts`), which is why this is an optional catch-all.
const KaneoApp = dynamic(() => import("@tasks/_lib/kaneo-app"), {
  ssr: false,
  loading: Loading,
});

// Kaneo's Tailwind v4 stylesheet is compiled separately (`bun run tasks:css`) because the
// host app is on Tailwind v3. It is scoped to `.kaneo-root`, and attached only while this route
// is mounted. Returns true once it has loaded, so the app never paints unstyled.
const KANEO_CSS_ID = "kaneo-tasks-css";

function useKaneoStylesheet() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let link = document.getElementById(KANEO_CSS_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = KANEO_CSS_ID;
      link.rel = "stylesheet";
      link.href = "/tasks/kaneo.css";
      document.head.appendChild(link);
    }
    if (link.sheet) {
      setReady(true);
    } else {
      // A failed load still renders the app (unstyled) instead of hanging on the spinner.
      const done = () => setReady(true);
      link.addEventListener("load", done, { once: true });
      link.addEventListener("error", done, { once: true });
    }
    return () => {
      document.getElementById(KANEO_CSS_ID)?.remove();
    };
  }, []);

  return ready;
}

export default function TasksPage() {
  const ready = useKaneoStylesheet();
  const setPortalHost = useCallback((el: HTMLDivElement | null) => {
    kaneoPortalContainer.current = el;
  }, []);

  return (
    <>
      {/* `contain: layout` makes Kaneo's `position: fixed` sidebar relative to this box rather
          than the window, so it doesn't paint over the AirSend header and sidebar. */}
      <div
        className={`kaneo-root flex ${FRAME_HEIGHT} w-full flex-row overflow-hidden`}
        style={{ contain: "layout" }}
      >
        {ready ? <KaneoApp /> : <Loading />}
      </div>
      {/* Popups (dialogs, menus, tooltips, toasts) portal here so they keep Kaneo's scoped
          styles. `display: contents` keeps the host out of the layout. */}
      <div ref={setPortalHost} className="kaneo-root contents" />
    </>
  );
}
