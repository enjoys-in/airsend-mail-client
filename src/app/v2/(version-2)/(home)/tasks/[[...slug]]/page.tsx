"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// The Kaneo app is a client-only TanStack Router SPA (it reads `window` while the
// router is created), so it is loaded without SSR. TanStack Router owns every URL
// below /v2/tasks (see `_lib/base-path.ts`), which is why this is an optional catch-all.
const KaneoApp = dynamic(() => import("@tasks/_lib/kaneo-app"), {
  ssr: false,
  loading: () => (
    <div className="flex h-svh w-full items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

// Kaneo's Tailwind v4 stylesheet is compiled separately (`bun run tasks:css`) because the
// host app is on Tailwind v3. It is attached only while this route is mounted.
const KANEO_CSS_ID = "kaneo-tasks-css";

function useKaneoStylesheet() {
  useEffect(() => {
    let link = document.getElementById(KANEO_CSS_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = KANEO_CSS_ID;
      link.rel = "stylesheet";
      link.href = "/tasks/kaneo.css";
      document.head.appendChild(link);
    }
    return () => {
      document.getElementById(KANEO_CSS_ID)?.remove();
    };
  }, []);
}

export default function TasksPage() {
  useKaneoStylesheet();

  return (
    <div className="flex h-svh w-full flex-row overflow-hidden bg-background">
      <KaneoApp />
    </div>
  );
}
