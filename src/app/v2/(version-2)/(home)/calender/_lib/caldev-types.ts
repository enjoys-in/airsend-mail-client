// ============================================================================
// CalDev API Types — Matches the CalDev Go server data models
// ============================================================================

import type { EventColor } from "../_components/event-calendar/types";

// ---------------------------------------------------------------------------
// Core Data Models
// ---------------------------------------------------------------------------

export interface CalDevCalendar {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  description: string;
  color: string; // hex e.g. "#4F46E5"
  timezone: string;
  sort_order: number;
  ctag: string;
  sync_token: string;
  is_default: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  supported_components: string[];
  max_resource_size: number;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CalDevAttendee {
  email: string;
  display_name: string;
  role: "CHAIR" | "REQ-PARTICIPANT" | "OPT-PARTICIPANT" | "NON-PARTICIPANT";
  status: "NEEDS-ACTION" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
  rsvp: boolean;
  type: "INDIVIDUAL" | "GROUP" | "ROOM" | "RESOURCE";
}

export interface CalDevEvent {
  id: string;
  tenant_id: string;
  user_id: string;
  calendar_id: string;
  uid: string;
  summary: string;
  description: string;
  location: string;
  dtstart: string; // ISO 8601
  dtend: string; // ISO 8601
  duration: string;
  all_day: boolean;
  recurrence_rule: string;
  recurrence_id: string;
  sequence: number;
  status: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  transparency: "OPAQUE" | "TRANSPARENT";
  classification: "PUBLIC" | "PRIVATE" | "CONFIDENTIAL";
  organizer: string; // "mailto:user@example.com"
  attendees: CalDevAttendee[];
  categories: string[];
  priority: number;
  url: string;
  geo: string;
  dtstamp: string;
  etag: string;
  raw_ics: string;
  size_bytes: number;
  component_type: string;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CalDevSubscription {
  id: string;
  tenant_id: string;
  user_id: string;
  calendar_id: string;
  source_type: "google" | "outlook" | "ics_url";
  source_url: string;
  display_name: string;
  color: string;
  auth_type: "none" | "basic" | "bearer" | "api_key";
  is_enabled: boolean;
  sync_interval: number;
  last_synced_at: string;
  last_etag: string;
  last_error: string;
  error_count: number;
  events_count: number;
  created_at: string;
  updated_at: string;
}

export interface CalDevAppPassword {
  id: string;
  user_id: string;
  label: string;
  scopes: string[];
  last_used_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// REST Envelope
// ---------------------------------------------------------------------------

export interface CalDevRestResponse<T = unknown> {
  success: boolean;
  message: string;
  result: T;
  error?: {
    details?: string;
  };
}

// ---------------------------------------------------------------------------
// JMAP Types (RFC 8620)
// ---------------------------------------------------------------------------

export type JMAPMethodName =
  | "Calendar/get"
  | "Calendar/set"
  | "CalendarEvent/get"
  | "CalendarEvent/set"
  | "CalendarEvent/query"
  | "CalendarEvent/changes";

export type JMAPMethodCall = [JMAPMethodName, Record<string, unknown>, string];

export interface JMAPRequest {
  using: string[];
  methodCalls: JMAPMethodCall[];
}

export interface JMAPMethodResponse {
  accountId: string;
  state: string;
  list?: unknown[];
  notFound?: string[];
  created?: Record<string, unknown>;
  updated?: Record<string, unknown>;
  destroyed?: string[];
  notCreated?: Record<string, unknown>;
  notUpdated?: Record<string, unknown>;
  notDestroyed?: Record<string, unknown>;
  // Query response
  ids?: string[];
  total?: number;
  position?: number;
  // Changes response
  oldState?: string;
  newState?: string;
  hasMoreChanges?: boolean;
  changed?: string[];
  removed?: string[];
}

export type JMAPResponseEntry = [string, JMAPMethodResponse, string];

export interface JMAPResponse {
  methodResponses: JMAPResponseEntry[];
  sessionState: string;
}

export interface JMAPSession {
  capabilities: Record<string, unknown>;
  accounts: Record<
    string,
    { name: string; isPersonal: boolean; isReadOnly: boolean }
  >;
  primaryAccounts: Record<string, string>;
  username: string;
  apiUrl: string;
  state: string;
}

// ---------------------------------------------------------------------------
// Create / Update payloads
// ---------------------------------------------------------------------------

export interface CreateCalendarPayload {
  name: string;
  color?: string;
  description?: string;
  timezone?: string;
}

export interface UpdateCalendarPayload {
  name?: string;
  color?: string;
  description?: string;
  timezone?: string;
  is_visible?: boolean;
}

export interface CreateEventPayload {
  calendar_id: string;
  summary: string;
  description?: string;
  location?: string;
  dtstart: string;
  dtend: string;
  all_day?: boolean;
  status?: string;
  recurrence_rule?: string;
  attendees?: Omit<CalDevAttendee, "status">[];
  categories?: string[];
}

export interface UpdateEventPayload {
  summary?: string;
  description?: string;
  location?: string;
  dtstart?: string;
  dtend?: string;
  all_day?: boolean;
  status?: string;
  calendar_id?: string;
  recurrence_rule?: string;
  attendees?: CalDevAttendee[];
  categories?: string[];
}

export interface CreateSubscriptionPayload {
  source_url: string;
  display_name?: string;
  color?: string;
  source_type?: string;
  auth_type?: string;
  auth_credentials?: string;
  sync_interval?: number;
  calendar_id?: string;
}

export interface UpdateSubscriptionPayload {
  display_name?: string;
  color?: string;
  source_url?: string;
  auth_type?: string;
  auth_credentials?: string;
  is_enabled?: boolean;
  sync_interval?: number;
}

export interface RSVPPayload {
  event_uid: string;
  response: "ACCEPTED" | "DECLINED" | "TENTATIVE";
  comment?: string;
}

// ---------------------------------------------------------------------------
// Mapping helpers – convert between CalDev API events ↔ UI CalendarEvent
// ---------------------------------------------------------------------------

import type { CalendarEvent } from "../_components/event-calendar/types";

/** Map hex color to nearest EventColor */
export function hexToEventColor(hex: string): EventColor {
  const map: Record<string, EventColor> = {
    "#3B82F6": "blue",
    "#4F46E5": "blue",
    "#6366F1": "violet",
    "#8B5CF6": "violet",
    "#F97316": "orange",
    "#FB923C": "orange",
    "#EF4444": "rose",
    "#F43F5E": "rose",
    "#EC4899": "rose",
    "#10B981": "emerald",
    "#059669": "emerald",
    "#22C55E": "emerald",
  };
  const upper = hex?.toUpperCase();
  if (map[upper]) return map[upper];

  // Fallback: parse hex and find nearest
  const r = parseInt(upper?.slice(1, 3) || "00", 16);
  const g = parseInt(upper?.slice(3, 5) || "00", 16);
  const b = parseInt(upper?.slice(5, 7) || "00", 16);

  if (r > 200 && g < 100 && b < 100) return "rose";
  if (r > 200 && g > 100 && b < 100) return "orange";
  if (b > 150 && r < 150 && g < 150) return "blue";
  if (b > 150 && r > 100) return "violet";
  if (g > 150 && r < 150) return "emerald";

  return "blue";
}

export const EVENT_COLOR_HEX: Record<EventColor, string> = {
  blue: "#3B82F6",
  violet: "#8B5CF6",
  orange: "#F97316",
  rose: "#F43F5E",
  emerald: "#10B981",
};

/** Convert CalDev API event → UI CalendarEvent */
export function toCalendarEvent(
  apiEvent: CalDevEvent,
  calendarColor?: string,
): CalendarEvent {
  return {
    id: apiEvent.id,
    title: apiEvent.summary || "(no title)",
    description: apiEvent.description,
    start: new Date(apiEvent.dtstart),
    end: new Date(apiEvent.dtend),
    allDay: apiEvent.all_day,
    color: hexToEventColor(calendarColor || "#3B82F6"),
    location: apiEvent.location,
    label: apiEvent.categories?.[0],
  };
}

/** Convert UI CalendarEvent → CalDev create payload */
export function toCreateEventPayload(
  uiEvent: CalendarEvent,
  calendarId: string,
): CreateEventPayload {
  return {
    calendar_id: calendarId,
    summary: uiEvent.title,
    description: uiEvent.description || "",
    location: uiEvent.location || "",
    dtstart: uiEvent.start.toISOString(),
    dtend: uiEvent.end.toISOString(),
    all_day: uiEvent.allDay || false,
    status: "CONFIRMED",
  };
}
