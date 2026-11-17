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
  /** true once loaded — route changes no longer re-fetch (live stream keeps it fresh) */
  calendarsLoaded: boolean;

  // Events (raw from API)
  rawEvents: CalDevEvent[];
  eventsLoading: boolean;

  // Subscriptions
  subscriptions: CalDevSubscription[];
  subscriptionsLoading: boolean;
  subscriptionsLoaded: boolean;

  // App Passwords
  appPasswords: CalDevAppPassword[];

  // Sync state
  eventsSyncState: string;
  lastFetchRange: { after: string; before: string } | null;
  /** true while the SSE stream is open */
  liveConnected: boolean;

  // ---------- Actions ----------

  // Init
  initSession: () => Promise<void>;
  /**
   * Idempotent app-level bootstrap (session → calendars → subscriptions → upcoming
   * window → live stream). Safe to call from several places: whatever is already
   * loaded is skipped, so route changes cost no API calls.
   */
  bootstrap: () => Promise<void>;

  // Calendars
  fetchCalendars: (force?: boolean) => Promise<void>;
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
  fetchSubscriptions: (force?: boolean) => Promise<void>;
  addSubscription: (
    sourceUrl: string,
    displayName?: string,
    color?: string,
  ) => Promise<void>;
  removeSubscription: (id: string, deleteCalendar?: boolean) => Promise<void>;
  triggerSync: (id: string) => Promise<void>;

  // Live updates (SSE /jmap/eventsource — UI_GUIDE §10)
  startLiveSync: () => void;
  stopLiveSync: () => void;
  /**
   * Pull only what changed since `eventsSyncState` (CalendarEvent/changes), falling
   * back to a full refetch when the server can't compute the delta.
   * `maxAgeMs`: skip when synced more recently than that.
   */
  syncEventChanges: (maxAgeMs?: number) => Promise<void>;

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
  calendarsLoaded: false,
  rawEvents: [] as CalDevEvent[],
  eventsLoading: false,
  subscriptions: [] as CalDevSubscription[],
  subscriptionsLoading: false,
  subscriptionsLoaded: false,
  appPasswords: [] as CalDevAppPassword[],
  eventsSyncState: "",
  lastFetchRange: null as { after: string; before: string } | null,
  liveConnected: false,
};

/** Range requested while a fetch was in flight (replayed afterwards). */
let pendingFetch: { after: string; before: string; force: boolean } | null = null;

function errMessage(err: unknown): string | undefined {
  return err instanceof Error && err.message ? err.message : undefined;
}

/**
 * Merge an update into an event. `recurrence_overrides` is a PATCH of the
 * overrides map (a null value removes that override), like the server does.
 */
function applyEventUpdates(e: CalDevEvent, updates: Partial<CalDevEvent>): CalDevEvent {
  const { recurrence_overrides, ...rest } = updates;
  const next: CalDevEvent = { ...e, ...rest };
  if (recurrence_overrides) {
    const merged = { ...(e.recurrence_overrides || {}) };
    for (const [k, v] of Object.entries(recurrence_overrides)) {
      if (v === null) delete merged[k];
      else merged[k] = { ...(merged[k] || {}), ...v };
    }
    next.recurrence_overrides = merged;
  }
  return next;
}

// ---------------------------------------------------------------------------
// Live stream (one EventSource; reconnects with backoff — the server closes
// every stream after 30 min on purpose)
// ---------------------------------------------------------------------------
let liveES: EventSource | null = null;
let liveTimer: ReturnType<typeof setTimeout> | null = null;
let liveBackoff = 1000;
let liveFailures = 0; // consecutive failures without a successful open
let liveWanted = false;
let calendarState = "";
let lastEventSyncAt = 0; // ms timestamp of the last completed fetch/delta
let syncRunning = false;
let syncAgain = false;
let syncDebounce: ReturnType<typeof setTimeout> | null = null;

/** Above this many changed ids a full range refetch is cheaper than id lookups. */
const MAX_DELTA_IDS = 100;

/** Window loaded at start-up so "upcoming meetings" work outside the calendar page. */
function upcomingWindow() {
  const now = new Date();
  return {
    after: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
    before: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString(),
  };
}

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

  bootstrap: async () => {
    await get().initSession();
    if (!get().accountId) return; // session failed — a later call retries
    await Promise.all([get().fetchCalendars(), get().fetchSubscriptions()]);
    const { after, before } = upcomingWindow();
    await get().fetchEvents(after, before);
    get().startLiveSync();
  },

  // -----------------------------------------------------------------------
  // Calendars
  // -----------------------------------------------------------------------
  fetchCalendars: async (force = false) => {
    const { accountId, calendarsLoading, calendarsLoaded } = get();
    if (!accountId || calendarsLoading) return;
    if (calendarsLoaded && !force) return;
    set({ calendarsLoading: true });
    try {
      const calendars = await api.getCalendars(accountId);
      set({ calendars, calendarsLoading: false, calendarsLoaded: true });
      // Push to the main backend only if the list differs from the stored copy
      api.syncCalendarsToBackend(calendars);
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
        const updated = [...get().calendars, created];
        set({ calendars: updated });
        toast.success(`Calendar "${name}" created`);
        // Sync to main backend
        api.syncCalendarsToBackend(updated);
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
        // A rename changes the backend copy; colour/description don't (no-op then)
        api.syncCalendarsToBackend(get().calendars);
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
        const updated = get().calendars.filter((c) => c.id !== id);
        set({
          calendars: updated,
          rawEvents: get().rawEvents.filter((e) => e.calendar_id !== id),
        });
        toast.success("Calendar deleted");
        // Sync to main backend
        api.syncCalendarsToBackend(updated);
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
    if (!accountId) return;

    // A fetch is already running — remember the latest request and run it
    // when the current one finishes (it used to be silently dropped, so
    // quickly paging months left the new month empty).
    if (eventsLoading) {
      pendingFetch = { after, before, force: force || !!pendingFetch?.force };
      return;
    }

    // Skip if requested range is within the already-fetched range
    if (
      !force &&
      lastFetchRange &&
      after >= lastFetchRange.after &&
      before <= lastFetchRange.before
    ) {
      return;
    }

    // Always fetch the MERGED range. Previously rawEvents was replaced with
    // only the new range while lastFetchRange claimed the merged one, so
    // navigating forward and back showed earlier months as empty.
    const mergedRange = lastFetchRange
      ? {
          after: after < lastFetchRange.after ? after : lastFetchRange.after,
          before: before > lastFetchRange.before ? before : lastFetchRange.before,
        }
      : { after, before };

    set({ eventsLoading: true });
    try {
      const { events, state } = await api.queryAndFetchEvents(accountId, mergedRange);
      lastEventSyncAt = Date.now();

      // Keep optimistic (not yet confirmed) events created during the fetch
      const pendingTemp = get().rawEvents.filter((e) => e.id?.startsWith("temp-"));

      set({
        rawEvents: pendingTemp.length ? [...events, ...pendingTemp] : events,
        eventsLoading: false,
        lastFetchRange: mergedRange,
        ...(state && { eventsSyncState: state }),
      });
    } catch {
      set({ eventsLoading: false });
      toast.error("Failed to load events");
    }

    // Run the request that arrived while we were busy (if any)
    if (pendingFetch) {
      const next = pendingFetch;
      pendingFetch = null;
      get().fetchEvents(next.after, next.before, next.force);
    }
  },

  addEvent: async (uiEvent, calendarId) => {
    const { accountId } = get();
    if (!accountId) return null;

    const payload = toCreateEventPayload(uiEvent, calendarId);

    // Optimistic: add immediately with a temporary ID
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticEvent = buildFullEvent(payload, { id: tempId } as any);
    const prev = get().rawEvents;
    set((s) => ({ rawEvents: [...s.rawEvents, optimisticEvent] }));

    try {
      const created = await api.createEvent(accountId, payload);
      if (created?.id) {
        // Replace temp event with real server event
        const fullEvent = buildFullEvent(payload, created);
        set((s) => ({
          rawEvents: s.rawEvents
            // a concurrent fetch may already contain the created event
            .filter((e) => e.id !== fullEvent.id)
            .map((e) => (e.id === tempId ? fullEvent : e)),
        }));
        return fullEvent;
      }
      // API returned null — rollback
      set({ rawEvents: prev });
      toast.error("Failed to create event");
      return null;
    } catch (err) {
      // Rollback on failure
      set({ rawEvents: prev });
      toast.error("Failed to create event", { description: errMessage(err) });
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
        e.id === eventId ? applyEventUpdates(e, updates) : e,
      ),
    }));

    try {
      return await api.updateEvent(accountId, eventId, updates);
    } catch (err) {
      set({ rawEvents: prev });
      toast.error("Failed to update event", { description: errMessage(err) });
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
      return await api.deleteEvent(accountId, eventId);
    } catch (err) {
      set({ rawEvents: prev });
      toast.error("Failed to delete event", { description: errMessage(err) });
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
      return await api.updateEvent(accountId, eventId, { dtstart, dtend });
    } catch (err) {
      set({ rawEvents: prev });
      toast.error("Failed to move event", { description: errMessage(err) });
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
  fetchSubscriptions: async (force = false) => {
    const { subscriptionsLoading, subscriptionsLoaded } = get();
    if (subscriptionsLoading) return;
    if (subscriptionsLoaded && !force) return;
    set({ subscriptionsLoading: true });
    try {
      const subs = await api.getSubscriptions();
      set({ subscriptions: subs, subscriptionsLoading: false, subscriptionsLoaded: true });
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
      get().fetchCalendars(true);
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
        get().fetchCalendars(true);
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
  // Live updates — a `state` frame only says *that* something changed; we then
  // ask the server for the delta (CalendarEvent/changes) and fetch just those events.
  // -----------------------------------------------------------------------
  syncEventChanges: async (maxAgeMs = 0) => {
    const { accountId } = get();
    if (!accountId) return;
    if (maxAgeMs && Date.now() - lastEventSyncAt < maxAgeMs) return;
    // one delta at a time; a request that arrives meanwhile reruns afterwards
    if (syncRunning) {
      syncAgain = true;
      return;
    }
    syncRunning = true;

    const fullRefetch = async () => {
      const range = get().lastFetchRange;
      if (range) await get().fetchEvents(range.after, range.before, true);
    };

    try {
      do {
        syncAgain = false;
        let since = get().eventsSyncState;
        if (!since) {
          await fullRefetch();
          continue;
        }

        const changedIds = new Set<string>();
        const removedIds = new Set<string>();
        let newState = since;
        let needFull = false;
        for (let page = 0; page < 5; page++) {
          const ch = await api.getEventChanges(accountId, since);
          if (ch.error) {
            needFull = true;
            break;
          }
          ch.changed.forEach((id) => changedIds.add(id));
          ch.removed.forEach((id) => removedIds.add(id));
          newState = ch.newState;
          if (!ch.hasMoreChanges) break;
          since = ch.newState;
          if (page === 4) needFull = true; // still more after 5 pages
        }
        if (needFull || changedIds.size > MAX_DELTA_IDS) {
          await fullRefetch();
          continue;
        }

        if (changedIds.size === 0 && removedIds.size === 0) {
          set({ eventsSyncState: newState });
          lastEventSyncAt = Date.now();
          continue;
        }

        const fetched = changedIds.size
          ? await api.getEvents(accountId, [...changedIds])
          : [];
        const fetchedIds = new Set(fetched.map((e) => e.id));
        set((st) => ({
          rawEvents: [
            ...st.rawEvents.filter(
              (e) => !removedIds.has(e.id) && !fetchedIds.has(e.id) && !changedIds.has(e.id),
            ),
            ...fetched,
          ],
          eventsSyncState: newState,
        }));
        lastEventSyncAt = Date.now();
      } while (syncAgain);
    } catch {
      // keep the UI as is; the next frame / visibility change retries
    } finally {
      syncRunning = false;
    }
  },

  startLiveSync: () => {
    liveWanted = true;
    if (liveES || liveTimer || typeof window === "undefined" || typeof EventSource === "undefined") return;
    liveFailures = 0;

    const open = () => {
      liveTimer = null;
      if (!liveWanted) return;
      const base = (api.getCalDevBaseURL() || "").replace(/\/+$/, "");
      if (!base) return;
      // Auth: the access_token cookie (withCredentials), like every other CalDev call.
      const es = new EventSource(`${base}/jmap/eventsource`, { withCredentials: true });
      liveES = es;

      es.addEventListener("state", (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          const changed = Object.values(data?.changed || {})[0] as
            | { CalendarEvent?: string; Calendar?: string }
            | undefined;
          if (!changed) return;
          const st = get();
          if (changed.Calendar && changed.Calendar !== calendarState) {
            const first = !calendarState;
            calendarState = changed.Calendar;
            if (!first) st.fetchCalendars(true);
          }
          // The frame sent on connect carries the current state: equal to ours → nothing to do.
          if (changed.CalendarEvent && changed.CalendarEvent !== st.eventsSyncState) {
            // coalesce bursts (e.g. a subscription import) into one delta
            if (syncDebounce) clearTimeout(syncDebounce);
            syncDebounce = setTimeout(() => {
              syncDebounce = null;
              get().syncEventChanges();
            }, 250);
          }
        } catch {
          /* ignore malformed frames */
        }
      });
      es.addEventListener("resync", () => {
        const st = get();
        st.fetchCalendars(true);
        st.fetchSubscriptions(true);
        if (st.lastFetchRange) st.fetchEvents(st.lastFetchRange.after, st.lastFetchRange.before, true);
      });
      es.onopen = () => {
        liveBackoff = 1000;
        liveFailures = 0;
        set({ liveConnected: true });
      };
      es.onerror = () => {
        es.close();
        if (liveES === es) liveES = null;
        set({ liveConnected: false });
        if (!liveWanted) return;
        // Never connected after several tries (auth/CORS/unreachable): stop; the
        // calendar still works, and falls back to delta sync on page visits/focus.
        if (++liveFailures > 6) return;
        liveTimer = setTimeout(open, liveBackoff);
        liveBackoff = Math.min(liveBackoff * 2, 30_000);
      };
    };
    open();
  },

  stopLiveSync: () => {
    liveWanted = false;
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = null;
    if (syncDebounce) clearTimeout(syncDebounce);
    syncDebounce = null;
    liveES?.close();
    liveES = null;
    set({ liveConnected: false });
  },

  // -----------------------------------------------------------------------
  // Reset
  // -----------------------------------------------------------------------
  reset: () => {
    pendingFetch = null;
    get().stopLiveSync();
    calendarState = "";
    lastEventSyncAt = 0;
    syncAgain = false;
    set(initialState);
  },
}));
