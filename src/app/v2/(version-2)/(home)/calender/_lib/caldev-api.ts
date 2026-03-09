// ============================================================================
// CalDev API Client — JMAP + REST integration
// ============================================================================

import Cookies from "js-cookie";
import { caldevInstance } from "@/lib/api/api.instance";
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
import { normalizeJMAPEvent } from "./caldev-types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const JMAP_USING = [
  "urn:ietf:params:jmap:core",
  "urn:ietf:params:jmap:calendars",
];

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
  return (resp?.list as CalDevCalendar[]) || [];
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
  return (resp?.created?.["cal1"] as CalDevCalendar) || null;
}

export async function updateCalendar(
  accountId: string,
  calendarId: string,
  payload: UpdateCalendarPayload,
): Promise<boolean> {
  const res = await jmapCall([
    [
      "Calendar/set",
      {
        accountId,
        update: { [calendarId]: payload },
      },
      "c0",
    ],
  ]);
  const resp = findResponse(res, "c0");
  return !!resp?.updated?.[calendarId];
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
    calendarIds?: string[];
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

/** Query + fetch events in a single JMAP request using back-references */
export async function queryAndFetchEvents(
  accountId: string,
  filter: {
    calendarIds?: string[];
    after?: string;
    before?: string;
  },
): Promise<CalDevEvent[]> {
  try {
    // Use JMAP back-reference to batch query + get in one HTTP request
    const res = await jmapCall([
      ["CalendarEvent/query", { accountId, filter }, "q0"],
      [
        "CalendarEvent/get",
        {
          accountId,
          "#ids": {
            resultOf: "q0",
            name: "CalendarEvent/query",
            path: "/ids",
          },
        } as any,
        "e0",
      ],
    ]);
    const resp = findResponse(res, "e0");
    return ((resp?.list as Record<string, any>[]) || []).map(normalizeJMAPEvent);
  } catch {
    // Fallback: two-step fetch if back-references are not supported
    const ids = await queryEvents(accountId, filter);
    if (ids.length === 0) return [];
    return getEvents(accountId, ids);
  }
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
  const created = resp?.created?.["e1"] as Record<string, any> | undefined;
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
  return !!resp?.updated?.[eventId];
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
  return {
    oldState: resp?.oldState || sinceState,
    newState: resp?.newState || sinceState,
    changed: (resp?.changed as string[]) || [],
    removed: (resp?.removed as string[]) || [],
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

// ---------------------------------------------------------------------------
// App Passwords (REST)
// ---------------------------------------------------------------------------

/** Read the user's `mid` from the shield_user cookie. */
function getMid(): string | null {
  try {
    const raw = Cookies.get("shield_user");
    if (raw) {
      const user = JSON.parse(raw);
      return user?.mid ?? null;
    }
  } catch {}
  return null;
}

/**
 * Ensure the user's default calendar collection exists on the CalDAV server.
 * Uses MKCALENDAR; silently ignores if the collection already exists (405/409).
 */
async function ensureDefaultCalendar(): Promise<void> {
  const mid = getMid();
  if (!mid) return;

  try {
    await caldevInstance.request({
      method: "MKCALENDAR",
      url: `/dav/${mid}/${mid}/calendars/`,
    });
  } catch (err: any) {
    // 405 Method Not Allowed / 409 Conflict → calendar already exists, safe to ignore
    const status = err?.response?.status;
    if (status === 405 || status === 409) return;
    // Any other error: swallow silently — app-password creation should still proceed
  }
}

export async function createAppPassword(
  label: string,
  password: string,
): Promise<CalDevAppPassword> {
  // Provision the user's default calendar before creating the app password
  await ensureDefaultCalendar();

  const { data } = await caldevInstance.post<
    CalDevRestResponse<CalDevAppPassword>
  >("/api/app-passwords/", { label, password });
  return data.result;
}

export async function deleteAppPassword(id: string): Promise<void> {
  await caldevInstance.delete(`/api/app-passwords/${id}`);
}
