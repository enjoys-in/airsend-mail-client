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
} from "./event-calendar";

import { useCalDevStore } from "../_lib/caldev-store";
import {
  toCalendarEvent,
} from "../_lib/caldev-types";
import { CalendarX2 } from "lucide-react";

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

  // Fetch events when date range changes (month ± 1 buffer)
  // Store-level range caching prevents redundant API calls
  useEffect(() => {
    if (!accountId) return;
    const after = subMonths(startOfMonth(currentDate), 1).toISOString();
    const before = addMonths(endOfMonth(currentDate), 1).toISOString();
    fetchEvents(after, before);
  }, [accountId, currentDate, fetchEvents]);

  // Build calendar color map (stable reference unless calendars change)
  const calColorMap = useMemo(
    () => new Map(calendars.map((c) => [c.id, c.color])),
    [calendars],
  );

  // Map raw events → UI CalendarEvent, apply color visibility filter
  const visibleEvents = useMemo(() => {
    return rawEvents
      .map((e) => toCalendarEvent(e, calColorMap.get(e.calendar_id)))
      .filter((e) => isColorVisible(e.color));
  }, [rawEvents, calColorMap, isColorVisible]);

  // Default calendar for new events (fallback when dialog doesn't specify)
  const defaultCalendarId = useMemo(() => {
    const def = calendars.find((c) => c.is_default);
    return def?.id || calendars[0]?.id || "";
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
    async (updatedEvent: CalendarEvent) => {
      await editEvent(updatedEvent.id, {
        summary: updatedEvent.title,
        description: updatedEvent.description || "",
        location: updatedEvent.location || "",
        dtstart: updatedEvent.start.toISOString(),
        dtend: updatedEvent.end.toISOString(),
        all_day: updatedEvent.allDay || false,
        // Pass CalDev-specific metadata if available
        ...(updatedEvent.calendarId && { calendar_id: updatedEvent.calendarId }),
        ...(updatedEvent.attendees && { attendees: updatedEvent.attendees as any }),
        ...(updatedEvent.categories && { categories: updatedEvent.categories }),
        ...(updatedEvent.recurrenceRule && { recurrence_rule: updatedEvent.recurrenceRule }),
        ...(updatedEvent.status && { status: updatedEvent.status as any }),
      });
    },
    [editEvent],
  );

  const handleEventDelete = useCallback(
    async (eventId: string) => {
      await removeEvent(eventId);
    },
    [removeEvent],
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
