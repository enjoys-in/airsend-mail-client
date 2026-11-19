import { useSyncExternalStore } from "react";

// On /v2/tasks the AirSend sidebar's secondary panel hosts Kaneo's sidebar content, the same way
// Files and Workspace plug into it. The panel registers its container here; Kaneo's AppSidebar
// portals into it. A portal keeps Kaneo's React context (router, query client, i18n), which a
// separately rendered host component would not have.
//
// This module is plain TypeScript with no Kaneo imports, so the host can import it without
// pulling the Kaneo app (or its stylesheet) into the main bundle.

let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();

export function setTasksSidebarSlot(element: HTMLElement | null) {
  if (slot === element) return;
  slot = element;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The AirSend sidebar panel Kaneo's sidebar renders into, or null when there isn't one. */
export function useTasksSidebarSlot() {
  return useSyncExternalStore(
    subscribe,
    () => slot,
    () => null,
  );
}
