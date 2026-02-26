// ============================================================================
// CalDev Zustand Store — Calendar + Events state with API integration
// ============================================================================

import { create } from "zustand";
import { startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

import type {
  CalDevCalendar,
  CalDevEvent,
  CalDevSubscription,
  CalDevAppPassword,
} from "./caldev-types";
import { toCalendarEvent, toCreateEventPayload } from "./caldev-types";
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
    updates: { name?: string; color?: string; description?: string; is_visible?: boolean },
  ) => Promise<boolean>;
  removeCalendar: (id: string) => Promise<boolean>;

  // Events
  fetchEvents: (after: string, before: string) => Promise<void>;
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
  // Session
  // -----------------------------------------------------------------------
  initSession: async () => {
    set({ sessionLoading: true, sessionError: null });
    try {
      const session = await api.getSession();
      const accountId = api.getAccountId(session);
      set({ accountId, sessionLoading: false });
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
    const { accountId } = get();
    if (!accountId) return;
    set({ calendarsLoading: true });
    try {
      const calendars = await api.getCalendars(accountId);
      set({ calendars, calendarsLoading: false });
    } catch {
      set({ calendarsLoading: false });
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
      }
      return created;
    } catch {
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
      }
      return ok;
    } catch {
      return false;
    }
  },

  // -----------------------------------------------------------------------
  // Events
  // -----------------------------------------------------------------------
  fetchEvents: async (after, before) => {
    const { accountId } = get();
    if (!accountId) return;
    set({ eventsLoading: true });
    try {
      const events = await api.queryAndFetchEvents(accountId, {
        after,
        before,
      });
      set({
        rawEvents: events,
        eventsLoading: false,
        lastFetchRange: { after, before },
      });
    } catch {
      set({ eventsLoading: false });
    }
  },

  addEvent: async (uiEvent, calendarId) => {
    const { accountId } = get();
    if (!accountId) return null;
    try {
      const payload = toCreateEventPayload(uiEvent, calendarId);
      const created = await api.createEvent(accountId, payload);
      if (created) {
        set((s) => ({ rawEvents: [...s.rawEvents, created] }));
      }
      return created;
    } catch {
      return null;
    }
  },

  editEvent: async (eventId, updates) => {
    const { accountId } = get();
    if (!accountId) return false;
    try {
      const ok = await api.updateEvent(accountId, eventId, updates);
      if (ok) {
        set((s) => ({
          rawEvents: s.rawEvents.map((e) =>
            e.id === eventId ? { ...e, ...updates } : e,
          ),
        }));
      }
      return ok;
    } catch {
      return false;
    }
  },

  removeEvent: async (eventId) => {
    const { accountId } = get();
    if (!accountId) return false;
    try {
      const ok = await api.deleteEvent(accountId, eventId);
      if (ok) {
        set((s) => ({
          rawEvents: s.rawEvents.filter((e) => e.id !== eventId),
        }));
      }
      return ok;
    } catch {
      return false;
    }
  },

  moveEvent: async (eventId, dtstart, dtend) => {
    const { accountId } = get();
    if (!accountId) return false;
    try {
      const ok = await api.updateEvent(accountId, eventId, { dtstart, dtend });
      if (ok) {
        set((s) => ({
          rawEvents: s.rawEvents.map((e) =>
            e.id === eventId ? { ...e, dtstart, dtend } : e,
          ),
        }));
      }
      return ok;
    } catch {
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
    set({ subscriptionsLoading: true });
    try {
      const subs = await api.getSubscriptions();
      set({ subscriptions: subs, subscriptionsLoading: false });
    } catch {
      set({ subscriptionsLoading: false });
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
      // Re-fetch calendars since subscription auto-creates a calendar
      get().fetchCalendars();
    } catch {
      // error handling done by caller
    }
  },

  removeSubscription: async (id, deleteCalendar = false) => {
    try {
      await api.deleteSubscription(id, deleteCalendar);
      set((s) => ({
        subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
      }));
      if (deleteCalendar) {
        get().fetchCalendars();
      }
    } catch {
      // handled by caller
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
    } catch {
      // handled by caller
    }
  },

  // -----------------------------------------------------------------------
  // Reset
  // -----------------------------------------------------------------------
  reset: () => set(initialState),
}));
