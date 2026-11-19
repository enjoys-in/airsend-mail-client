import { useSyncExternalStore } from "react";

// A tiny external store for "the AirSend sidebar panel an embedded app renders its sidebar into".
//
// On /v2/tasks and /v2/files the AirSend sidebar's secondary panel hosts the embedded app's own
// sidebar content, like the other modules' panels. The panel registers its container element here;
// the embedded app portals into it. A portal keeps the app's React context (router, query client),
// which a separately rendered host component would not have.
//
// `ready` flips to true once the embedded app has resolved its first route. Until then the panel
// shows a skeleton; after that an empty panel simply means "this page has no sidebar" (for example
// the Files setup screen), instead of a skeleton that never goes away.
//
// Plain TypeScript with no embedded-app imports, so the host can import it without pulling the app
// (or its stylesheet) into the main bundle.

export function createSlotStore() {
  let slot: HTMLElement | null = null;
  let ready = false;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    setSlot(element: HTMLElement | null) {
      if (slot === element) return;
      slot = element;
      emit();
    },
    setReady(value: boolean) {
      if (ready === value) return;
      ready = value;
      emit();
    },
    /** The panel element to render into, or null when there is none. */
    useSlot: () =>
      useSyncExternalStore(
        subscribe,
        () => slot,
        () => null,
      ),
    useReady: () =>
      useSyncExternalStore(
        subscribe,
        () => ready,
        () => false,
      ),
  };
}
