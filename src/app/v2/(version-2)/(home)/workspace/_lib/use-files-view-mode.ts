"use client";

// The team Files page's view (grid / list / details), remembered in this browser.

import { useCallback, useEffect, useState } from "react";

export type FilesViewMode = "grid" | "list" | "details";

const KEY = "workspace:files:view";
const MODES: FilesViewMode[] = ["grid", "list", "details"];

const isMode = (v: unknown): v is FilesViewMode => MODES.includes(v as FilesViewMode);

export function useFilesViewMode(fallback: FilesViewMode = "list") {
  const [mode, setMode] = useState<FilesViewMode>(fallback);

  // Read after mount so server and client render the same first frame.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (isMode(saved)) setMode(saved);
    } catch {
      /* storage blocked */
    }
  }, []);

  const change = useCallback((next: string) => {
    if (!isMode(next)) return;
    setMode(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked */
    }
  }, []);

  return [mode, change] as const;
}
