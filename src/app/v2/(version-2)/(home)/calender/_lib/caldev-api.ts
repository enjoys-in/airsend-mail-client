// ============================================================================
// CalDev API Client — JMAP + REST integration
// ============================================================================

import { caldevInstance } from "@/lib/api/api.instance";
import { getMid, setMid, getEmail } from "@/lib/api/auth-state";
import type {
  CalDevCalendar,
  CalDevEvent,
  CalDevSubscription,
  CalDevAppPassword,
  CalDevRestResponse,
  JMAPRequest,
  JMAPResponse,
  JMAPSession,
  JMAPMethodCall,
  JMAPMethodResponse,
  CreateCalendarPayload,
  UpdateCalendarPayload,
  CreateEventPayload,
  UpdateEventPayload,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  RSVPPayload,
} from "./caldev-types";
import { normalizeJMAPEvent, normalizeJMAPCalendar, buildFullCalendar } from "./caldev-types";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";
import { airsendDB } from "@/db";
import { useSettingsStore } from "@/store/settings";
import { useUserConfigStore } from "@/store/settings/user-config";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const JMAP_USING = [
  "urn:ietf:params:jmap:core",
  "urn:ietf:params:jmap:calendars",
];

// ---------------------------------------------------------------------------
// Backend config-array helpers
// ---------------------------------------------------------------------------

/** Convert JMAP calendars → backend `calender_config.config` entries */
export function buildBackendConfigArray(
  calendars: CalDevCalendar[],
): ICalenderConfig["config"] {
  return calendars.map((cal) => ({
    calendar_id: cal.id,
    calendar_name: cal.name,
    calender_url: "",
    sync_status: "synced",
    last_synced_at: cal.updated_at ? new Date(cal.updated_at) : null,
    sync_error: null,
  }));
}

/**
 * Fetch JMAP calendars and return a ready-to-persist `config` array.
 * Call this after calendar create / delete to keep the backend in sync.
 */
export async function fetchCalendarConfigArray(
  mid?: string | null,
): Promise<ICalenderConfig["config"]> {
  const resolvedMid = mid || getMid();
  if (resolvedMid) setMid(resolvedMid);

  const session = await getSession();
  const accountId = getAccountId(session);
  const calendars = await getCalendars(accountId);
  return buildBackendConfigArray(calendars);
}

/**
 * Sync the current JMAP calendars to the main backend's calender_config.config.
 * Writes to IDB → dexie-observable auto-pushes to backend API.
 * Safe to call from non-React code (Zustand store actions).
 */
export async function syncCalendarsToBackend(
  calendars: CalDevCalendar[],
): Promise<void> {
  const email = getEmail();
  if (!email) return;

  const configArray = buildBackendConfigArray(calendars);
  const settings = useSettingsStore.getState().settings;
  const currentConfig: ICalenderConfig = (settings?.calender_config as ICalenderConfig) || {
    enable_calender: false,
    calender_sync_interval: 15,
    notifications: true,
    sharing: false,
    config: [],
  };

  const updatedConfig: ICalenderConfig = { ...currentConfig, config: configArray };

  try {
    await airsendDB.updateNestedItem(
      "settings",
      email,
      "settings.calender_config" as any,
      updatedConfig as any,
    );
    useSettingsStore.getState().setSettings({ calender_config: updatedConfig });
    useUserConfigStore.getState().hydrate({ ...settings, calender_config: updatedConfig });
  } catch (err) {
    console.error("[syncCalendarsToBackend] failed:", err);
  }
}

// ---------------------------------------------------------------------------
// JMAP Helpers
// ---------------------------------------------------------------------------

async function jmapCall(
  methodCalls: JMAPMethodCall[],
): Promise<JMAPResponse> {
  const body: JMAPRequest = { using: JMAP_USING, methodCalls };
  const { data } = await caldevInstance.post<JMAPResponse>("/jmap/api", body);
  return data;
}

function findResponse(
  res: JMAPResponse,
  callId: string,
): JMAPMethodResponse | null {
  const entry = res.methodResponses.find(([, , id]) => id === callId);
  return entry ? entry[1] : null;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function getSession(): Promise<JMAPSession> {
  const { data } = await caldevInstance.get<JMAPSession>("/jmap/session");
  return data;
}

export function getAccountId(session: JMAPSession): string {
  const primary = session.primaryAccounts?.["urn:ietf:params:jmap:calendars"];
  if (primary) return primary;
  const keys = Object.keys(session.accounts || {});
  return keys[0] || "";
}

// ---------------------------------------------------------------------------
// Calendars (JMAP)
// ---------------------------------------------------------------------------

export async function getCalendars(
  accountId: string,
): Promise<CalDevCalendar[]> {
  const res = await jmapCall([
    ["Calendar/get", { accountId }, "c0"],
  ]);
  const resp = findResponse(res, "c0");
  return ((resp?.list as Record<string, any>[]) || []).map(normalizeJMAPCalendar);
}

export async function createCalendar(
  accountId: string,
  payload: CreateCalendarPayload,
): Promise<CalDevCalendar | null> {
  const res = await jmapCall([
    [
      "Calendar/set",
      {
        accountId,
        create: { cal1: payload },
      },
      "c0",
    ],
  ]);
  const resp = findResponse(res, "c0");
  const created = (resp?.created as Record<string, any>)?.["cal1"];
  if (!created) return null;
  return buildFullCalendar(payload, created);
}

export async function updateCalendar(
  accountId: string,
  calendarId: string,
  payload: UpdateCalendarPayload,
): Promise<boolean> {
  // Convert snake_case payload → camelCase JMAP fields
  const jmapPayload: Record<string, unknown> = {};
  if (payload.name !== undefined) jmapPayload.name = payload.name;
  if (payload.color !== undefined) jmapPayload.color = payload.color;
  if (payload.description !== undefined) jmapPayload.description = payload.description;
  if (payload.timezone !== undefined) jmapPayload.timezone = payload.timezone;
  if (payload.is_visible !== undefined) jmapPayload.isVisible = payload.is_visible;

  const res = await jmapCall([
    [
      "Calendar/set",
      {
        accountId,
        update: { [calendarId]: jmapPayload },
      },
      "c0",
    ],
  ]);
  const resp = findResponse(res, "c0");
  return !!(resp?.updated as Record<string, any>)?.[calendarId];
}

export async function deleteCalendar(
  accountId: string,
  calendarId: string,
): Promise<boolean> {
  const res = await jmapCall([
    [
      "Calendar/set",
      {
        accountId,
        destroy: [calendarId],
      },
      "c0",
    ],
  ]);
  const resp = findResponse(res, "c0");
  return (resp?.destroyed || []).includes(calendarId);
}

// ---------------------------------------------------------------------------
// Payload converters – snake_case internal → camelCase JMAP
// ---------------------------------------------------------------------------

function toJMAPCreatePayload(p: CreateEventPayload): Record<string, any> {
  const result: Record<string, any> = {
    calendarId: p.calendar_id,
    title: p.summary,
    start: p.dtstart,
    description: p.description ?? "",
    location: p.location ?? "",
    isAllDay: p.all_day ?? false,
    status: p.status ?? "CONFIRMED",
  };
  if (p.dtend) result.end = p.dtend;
  if (p.recurrence_rule) result.recurrenceRule = p.recurrence_rule;
  if (p.attendees) result.attendees = p.attendees;
  if (p.categories) result.categories = p.categories;
  return result;
}

function toJMAPUpdatePayload(p: UpdateEventPayload): Record<string, any> {
  const result: Record<string, any> = {};
  if (p.summary !== undefined) result.title = p.summary;
  if (p.description !== undefined) result.description = p.description;
  if (p.location !== undefined) result.location = p.location;
  if (p.dtstart !== undefined) result.start = p.dtstart;
  if (p.dtend !== undefined) result.end = p.dtend;
  if (p.all_day !== undefined) result.isAllDay = p.all_day;
  if (p.status !== undefined) result.status = p.status;
  if (p.calendar_id !== undefined) result.calendarId = p.calendar_id;
  if (p.recurrence_rule !== undefined) result.recurrenceRule = p.recurrence_rule;
  if (p.attendees !== undefined) result.attendees = p.attendees;
  if (p.categories !== undefined) result.categories = p.categories;
  return result;
}

// ---------------------------------------------------------------------------
// Events (JMAP)
// ---------------------------------------------------------------------------

export async function getEvents(
  accountId: string,
  ids?: string[],
): Promise<CalDevEvent[]> {
  const args: Record<string, unknown> = { accountId };
  if (ids) args.ids = ids;
  const res = await jmapCall([["CalendarEvent/get", args, "e0"]]);
  const resp = findResponse(res, "e0");
  return ((resp?.list as Record<string, any>[]) || []).map(normalizeJMAPEvent);
}

export async function queryEvents(
  accountId: string,
  filter: {
    calendarId?: string;
    after?: string;
    before?: string;
  },
): Promise<string[]> {
  const res = await jmapCall([
    ["CalendarEvent/query", { accountId, filter }, "q0"],
  ]);
  const resp = findResponse(res, "q0");
  return (resp?.ids as string[]) || [];
}

/**
 * Fetch events — uses CalendarEvent/get (all events) then filters client-side.
 * This is more reliable than CalendarEvent/query which depends on server-side
 * filter support and back-references.
 */
export async function queryAndFetchEvents(
  accountId: string,
  filter: {
    calendarId?: string;
    after?: string;
    before?: string;
  },
): Promise<CalDevEvent[]> {
  // Get ALL events via CalendarEvent/get (no ids = return all)
  const allEvents = await getEvents(accountId);

  // Client-side filter by date range + calendar
  return allEvents.filter((e) => {
    if (filter.calendarId && e.calendar_id !== filter.calendarId) return false;
    if (filter.after && e.dtstart < filter.after) return false;
    if (filter.before && e.dtstart > filter.before) return false;
    return true;
  });
}

export async function createEvent(
  accountId: string,
  payload: CreateEventPayload,
): Promise<CalDevEvent | null> {
  const jmapPayload = toJMAPCreatePayload(payload);
  const res = await jmapCall([
    [
      "CalendarEvent/set",
      {
        accountId,
        create: { e1: jmapPayload },
      },
      "e0",
    ],
  ]);
  const resp = findResponse(res, "e0");
  const created = (resp?.created as Record<string, any>)?.["e1"];
  return created ? normalizeJMAPEvent(created) : null;
}

export async function updateEvent(
  accountId: string,
  eventId: string,
  payload: UpdateEventPayload,
): Promise<boolean> {
  const jmapPayload = toJMAPUpdatePayload(payload);
  const res = await jmapCall([
    [
      "CalendarEvent/set",
      {
        accountId,
        update: { [eventId]: jmapPayload },
      },
      "e0",
    ],
  ]);
  const resp = findResponse(res, "e0");
  return !!(resp?.updated as Record<string, any>)?.[eventId];
}

export async function deleteEvent(
  accountId: string,
  eventId: string,
): Promise<boolean> {
  const res = await jmapCall([
    [
      "CalendarEvent/set",
      {
        accountId,
        destroy: [eventId],
      },
      "e0",
    ],
  ]);
  const resp = findResponse(res, "e0");
  return (resp?.destroyed || []).includes(eventId);
}

export async function getEventChanges(
  accountId: string,
  sinceState: string,
): Promise<{
  oldState: string;
  newState: string;
  changed: string[];
  removed: string[];
  hasMoreChanges: boolean;
}> {
  const res = await jmapCall([
    ["CalendarEvent/changes", { accountId, sinceState }, "ch0"],
  ]);
  const resp = findResponse(res, "ch0");
  // API returns created/updated/destroyed per JMAP spec
  const created = (resp?.created as string[]) || [];
  const updated = (resp?.updated as string[]) || [];
  const destroyed = (resp?.destroyed as string[]) || [];
  return {
    oldState: resp?.oldState || sinceState,
    newState: resp?.newState || sinceState,
    changed: [...created, ...updated],
    removed: destroyed,
    hasMoreChanges: resp?.hasMoreChanges || false,
  };
}

// ---------------------------------------------------------------------------
// Subscriptions (REST)
// ---------------------------------------------------------------------------

export async function getSubscriptions(): Promise<CalDevSubscription[]> {
  const { data } = await caldevInstance.get<
    CalDevRestResponse<{ subscriptions: CalDevSubscription[] }>
  >("/api/subscriptions/");
  return data.result?.subscriptions || [];
}

export async function createSubscription(
  payload: CreateSubscriptionPayload,
): Promise<{ subscription: CalDevSubscription; calendar_id: string }> {
  const { data } = await caldevInstance.post<
    CalDevRestResponse<{
      subscription: CalDevSubscription;
      calendar_id: string;
    }>
  >("/api/subscriptions/", payload);
  return data.result;
}

export async function getSubscription(
  id: string,
): Promise<CalDevSubscription> {
  const { data } = await caldevInstance.get<
    CalDevRestResponse<{ subscription: CalDevSubscription }>
  >(`/api/subscriptions/${id}`);
  return data.result.subscription;
}

export async function updateSubscription(
  id: string,
  payload: UpdateSubscriptionPayload,
): Promise<CalDevSubscription> {
  const { data } = await caldevInstance.put<
    CalDevRestResponse<{ subscription: CalDevSubscription }>
  >(`/api/subscriptions/${id}`, payload);
  return data.result.subscription;
}

export async function deleteSubscription(
  id: string,
  deleteCalendar = false,
): Promise<void> {
  await caldevInstance.delete(
    `/api/subscriptions/${id}${deleteCalendar ? "?delete_calendar=true" : ""}`,
  );
}

export async function syncSubscription(
  id: string,
): Promise<CalDevSubscription> {
  const { data } = await caldevInstance.post<
    CalDevRestResponse<{ subscription: CalDevSubscription }>
  >(`/api/subscriptions/${id}/sync`);
  return data.result.subscription;
}

// ---------------------------------------------------------------------------
// RSVP / Scheduling (REST)
// ---------------------------------------------------------------------------

export async function sendRSVP(
  payload: RSVPPayload,
): Promise<{ event_uid: string; attendee: string; response: string }> {
  const { data } = await caldevInstance.post<
    CalDevRestResponse<{
      event_uid: string;
      attendee: string;
      response: string;
    }>
  >("/api/scheduling/rsvp", payload);
  return data.result;
}

/** Process an incoming iMIP message (REQUEST / REPLY / CANCEL). */
export async function sendIncomingScheduling(
  payload: { tenant_id: string; ics: string; sender_email: string },
): Promise<{ method: string; event_uid: string;[key: string]: string }> {
  const { data } = await caldevInstance.post<
    CalDevRestResponse<{ method: string; event_uid: string;[key: string]: string }>
  >("/api/scheduling/incoming", payload);
  return data.result;
}

// ---------------------------------------------------------------------------
// ICS Feeds (REST, read-only)
// ---------------------------------------------------------------------------

export interface CalDevFeed {
  name: string;
  description: string;
  color?: string;
  feed_url: string;
}

export async function getFeeds(
  tenantId: string,
  userId: string,
): Promise<CalDevFeed[]> {
  const { data } = await caldevInstance.get<
    CalDevRestResponse<{ feeds: CalDevFeed[] }>
  >(`/feeds/${tenantId}/${userId}/`);
  return data.result?.feeds || [];
}

// ---------------------------------------------------------------------------
// App Passwords (REST)
// ---------------------------------------------------------------------------

/**
 * Ensure the user has at least one calendar.
 * Uses JMAP Calendar/get to check, then Calendar/set (create) if none exist.
 * Returns true if a calendar exists or was created, false on failure.
 */
export async function ensureDefaultCalendar(mid?: string | null): Promise<boolean> {
  const resolvedMid = mid || getMid();
  console.log('[ensureDefaultCalendar] mid:', resolvedMid);
  if (!resolvedMid) {

    return false;
  }

  // Ensure the interceptor also has the mid for X-Tenant-ID
  setMid(resolvedMid);

  try {
    // 1. Get session & accountId
    const session = await getSession();
    const accountId = getAccountId(session);

    if (!accountId) {

      return false;
    }

    // 2. Check if calendars already exist
    const calendars = await getCalendars(accountId);
    console.log('[ensureDefaultCalendar] existing calendars:', calendars.length);
    if (calendars.length > 0) {

      return true;
    }

    // 3. No calendars — create default via JMAP Calendar/set

    const created = await createCalendar(accountId, {
      name: "Personal",
      description: "Default calendar",
      color: "#0078D4",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });

    return !!created;
  } catch (err: any) {

    return false;
  }
}

export async function createAppPassword(
  label: string,
  password: string,
  mid?: string | null,
): Promise<CalDevAppPassword> {
  console.log('[createAppPassword] label:', label, '| password length:', password.length, '| mid:', mid);

  // Provision the user's default calendar before creating the app password
  const calOk = await ensureDefaultCalendar(mid);


  const payload = { label, password };


  const { data } = await caldevInstance.post<
    CalDevRestResponse<CalDevAppPassword>
  >("/api/app-passwords/", payload);

  return data.result;
}

export async function deleteAppPassword(id: string): Promise<void> {
  await caldevInstance.delete(`/api/app-passwords/${id}`);
}
