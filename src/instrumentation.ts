/**
 * Next.js Instrumentation hook.
 *
 * Node.js v22+ exposes a global `localStorage` object, but without the
 * `--localstorage-file` flag pointing to a valid path the standard
 * Storage methods (getItem, setItem, …) are undefined.  Libraries like
 * `next-themes` call `localStorage.getItem()` during the initial
 * `useState` resolver which runs on the server during SSR and therefore
 * crashes with "localStorage.getItem is not a function".
 *
 * This shim replaces the broken server-side `localStorage` with a
 * spec-compliant in-memory implementation so SSR can proceed safely.
 */
export function register() {
  if (typeof window === "undefined") {
    // Only patch on the server
    const g = globalThis as Record<string, unknown>;

    const needsPatch =
      typeof g.localStorage !== "undefined" &&
      typeof (g.localStorage as Storage)?.getItem !== "function";

    if (needsPatch) {
      const store = new Map<string, string>();

      g.localStorage = {
        getItem(key: string) {
          return store.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          store.set(key, String(value));
        },
        removeItem(key: string) {
          store.delete(key);
        },
        clear() {
          store.clear();
        },
        key(index: number) {
          return [...store.keys()][index] ?? null;
        },
        get length() {
          return store.size;
        },
      } as Storage;
    }
  }
}
