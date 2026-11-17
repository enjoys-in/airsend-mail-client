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
  CalDevAttendee,
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

/** CalDev server origin (used to open the SSE stream). */
export function getCalDevBaseURL(): string {
  return caldevInstance.defaults.baseURL || "";
}

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

  // Auto-enable calendar when calendars exist
  const shouldEnable = configArray.length > 0 || currentConfig.enable_calender;
  const updatedConfig: ICalenderConfig = {
    ...currentConfig,
    config: configArray,
    enable_calender: shouldEnable,
  };

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

/** `/set` success: the id is a key of `updated` (its value is null per RFC 8620). */
function isUpdated(resp: JMAPMethodResponse | null, id: string): boolean {
  const updated = resp?.updated;
  return !!updated && !Array.isArray(updated) && Object.prototype.hasOwnProperty.call(updated, id);
}

/** Readable reason from a JMAP method error or a per-object notCreated/notUpdated/notDestroyed. */
function setErrorMessage(
  res: JMAPResponse,
  callId: string,
  bucket: "notCreated" | "notUpdated" | "notDestroyed",
  id: string,
): string | null {
  const entry = res.methodResponses.find(([, , cid]) => cid === callId);
  if (!entry) return "No response from calendar server";
  const [name, body] = entry as [string, any, string];
  if (name === "error") return body?.description || body?.type || "Calendar server error";
  const err = (body?.[bucket] as Record<string, any> | undefined)?.[id];
  return err ? err.description || err.type || "Rejected by calendar server" : null;
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
  // Success is `updated: { "<id>": null }` — the value is null, so check the key.
  return isUpdated(resp, calendarId);
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

/** CalDev attendees → JMAP `participants` map (UI_GUIDE §5). */
function toJMAPParticipants(
  attendees: Array<Partial<CalDevAttendee> & { email: string }>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  attendees
    .filter((a) => a?.email)
    .forEach((a, i) => {
      out[String(i + 1)] = {
        email: a.email,
        name: a.display_name || "",
        ...(a.status && { participationStatus: a.status }),
        expectReply: a.rsvp ?? true,
      };
    });
  return out;
}

function toJMAPCreatePayload(p: CreateEventPayload): Record<string, any> {
  const result: Record<string, any> = {
    title: p.summary,
    start: p.dtstart,
    description: p.description ?? "",
    location: p.location ?? "",
    isAllDay: p.all_day ?? false,
    status: p.status ?? "CONFIRMED",
  };
  // Omit calendarId → server uses the default writable calendar
  if (p.calendar_id) result.calendarId = p.calendar_id;
  if (p.dtend) result.end = p.dtend;
  // Always send the zone on timed events; never on all-day ones
  if (!result.isAllDay && p.time_zone) result.timeZone = p.time_zone;
  if (p.recurrence_rule) result.recurrenceRules = [{ rule: p.recurrence_rule }];
  if (p.attendees?.length) result.participants = toJMAPParticipants(p.attendees);
  // NOTE: never send `organizer` — the server sets it (UI_GUIDE §5)
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
  if (p.time_zone !== undefined && p.all_day !== true) result.timeZone = p.time_zone;
  if (p.status !== undefined) result.status = p.status;
  if (p.calendar_id) result.calendarId = p.calendar_id;
  // "" → [] removes recurrence
  if (p.recurrence_rule !== undefined) {
    result.recurrenceRules = p.recurrence_rule ? [{ rule: p.recurrence_rule }] : [];
  }
  // replaces the guest list (removed guests get a cancellation)
  if (p.attendees !== undefined) result.participants = toJMAPParticipants(p.attendees);
  if (p.recurrence_overrides !== undefined) result.recurrenceOverrides = p.recurrence_overrides;
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

/** Max ids per CalendarEvent/get (server limit). */
const QUERY_PAGE = 500;

/**
 * Fetch every series with an occurrence in [after, before) — UI_GUIDE §5:
 * CalendarEvent/query + CalendarEvent/get with a `#ids` back-reference.
 * `query` returns series (recurring ones included); the UI expands them.
 * Returns the events and the CalendarEvent `state` (for live updates).
 */
export async function queryAndFetchEvents(
  accountId: string,
  filter: {
    calendarId?: string;
    after?: string;
    before?: string;
  },
): Promise<{ events: CalDevEvent[]; state: string }> {
  const jmapFilter: Record<string, string> = {};
  if (filter.calendarId) jmapFilter.calendarId = filter.calendarId;
  if (filter.after) jmapFilter.after = toRFC3339(filter.after);
  if (filter.before) jmapFilter.before = toRFC3339(filter.before);

  const events: CalDevEvent[] = [];
  let state = "";
  for (let position = 0; position < 50 * QUERY_PAGE; position += QUERY_PAGE) {
    const res = await jmapCall([
      ["CalendarEvent/query", { accountId, filter: jmapFilter, position, limit: QUERY_PAGE }, "q0"],
      [
        "CalendarEvent/get",
        { accountId, "#ids": { resultOf: "q0", name: "CalendarEvent/query", path: "/ids" } },
        "g0",
      ],
    ]);
    const err = res.methodResponses.find(([name]) => name === "error");
    if (err) throw new Error((err[1] as any)?.description || (err[1] as any)?.type || "query failed");

    const q = findResponse(res, "q0");
    const g = findResponse(res, "g0");
    events.push(...((g?.list as Record<string, any>[]) || []).map(normalizeJMAPEvent));
    if (g?.state) state = g.state;

    const ids = q?.ids || [];
    const total = q?.total ?? ids.length;
    if (ids.length < QUERY_PAGE || position + ids.length >= total) break;
  }
  return { events, state };
}

/** RFC 3339 without milliseconds (the server parses with time.RFC3339). */
function toRFC3339(v: string): string {
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toISOString().replace(/\.\d{3}Z$/, "Z");
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
  // created.e1 is only { id, uid, etag } — the caller merges it with the payload
  const created = (resp?.created as Record<string, any>)?.["e1"];
  if (!created) {
    throw new Error(setErrorMessage(res, "e0", "notCreated", "e1") || "Failed to create event");
  }
  return created as CalDevEvent;
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
  // Success is `updated: { "<id>": null }` — check the key, not the value.
  if (isUpdated(resp, eventId)) return true;
  throw new Error(setErrorMessage(res, "e0", "notUpdated", eventId) || "Failed to update event");
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
  if ((resp?.destroyed || []).includes(eventId)) return true;
  throw new Error(setErrorMessage(res, "e0", "notDestroyed", eventId) || "Failed to delete event");
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
  /** Set when the server cannot compute the delta (e.g. cannotCalculateChanges) → do a full refetch */
  error?: string;
}> {
  const res = await jmapCall([
    ["CalendarEvent/changes", { accountId, sinceState }, "ch0"],
  ]);
  const entry = res.methodResponses.find(([, , id]) => id === "ch0");
  if (!entry || entry[0] === "error") {
    return {
      oldState: sinceState,
      newState: sinceState,
      changed: [],
      removed: [],
      hasMoreChanges: false,
      error: (entry?.[1] as any)?.type || "noResponse",
    };
  }
  const resp = entry[1];
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
export async function ensureDefaultCalendar(
  mid?: string | null,
  opts?: { name?: string; color?: string },
): Promise<boolean> {
  const resolvedMid = mid || getMid();
  
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
   
    if (calendars.length > 0) {

      return true;
    }

    // 3. No calendars — create default via JMAP Calendar/set
    const calName = opts?.name?.trim() || "Personal";
    const calColor = opts?.color || "#0078D4";

    const created = await createCalendar(accountId, {
      name: calName,
      description: `${calName} calendar`,
      color: calColor,
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
