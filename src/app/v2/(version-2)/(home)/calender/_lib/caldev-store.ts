// ============================================================================
// CalDev Zustand Store — Calendar + Events state with API integration
// ============================================================================

import { create } from "zustand";
import { toast } from "sonner";

import type {
  CalDevCalendar,
  CalDevEvent,
  CalDevSubscription,
  CalDevAppPassword,
  CreateEventPayload,
} from "./caldev-types";
import {
  toCalendarEvent,
  toCreateEventPayload,
  buildFullEvent,
} from "./caldev-types";
import type { CalendarEvent } from "../_components/event-calendar/types";
import * as api from "./caldev-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalDevState {
  // Session
  accountId: string;
  sessionLoading: boolean;
  sessionError: string | null;

  // Calendars
  calendars: CalDevCalendar[];
  calendarsLoading: boolean;

  // Events (raw from API)
  rawEvents: CalDevEvent[];
  eventsLoading: boolean;

  // Subscriptions
  subscriptions: CalDevSubscription[];
  subscriptionsLoading: boolean;

  // App Passwords
  appPasswords: CalDevAppPassword[];

  // Sync state
  eventsSyncState: string;
  lastFetchRange: { after: string; before: string } | null;

  // ---------- Actions ----------

  // Init
  initSession: () => Promise<void>;

  // Calendars
  fetchCalendars: () => Promise<void>;
  addCalendar: (
    name: string,
    color?: string,
    description?: string,
  ) => Promise<CalDevCalendar | null>;
  editCalendar: (
    id: string,
    updates: {
      name?: string;
      color?: string;
      description?: string;
      is_visible?: boolean;
    },
  ) => Promise<boolean>;
  removeCalendar: (id: string) => Promise<boolean>;

  // Events
  fetchEvents: (after: string, before: string, force?: boolean) => Promise<void>;
  addEvent: (
    uiEvent: CalendarEvent,
    calendarId: string,
  ) => Promise<CalDevEvent | null>;
  editEvent: (
    eventId: string,
    updates: Partial<CalDevEvent>,
  ) => Promise<boolean>;
  removeEvent: (eventId: string) => Promise<boolean>;
  moveEvent: (
    eventId: string,
    dtstart: string,
    dtend: string,
  ) => Promise<boolean>;

  // Computed: UI CalendarEvents
  getVisibleEvents: (visibleCalendarIds: string[]) => CalendarEvent[];

  // Subscriptions
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (
    sourceUrl: string,
    displayName?: string,
    color?: string,
  ) => Promise<void>;
  removeSubscription: (id: string, deleteCalendar?: boolean) => Promise<void>;
  triggerSync: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState = {
  accountId: "",
  sessionLoading: false,
  sessionError: null as string | null,
  calendars: [] as CalDevCalendar[],
  calendarsLoading: false,
  rawEvents: [] as CalDevEvent[],
  eventsLoading: false,
  subscriptions: [] as CalDevSubscription[],
  subscriptionsLoading: false,
  appPasswords: [] as CalDevAppPassword[],
  eventsSyncState: "",
  lastFetchRange: null as { after: string; before: string } | null,
};

export const useCalDevStore = create<CalDevState>()((set, get) => ({
  ...initialState,

  // -----------------------------------------------------------------------
  // Session — guarded: only runs once, skips if already initialized or in-flight
  // -----------------------------------------------------------------------
  initSession: async () => {
    const { accountId, sessionLoading } = get();
    if (accountId || sessionLoading) return; // already done or in-flight

    set({ sessionLoading: true, sessionError: null });
    try {
      const session = await api.getSession();
      const id = api.getAccountId(session);
      set({ accountId: id, sessionLoading: false });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to init CalDev session";
      set({ sessionError: msg, sessionLoading: false });
    }
  },

  // -----------------------------------------------------------------------
  // Calendars
  // -----------------------------------------------------------------------
  fetchCalendars: async () => {
    const { accountId, calendarsLoading } = get();
    if (!accountId || calendarsLoading) return;
    set({ calendarsLoading: true });
    try {
      const calendars = await api.getCalendars(accountId);
      set({ calendars, calendarsLoading: false });
    } catch {
      set({ calendarsLoading: false });
      toast.error("Failed to load calendars");
    }
  },

  addCalendar: async (name, color, description) => {
    const { accountId } = get();
    if (!accountId) return null;
    try {
      const created = await api.createCalendar(accountId, {
        name,
        color,
        description,
      });
      if (created) {
        set((s) => ({ calendars: [...s.calendars, created] }));
        toast.success(`Calendar "${name}" created`);
      }
      return created;
    } catch {
      toast.error("Failed to create calendar");
      return null;
    }
  },

  editCalendar: async (id, updates) => {
    const { accountId } = get();
    if (!accountId) return false;
    try {
      const ok = await api.updateCalendar(accountId, id, updates);
      if (ok) {
        set((s) => ({
          calendars: s.calendars.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        }));
      }
      return ok;
    } catch {
      toast.error("Failed to update calendar");
      return false;
    }
  },

  removeCalendar: async (id) => {
    const { accountId } = get();
    if (!accountId) return false;
    try {
      const ok = await api.deleteCalendar(accountId, id);
      if (ok) {
        set((s) => ({
          calendars: s.calendars.filter((c) => c.id !== id),
          rawEvents: s.rawEvents.filter((e) => e.calendar_id !== id),
        }));
        toast.success("Calendar deleted");
      }
      return ok;
    } catch {
      toast.error("Failed to delete calendar");
      return false;
    }
  },

  // -----------------------------------------------------------------------
  // Events — with range caching to avoid redundant fetches
  // -----------------------------------------------------------------------
  fetchEvents: async (after, before, force = false) => {
    const { accountId, eventsLoading, lastFetchRange } = get();
    if (!accountId || eventsLoading) return;

    // Skip if requested range is within the already-fetched range
    if (
      !force &&
      lastFetchRange &&
      after >= lastFetchRange.after &&
      before <= lastFetchRange.before
    ) {
      return;
    }

    set({ eventsLoading: true });
    try {
      const events = await api.queryAndFetchEvents(accountId, {
        after,
        before,
      });

      // Merge with existing events to avoid losing data from other ranges
      const existingEvents = get().rawEvents;
      const newIds = new Set(events.map((e) => e.id));
      const retained = existingEvents.filter((e) => !newIds.has(e.id));

      // Expand the cached range to cover both old and new
      const mergedRange = lastFetchRange
        ? {
            after: after < lastFetchRange.after ? after : lastFetchRange.after,
            before: before > lastFetchRange.before ? before : lastFetchRange.before,
          }
        : { after, before };

      set({
        rawEvents: [...retained, ...events],
        eventsLoading: false,
        lastFetchRange: mergedRange,
      });
    } catch {
      set({ eventsLoading: false });
      toast.error("Failed to load events");
    }
  },

  addEvent: async (uiEvent, calendarId) => {
    const { accountId } = get();
    if (!accountId) return null;
    try {
      const payload = toCreateEventPayload(uiEvent, calendarId);
      const created = await api.createEvent(accountId, payload);
      if (created) {
        // Merge payload + server response for a complete CalDevEvent
        const fullEvent = buildFullEvent(payload, created);
        set((s) => ({ rawEvents: [...s.rawEvents, fullEvent] }));
        return fullEvent;
      }
      return null;
    } catch {
      toast.error("Failed to create event");
      return null;
    }
  },

  editEvent: async (eventId, updates) => {
    const { accountId } = get();
    if (!accountId) return false;

    // Optimistic update
    const prev = get().rawEvents;
    set((s) => ({
      rawEvents: s.rawEvents.map((e) =>
        e.id === eventId ? { ...e, ...updates } : e,
      ),
    }));

    try {
      const ok = await api.updateEvent(accountId, eventId, updates);
      if (!ok) {
        // Revert on failure
        set({ rawEvents: prev });
        toast.error("Failed to update event");
      }
      return ok;
    } catch {
      set({ rawEvents: prev });
      toast.error("Failed to update event");
      return false;
    }
  },

  removeEvent: async (eventId) => {
    const { accountId } = get();
    if (!accountId) return false;

    // Optimistic delete
    const prev = get().rawEvents;
    set((s) => ({
      rawEvents: s.rawEvents.filter((e) => e.id !== eventId),
    }));

    try {
      const ok = await api.deleteEvent(accountId, eventId);
      if (!ok) {
        set({ rawEvents: prev });
        toast.error("Failed to delete event");
      }
      return ok;
    } catch {
      set({ rawEvents: prev });
      toast.error("Failed to delete event");
      return false;
    }
  },

  moveEvent: async (eventId, dtstart, dtend) => {
    const { accountId } = get();
    if (!accountId) return false;

    // Optimistic move
    const prev = get().rawEvents;
    set((s) => ({
      rawEvents: s.rawEvents.map((e) =>
        e.id === eventId ? { ...e, dtstart, dtend } : e,
      ),
    }));

    try {
      const ok = await api.updateEvent(accountId, eventId, { dtstart, dtend });
      if (!ok) {
        set({ rawEvents: prev });
        toast.error("Failed to move event");
      }
      return ok;
    } catch {
      set({ rawEvents: prev });
      toast.error("Failed to move event");
      return false;
    }
  },

  // -----------------------------------------------------------------------
  // Computed: map raw events → UI CalendarEvents with calendar colors
  // -----------------------------------------------------------------------
  getVisibleEvents: (visibleCalendarIds) => {
    const { rawEvents, calendars } = get();
    const calMap = new Map(calendars.map((c) => [c.id, c]));

    return rawEvents
      .filter((e) => visibleCalendarIds.includes(e.calendar_id))
      .map((e) => {
        const cal = calMap.get(e.calendar_id);
        return toCalendarEvent(e, cal?.color);
      });
  },

  // -----------------------------------------------------------------------
  // Subscriptions
  // -----------------------------------------------------------------------
  fetchSubscriptions: async () => {
    const { subscriptionsLoading } = get();
    if (subscriptionsLoading) return;
    set({ subscriptionsLoading: true });
    try {
      const subs = await api.getSubscriptions();
      set({ subscriptions: subs, subscriptionsLoading: false });
    } catch {
      set({ subscriptionsLoading: false });
      toast.error("Failed to load subscriptions");
    }
  },

  addSubscription: async (sourceUrl, displayName, color) => {
    try {
      const { subscription } = await api.createSubscription({
        source_url: sourceUrl,
        display_name: displayName,
        color,
      });
      set((s) => ({
        subscriptions: [...s.subscriptions, subscription],
      }));
      toast.success("Subscription added — syncing in background");
      // Re-fetch calendars since subscription auto-creates a calendar
      get().fetchCalendars();
    } catch {
      toast.error("Failed to add subscription");
    }
  },

  removeSubscription: async (id, deleteCalendar = false) => {
    try {
      await api.deleteSubscription(id, deleteCalendar);
      set((s) => ({
        subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
      }));
      toast.success("Subscription removed");
      if (deleteCalendar) {
        get().fetchCalendars();
      }
    } catch {
      toast.error("Failed to remove subscription");
    }
  },

  triggerSync: async (id) => {
    try {
      const updated = await api.syncSubscription(id);
      set((s) => ({
        subscriptions: s.subscriptions.map((sub) =>
          sub.id === id ? { ...sub, ...updated } : sub,
        ),
      }));
      toast.success("Sync completed");
    } catch {
      toast.error("Sync failed");
    }
  },

  // -----------------------------------------------------------------------
  // Reset
  // -----------------------------------------------------------------------
  reset: () => set(initialState),
}));
