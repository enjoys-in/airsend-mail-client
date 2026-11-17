export type Method = "GET" | "POST" | "PUT" | "DELETE" | "ANY"

export interface Endpoint {
  method: Method
  path: string
  /** Needs the access_token cookie (or app password for /dav). */
  auth: boolean
  desc: string
}

export const endpointGroups: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: "Service & session",
    endpoints: [
      { method: "GET", path: "/health", auth: false, desc: "Health check" },
      { method: "GET", path: "/jmap/session", auth: true, desc: "Session, accountId and capabilities" },
      { method: "POST", path: "/jmap/api", auth: true, desc: "All calendar and event operations (JMAP)" },
      { method: "GET", path: "/jmap/eventsource", auth: true, desc: "Live change stream (SSE)" },
    ],
  },
  {
    title: "Scheduling & people",
    endpoints: [
      { method: "POST", path: "/api/scheduling/rsvp", auth: true, desc: "Accept / decline / tentative" },
      { method: "POST", path: "/api/scheduling/incoming", auth: true, desc: "Process an incoming iMIP message (REQUEST / REPLY / CANCEL)" },
      { method: "GET", path: "/api/availability/people", auth: true, desc: "Search teammates with free/busy" },
      { method: "GET", path: "/api/availability/", auth: true, desc: "Free/busy for given emails" },
    ],
  },
  {
    title: "Subscriptions",
    endpoints: [
      { method: "GET", path: "/api/subscriptions/", auth: true, desc: "List imported calendars" },
      { method: "POST", path: "/api/subscriptions/", auth: true, desc: "Import an ICS feed" },
      { method: "PUT", path: "/api/subscriptions/:id", auth: true, desc: "Update a subscription" },
      { method: "DELETE", path: "/api/subscriptions/:id", auth: true, desc: "Remove a subscription" },
      { method: "POST", path: "/api/subscriptions/:id/sync", auth: true, desc: "Sync a subscription now" },
    ],
  },
  {
    title: "Native clients",
    endpoints: [
      { method: "POST", path: "/api/app-passwords/", auth: true, desc: "Create a CalDAV app password" },
      { method: "DELETE", path: "/api/app-passwords/:id", auth: true, desc: "Revoke an app password" },
      { method: "GET", path: "/feeds/:tenantId/:userId/", auth: true, desc: "Read-only ICS feed URLs" },
      { method: "ANY", path: "/dav/*", auth: true, desc: "CalDAV for native clients (not for web apps)" },
    ],
  },
]

export const jmapMethods: [string, string][] = [
  ["Calendar/get", "List calendars"],
  ["Calendar/set", "Create / delete calendars"],
  ["CalendarEvent/get", "Get events (all, or by ID)"],
  ["CalendarEvent/query", "Filter event IDs by calendar and date range"],
  ["CalendarEvent/set", "Create / update / delete events"],
  ["CalendarEvent/changes", "Everything that changed since a state token"],
]

export const statusCodes: [string, string][] = [
  ["200", "Success"],
  ["201", "Created"],
  ["204", "No content (successful delete)"],
  ["400", "Bad request — validation error"],
  ["401", "Missing or expired access_token"],
  ["404", "Not found"],
  ["429", "Rate limited — back off and retry"],
  ["500", "Server error"],
]

export const subscriptionFields: [string, string][] = [
  ["source_url", "Required. The ICS feed URL."],
  ["display_name", "Default “Imported Calendar”."],
  ["color", "Default #6B7280."],
  ["source_type", "Default ics_url; Google and Outlook feeds are detected automatically."],
  ["auth_type / auth_credentials", "none, basic, bearer or api_key — for protected feeds."],
  ["sync_interval", "Seconds. Default 3600, minimum 300."],
  ["calendar_id", "Leave empty to auto-create a read-only calendar."],
]

export const eventFilters: [string, string][] = [
  ["calendarId", "Only events in this calendar"],
  ["after", "Events starting after this ISO 8601 time"],
  ["before", "Events starting before this ISO 8601 time"],
]
