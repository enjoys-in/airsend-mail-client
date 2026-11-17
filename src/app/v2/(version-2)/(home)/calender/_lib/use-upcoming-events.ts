"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalDevStore } from "./caldev-store";
import { expandEvents } from "./recurrence";
import type { CalendarEvent } from "../_components/event-calendar/types";

/** Re-render on an interval so "now" based lists drop finished meetings. */
function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

interface Options {
  /** how many to return (default 3) */
  limit?: number;
  /** look-ahead in days (default 30 — the window loaded at start-up) */
  horizonDays?: number;
  /** all-day items (holidays, birthdays) are not meetings: excluded by default */
  includeAllDay?: boolean;
}

/**
 * The next few events/meetings from the CalDev store, with recurring series
 * expanded and finished/cancelled ones dropped. Updates live as the store does
 * (SSE delta sync) and every minute as time passes.
 */
export function useUpcomingEvents({
  limit = 3,
  horizonDays = 30,
  includeAllDay = false,
}: Options = {}): CalendarEvent[] {
  const rawEvents = useCalDevStore((s) => s.rawEvents);
  const calendars = useCalDevStore((s) => s.calendars);
  const now = useNow(60_000);

  return useMemo(() => {
    const colorOf = new Map(calendars.map((c) => [c.id, c.color]));
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + horizonDays);

    return expandEvents(rawEvents, (id) => colorOf.get(id), dayStart, horizon)
      .filter(
        (e) =>
          e.end >= now &&
          e.status !== "CANCELLED" &&
          (includeAllDay || !e.allDay) &&
          !String(e.id).startsWith("temp-"),
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  }, [rawEvents, calendars, now, limit, horizonDays, includeAllDay]);
}
