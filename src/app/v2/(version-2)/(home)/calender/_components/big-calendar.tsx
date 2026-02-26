"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
} from "date-fns";
import { useCalendarContext } from "./event-calendar/calendar-context";

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "./event-calendar";

import { useCalDevStore } from "../_lib/caldev-store";
import {
  hexToEventColor,
  EVENT_COLOR_HEX,
  toCalendarEvent,
  type CalDevEvent,
} from "../_lib/caldev-types";

// Fallback etiquettes (used when CalDev is not reachable)
export const etiquettes = [
  {
    id: "my-events",
    name: "My Events",
    color: "emerald" as EventColor,
    isActive: true,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    color: "orange" as EventColor,
    isActive: true,
  },
  {
    id: "interviews",
    name: "Interviews",
    color: "violet" as EventColor,
    isActive: true,
  },
  {
    id: "events-planning",
    name: "Events Planning",
    color: "blue" as EventColor,
    isActive: true,
  },
  {
    id: "holidays",
    name: "Holidays",
    color: "rose" as EventColor,
    isActive: true,
  },
];

export default function Component() {
  const { currentDate, isColorVisible } = useCalendarContext();

  // CalDev store
  const accountId = useCalDevStore((s) => s.accountId);
  const calendars = useCalDevStore((s) => s.calendars);
  const rawEvents = useCalDevStore((s) => s.rawEvents);
  const eventsLoading = useCalDevStore((s) => s.eventsLoading);
  const initSession = useCalDevStore((s) => s.initSession);
  const fetchCalendars = useCalDevStore((s) => s.fetchCalendars);
  const fetchEvents = useCalDevStore((s) => s.fetchEvents);
  const addEvent = useCalDevStore((s) => s.addEvent);
  const editEvent = useCalDevStore((s) => s.editEvent);
  const removeEvent = useCalDevStore((s) => s.removeEvent);
  const moveEvent = useCalDevStore((s) => s.moveEvent);

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Fetch calendars once accountId is available
  useEffect(() => {
    if (accountId) {
      fetchCalendars();
    }
  }, [accountId, fetchCalendars]);

  // Fetch events when date range changes (month ± 1 buffer)
  useEffect(() => {
    if (!accountId) return;
    const after = subMonths(startOfMonth(currentDate), 1).toISOString();
    const before = addMonths(endOfMonth(currentDate), 1).toISOString();
    fetchEvents(after, before);
  }, [accountId, currentDate, fetchEvents]);

  // Build calendar color map
  const calColorMap = useMemo(
    () => new Map(calendars.map((c) => [c.id, c.color])),
    [calendars],
  );

  // Map raw events → UI CalendarEvent, apply color visibility
  const visibleEvents = useMemo(() => {
    return rawEvents
      .map((e) => toCalendarEvent(e, calColorMap.get(e.calendar_id)))
      .filter((e) => isColorVisible(e.color));
  }, [rawEvents, calColorMap, isColorVisible]);

  // Default calendar for new events
  const defaultCalendarId = useMemo(() => {
    const def = calendars.find((c) => c.is_default);
    return def?.id || calendars[0]?.id || "";
  }, [calendars]);

  // Handlers
  const handleEventAdd = useCallback(
    async (event: CalendarEvent) => {
      await addEvent(event, defaultCalendarId);
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
