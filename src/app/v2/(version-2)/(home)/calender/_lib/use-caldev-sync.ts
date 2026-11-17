"use client";

// ============================================================================
// useCalDevSync — keeps CalDev data live for the whole app.
//
// Mount ONCE in a persistent layout (next to the mail socket). It
//   • loads the session, calendars, subscriptions and the upcoming window once,
//   • opens a single SSE stream (/jmap/eventsource) that stays open across route
//     changes, so entering the calendar page costs no API calls,
//   • on a `state` frame fetches only the delta (CalendarEvent/changes),
//   • resets when the signed-in account changes.
// ============================================================================

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useCalDevStore } from "./caldev-store";

/** If the stream is down, a tab regaining focus syncs at most this often. */
const FOCUS_SYNC_MIN_AGE_MS = 60_000;

export function useCalDevSync() {
  const { isLoaded, canAccessCalendar } = useFeatureAccess();
  const email = useAppSelector((s) => s.accounts?.currAccount?.email);
  const mid = useAppSelector((s) => s.accounts?.currAccount?.mid);

  // Account switch: drop the previous account's calendars/events before loading new ones.
  const lastEmail = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastEmail.current && email && lastEmail.current !== email) {
      useCalDevStore.getState().reset();
    }
    if (email) lastEmail.current = email;
  }, [email]);

  // Bootstrap + live stream while the feature is on and the account is known.
  useEffect(() => {
    if (!isLoaded || !canAccessCalendar || !email || !mid) return;
    const { bootstrap, stopLiveSync } = useCalDevStore.getState();
    bootstrap();
    return () => stopLiveSync();
  }, [isLoaded, canAccessCalendar, email, mid]);

  // Fallback when the stream can't connect (proxy, CORS, offline): catch up on focus.
  useEffect(() => {
    if (!isLoaded || !canAccessCalendar) return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const st = useCalDevStore.getState();
      if (st.accountId && !st.liveConnected) st.syncEventChanges(FOCUS_SYNC_MIN_AGE_MS);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoaded, canAccessCalendar]);
}
