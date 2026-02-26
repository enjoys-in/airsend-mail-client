// ============================================================================
// CalDev API Client — JMAP + REST integration
// ============================================================================

import axios, { type AxiosInstance } from "axios";
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

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CALDEV_BASE_URL =
  process.env.NEXT_PUBLIC_CALDEV_URL || "http://localhost:8443";

const JMAP_USING = [
  "urn:ietf:params:jmap:core",
  "urn:ietf:params:jmap:calendars",
];

// ---------------------------------------------------------------------------
// Axios instance (credentials forwarded via cookie, same as mail system)
// ---------------------------------------------------------------------------

const caldevInstance: AxiosInstance = axios.create({
  baseURL: CALDEV_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercept 401 → redirect to auth
caldevInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  },
);

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
  return (resp?.list as CalDevEvent[]) || [];
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

/** Query + fetch events in one batch */
export async function queryAndFetchEvents(
  accountId: string,
  filter: {
    calendarIds?: string[];
    after?: string;
    before?: string;
  },
): Promise<CalDevEvent[]> {
  // First query for IDs
  const ids = await queryEvents(accountId, filter);
  if (ids.length === 0) return [];
  // Then fetch full events
  return getEvents(accountId, ids);
}

export async function createEvent(
  accountId: string,
  payload: CreateEventPayload,
): Promise<CalDevEvent | null> {
  const res = await jmapCall([
    [
      "CalendarEvent/set",
      {
        accountId,
        create: { e1: payload },
      },
      "e0",
    ],
  ]);
  const resp = findResponse(res, "e0");
  return (resp?.created?.["e1"] as CalDevEvent) || null;
}

export async function updateEvent(
  accountId: string,
  eventId: string,
  payload: UpdateEventPayload,
): Promise<boolean> {
  const res = await jmapCall([
    [
      "CalendarEvent/set",
      {
        accountId,
        update: { [eventId]: payload },
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

export async function createAppPassword(
  label: string,
  password: string,
): Promise<CalDevAppPassword> {
  const { data } = await caldevInstance.post<
    CalDevRestResponse<CalDevAppPassword>
  >("/api/app-passwords/", { label, password });
  return data.result;
}

export async function deleteAppPassword(id: string): Promise<void> {
  await caldevInstance.delete(`/api/app-passwords/${id}`);
}
