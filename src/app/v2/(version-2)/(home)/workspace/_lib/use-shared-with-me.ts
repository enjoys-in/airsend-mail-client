"use client";

// Files other people in the organization shared with the signed-in user (files service).

import { useCallback, useEffect, useRef, useState } from "react";
import { filesErrorMessage, listSharedWithMe, type SharedWithMe } from "./files-api";

export function useSharedWithMe(enabled: boolean) {
  const [items, setItems] = useState<SharedWithMe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Loaded at least once (auto refresh only reloads a list that was opened). */
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  /** Resolves to false when the request failed (the error is kept in `error`). */
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listSharedWithMe());
      loadedRef.current = true;
      setLoaded(true);
      return true;
    } catch (err) {
      setError(filesErrorMessage(err, "Could not load files shared with you"));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && !loadedRef.current) void reload();
  }, [enabled, reload]);

  return { items, loading, error, loaded, reload };
}
