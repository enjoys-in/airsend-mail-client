import { createBrowserHistory, type RouterHistory } from "@tanstack/react-router";

/**
 * History for a TanStack Router SPA mounted inside the Next.js app (Files, Tasks).
 *
 * Both routers want to own `window.history`: `createBrowserHistory` replaces `pushState`/`replaceState` with wrappers that notify
 * the router on EVERY call, including Next's own. Next updates the URL from a `useInsertionEffect` (HistoryUpdater), so the
 * wrapper ran the embedded router's subscribers (a store update) inside React's insertion phase:
 *   "useInsertionEffect must not schedule updates"
 * And the embedded router stamps a key into `history.state` the moment it is created; created at module load, that happens
 * before Next's own router has initialized:
 *   "Internal Next.js error: Router action dispatched before initialization"
 *
 * This gives the embedded router a private `history` facade: it patches the facade, not `window.history`, so Next's calls are
 * not intercepted, and the embedded router's own calls still reach the real `window.history` (through Next's patched methods,
 * as before). Navigation that Next starts inside the app (an AirSend sidebar link) is picked up by `syncEmbeddedHistory`, which
 * the host calls from an effect when Next's pathname changes. Create the router in an effect (after Next has mounted), not at
 * module scope.
 */
export function createEmbeddedHistory(): RouterHistory {
  const real = window.history;
  const facade = {
    get state() {
      return real.state;
    },
    get length() {
      return real.length;
    },
    pushState: (...args: Parameters<History["pushState"]>) => real.pushState(...args),
    replaceState: (...args: Parameters<History["replaceState"]>) => real.replaceState(...args),
    back: () => real.back(),
    forward: () => real.forward(),
    go: (delta?: number) => real.go(delta),
  };

  const host = new Proxy(window, {
    get(target, prop) {
      if (prop === "history") return facade;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  }) as unknown as Window;

  return createBrowserHistory({ window: host });
}

/**
 * Brings the embedded router in line with the browser URL after Next changed it. A no-op when they already match (the
 * embedded router's own navigations), so it is safe to call on every Next pathname change.
 */
export function syncEmbeddedHistory(history: RouterHistory): void {
  const now = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (history.location.href !== now) history.replace(now);
}
