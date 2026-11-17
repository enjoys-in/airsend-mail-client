"use client";

import { useMemo, useEffect, useCallback, useRef } from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { useCalendarContext } from "./event-calendar/calendar-context";

import {
  EventCalendar,
  type CalendarEvent,
  type EditScope,
} from "./event-calendar";

import { useCalDevStore } from "../_lib/caldev-store";
import type { CalDevEvent } from "../_lib/caldev-types";
import {
  expandEvents,
  isoNoMs,
  parseOccurrenceId,
  uiRangeToAPI,
  userTimeZone,
} from "../_lib/recurrence";
import { CalendarX2 } from "lucide-react";

/** Visible/fetched window: the current month ± 1 month. */
function windowFor(date: Date) {
  return {
    from: subMonths(startOfMonth(date), 1),
    to: addMonths(endOfMonth(date), 1),
  };
}

/** Zone to keep for a timed series (a fixed-UTC series gets the user's zone). */
function zoneFor(raw?: CalDevEvent): string {
  const tz = raw?.time_zone;
  return tz && tz !== "Etc/UTC" && tz !== "UTC" ? tz : userTimeZone();
}

export default function Component() {
  const { currentDate, isColorVisible } = useCalendarContext();

  // CalDev store — granular selectors for minimal re-renders
  const accountId = useCalDevStore((s) => s.accountId);
  const calendars = useCalDevStore((s) => s.calendars);
  const rawEvents = useCalDevStore((s) => s.rawEvents);
  const sessionLoading = useCalDevStore((s) => s.sessionLoading);
  const sessionError = useCalDevStore((s) => s.sessionError);
  const initSession = useCalDevStore((s) => s.initSession);
  const fetchCalendars = useCalDevStore((s) => s.fetchCalendars);
  const fetchEvents = useCalDevStore((s) => s.fetchEvents);
  const fetchSubscriptions = useCalDevStore((s) => s.fetchSubscriptions);
  const addEvent = useCalDevStore((s) => s.addEvent);
  const editEvent = useCalDevStore((s) => s.editEvent);
  const removeEvent = useCalDevStore((s) => s.removeEvent);
  const startLiveSync = useCalDevStore((s) => s.startLiveSync);
  const stopLiveSync = useCalDevStore((s) => s.stopLiveSync);

  // Initialize session once on mount (store-level guard prevents duplicates)
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initSession();
    }
  }, [initSession]);

  // Fetch calendars + subscriptions once accountId is available
  const dataFetchedRef = useRef(false);
  useEffect(() => {
    if (accountId && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      fetchCalendars();
      fetchSubscriptions();
    }
  }, [accountId, fetchCalendars, fetchSubscriptions]);

  // Live updates (other tabs, phones, CalDAV clients, invitations)
  useEffect(() => {
    if (!accountId) return;
    startLiveSync();
    return () => stopLiveSync();
  }, [accountId, startLiveSync, stopLiveSync]);

  // Fetch events when date range changes (month ± 1 buffer)
  // Store-level range caching prevents redundant API calls
  const { from, to } = useMemo(() => windowFor(currentDate), [currentDate]);
  useEffect(() => {
    if (!accountId) return;
    fetchEvents(from.toISOString(), to.toISOString());
  }, [accountId, from, to, fetchEvents]);

  // Build calendar color map (stable reference unless calendars change)
  const calColorMap = useMemo(
    () => new Map(calendars.map((c) => [c.id, c.color])),
    [calendars],
  );

  // CalDev returns one object per series — expand recurring series into
  // occurrences for the visible window, then apply the color filter.
  const visibleEvents = useMemo(() => {
    return expandEvents(rawEvents, (id) => calColorMap.get(id), from, to)
      .filter((e) => isColorVisible(e.color));
  }, [rawEvents, calColorMap, isColorVisible, from, to]);

  // Latest values for the handlers without re-creating them on every change
  const visibleRef = useRef(visibleEvents);
  visibleRef.current = visibleEvents;

  // Default calendar for new events (fallback when dialog doesn't specify)
  const defaultCalendarId = useMemo(() => {
    const def = calendars.find((c) => c.is_default && !c.is_readonly);
    return def?.id || calendars.find((c) => !c.is_readonly)?.id || "";
  }, [calendars]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleEventAdd = useCallback(
    async (event: CalendarEvent) => {
      // Use calendarId from event (set by dialog) or fall back to default
      const calId = event.calendarId || defaultCalendarId;
      await addEvent(event, calId);
    },
    [addEvent, defaultCalendarId],
  );

  const handleEventUpdate = useCallback(
    async (updated: CalendarEvent) => {
      const parsed = parseOccurrenceId(updated.id);
      const seriesId = updated.seriesId || parsed.seriesId;
      const key = updated.occurrenceKey || parsed.key;
      const raw = useCalDevStore.getState().rawEvents.find((e) => e.id === seriesId);
      const allDay = updated.allDay || false;
      const range = uiRangeToAPI(updated.start, updated.end, allDay);
      const scope: EditScope | undefined = updated.editScope;

      // ── One occurrence of a recurring series → recurrenceOverrides patch ──
      if (key && raw?.recurrence_rule && scope !== "series") {
        await editEvent(seriesId, {
          recurrence_overrides: {
            [key]: {
              start: range.start,
              end: range.end,
              title: updated.title,
              description: updated.description || "",
              location: updated.location || "",
            },
          },
        });
        return;
      }

      // ── Drag/resize of a single event → only the times change ──
      if (!key && scope === "occurrence") {
        await editEvent(seriesId, {
          dtstart: range.start,
          dtend: range.end,
          all_day: allDay,
          ...(!allDay && { time_zone: zoneFor(raw) }),
        });
        return;
      }

      // ── Whole event / whole series ──
      let dtstart = range.start;
      let dtend = range.end;
      if (key && raw) {
        // Edited from an occurrence: move the series by the same amount the
        // occurrence moved, keeping the series' first date (exceptions kept).
        const before = visibleRef.current.find((e) => e.id === updated.id);
        const prevStart = before
          ? new Date(uiRangeToAPI(before.start, before.end, before.allDay || false).start).getTime()
          : new Date(range.start).getTime();
        const delta = new Date(range.start).getTime() - prevStart;
        const duration = new Date(range.end).getTime() - new Date(range.start).getTime();
        const seriesStart = new Date(raw.dtstart).getTime() + delta;
        dtstart = isoNoMs(seriesStart);
        dtend = isoNoMs(seriesStart + duration);
      }

      await editEvent(seriesId, {
        summary: updated.title,
        description: updated.description || "",
        location: updated.location || "",
        dtstart,
        dtend,
        all_day: allDay,
        ...(!allDay && { time_zone: zoneFor(raw) }),
        ...(updated.calendarId && { calendar_id: updated.calendarId }),
        // "" removes recurrence; participants replace the guest list
        recurrence_rule: updated.recurrenceRule || "",
        attendees: (updated.attendees as any) || [],
        ...(updated.categories && { categories: updated.categories }),
        ...(updated.status && { status: updated.status as CalDevEvent["status"] }),
      });
    },
    [editEvent],
  );

  const handleEventDelete = useCallback(
    async (eventId: string, scope?: EditScope) => {
      const { seriesId, key } = parseOccurrenceId(eventId);
      if (key && scope === "occurrence") {
        // Cancel just this occurrence (UI_GUIDE §6)
        await editEvent(seriesId, { recurrence_overrides: { [key]: { excluded: true } } });
        return;
      }
      // Whole event (every occurrence); guests get a cancellation
      await removeEvent(seriesId);
    },
    [editEvent, removeEvent],
  );

  // If session failed, show fallback — don't redirect to auth
  if (sessionError && !sessionLoading && !accountId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10 p-8">
        <CalendarX2 className="h-16 w-16 text-muted-foreground/50" />
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            Calendar has not been configured for your account
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Please contact your administrator to set up calendar access, or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EventCalendar
      events={visibleEvents}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
    />
  );
}
