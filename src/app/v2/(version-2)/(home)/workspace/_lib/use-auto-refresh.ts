"use client";

// Runs `fn` once now (and again whenever `key` changes), then every `ms` while the page is open.
// Ticks are skipped while the tab is hidden; if one was skipped, `fn` runs once when the tab is
// visible again. Always calls the latest `fn`, so callers need not memoize it.

import { useEffect, useRef } from "react";

export function useAutoRefresh(fn: () => unknown, ms: number, key?: unknown) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let missed = false;
    const run = () => void Promise.resolve(fnRef.current()).catch(() => {});
    const hidden = () => document.visibilityState === "hidden";

    run();
    const timer = window.setInterval(() => {
      if (hidden()) missed = true;
      else run();
    }, ms);
    const onVisibility = () => {
      if (hidden() || !missed) return;
      missed = false;
      run();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ms, key]);
}
