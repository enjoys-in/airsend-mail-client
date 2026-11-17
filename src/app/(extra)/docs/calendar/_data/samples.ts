import type { CodeSample } from "../_components/code-tabs"

/* All samples use {{BASE_URL}}, replaced with the public CalDev URL by <CodeTabs>. */

export const healthSamples: CodeSample[] = [
  { label: "curl", lang: "sh", code: `curl {{BASE_URL}}/health` },
  {
    label: "fetch",
    code: `const res = await fetch("{{BASE_URL}}/health")
console.log(await res.json())`,
  },
  {
    label: "Response",
    lang: "json",
    code: `{
  "success": true,
  "message": "service is healthy",
  "result": { "status": "ok", "service": "caldev", "time": "2026-12-01T09:00:00Z" }
}`,
  },
]

export const sessionSamples: CodeSample[] = [
  {
    label: "fetch",
    code: `const BASE = "{{BASE_URL}}"

// credentials: "include" sends your access_token cookie
const res = await fetch(BASE + "/jmap/session", { credentials: "include" })
const session = await res.json()

// "tenantId:userId", e.g. "85:85"
const accountId = session.primaryAccounts["urn:ietf:params:jmap:calendars"]`,
  },
  {
    label: "curl",
    lang: "sh",
    code: `curl {{BASE_URL}}/jmap/session \\
  -H "Cookie: access_token=<JWT>"`,
  },
  {
    label: "Response",
    lang: "json",
    code: `{
  "capabilities": { "...": {} },
  "accounts": {
    "85:85": { "name": "you@yourdomain.com", "isPersonal": true, "isReadOnly": false }
  },
  "primaryAccounts": { "urn:ietf:params:jmap:calendars": "85:85" },
  "username": "you@yourdomain.com",
  "apiUrl": "{{BASE_URL}}/jmap/api",
  "state": "a1b2c3d4"
}`,
  },
]

export const listCalendarsSamples: CodeSample[] = [
  {
    label: "jmap() helper",
    code: `const BASE = "{{BASE_URL}}"

// One small wrapper for every JMAP call. Reused in all examples below.
async function jmap(methodCalls) {
  const res = await fetch(BASE + "/jmap/api", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:calendars"],
      methodCalls,
    }),
  })
  if (!res.ok) throw new Error("CalDev " + res.status)
  return (await res.json()).methodResponses
}`,
  },
  {
    label: "List calendars",
    code: `const [[, result]] = await jmap([
  ["Calendar/get", { accountId }, "c0"],
])
// result.list → [{ id, name, color, isDefault, isReadOnly, timezone, myRights, ... }]`,
  },
  {
    label: "curl",
    lang: "sh",
    code: `curl -X POST {{BASE_URL}}/jmap/api \\
  -H "Cookie: access_token=<JWT>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:calendars"],
    "methodCalls": [["Calendar/get", { "accountId": "85:85" }, "c0"]]
  }'`,
  },
]

export const createCalendarSamples: CodeSample[] = [
  {
    label: "fetch",
    code: `const [[, result]] = await jmap([
  ["Calendar/set", {
    accountId,
    create: {
      temp0: { name: "Work", description: "Work calendar", color: "#EF4444", timezone: "Asia/Kolkata" },
    },
  }, "c1"],
])
const calendarId = result.created.temp0.id   // "temp0" is your own temporary key`,
  },
]

export const createEventSamples: CodeSample[] = [
  {
    label: "fetch",
    code: `const [[, result]] = await jmap([
  ["CalendarEvent/set", {
    accountId,
    create: {
      e1: {
        calendarId,                       // omit → your default writable calendar
        title: "Design review",
        description: "Walk through the new onboarding flow",
        location: "Room 42 · https://meet.google.com/abc-defg-hij",
        start: "2026-12-03T10:00:00Z",    // RFC 3339, no milliseconds
        end:   "2026-12-03T11:00:00Z",
        timeZone: "Asia/Kolkata",         // timed events only
        isAllDay: false,
        status: "CONFIRMED",
        recurrenceRules: [{ rule: "FREQ=WEEKLY;BYDAY=TH" }],
        participants: {
          "1": {
            name: "Jane Doe",
            email: "jane@example.com",
            kind: "individual",
            roles: { attendee: true },
            participationStatus: "NEEDS-ACTION",
            expectReply: true,
          },
        },
      },
    },
  }, "e0"],
])
const { id, uid, etag } = result.created.e1`,
  },
  {
    label: "Response",
    code: `["CalendarEvent/set", {
  "created": { "e1": { "id": "7f3c…", "uid": "7f3c…@caldev", "etag": "\\"abc123\\"" } },
  "newState": "s-42"
}, "e0"]`,
  },
]

export const queryEventsSamples: CodeSample[] = [
  {
    label: "fetch",
    code: `// 1. ask for the IDs in a window …
const [[, q]] = await jmap([
  ["CalendarEvent/query", {
    accountId,
    filter: { calendarId, after: "2026-12-01T00:00:00Z", before: "2027-01-01T00:00:00Z" },
    position: 0,
    limit: 50,
  }, "q0"],
])

// 2. … then fetch the full objects
const [[, got]] = await jmap([
  ["CalendarEvent/get", { accountId, ids: q.ids }, "g0"],
])
console.log(got.list)   // [{ id, title, start, end, participants, recurrenceRules, ... }]`,
  },
  {
    label: "Batched",
    code: `// JMAP lets you chain calls; a back-reference feeds query results into get.
await jmap([
  ["CalendarEvent/query", { accountId, filter: { after: "2026-12-01T00:00:00Z" }, limit: 50 }, "q0"],
  ["CalendarEvent/get", {
    accountId,
    "#ids": { resultOf: "q0", name: "CalendarEvent/query", path: "/ids" },
  }, "g0"],
])`,
  },
]

export const updateDeleteSamples: CodeSample[] = [
  {
    label: "Update",
    code: `await jmap([
  ["CalendarEvent/set", {
    accountId,
    update: {
      [eventId]: {
        title: "Design review (moved)",
        start: "2026-12-03T11:00:00Z",
        end:   "2026-12-03T12:00:00Z",
        // recurrenceRules: []  → removes recurrence
        // participants: {...}  → replaces the guest list; removed guests get a cancellation
      },
    },
  }, "e2"],
])`,
  },
  {
    label: "Delete",
    code: `const [[, r]] = await jmap([
  ["CalendarEvent/set", { accountId, destroy: [eventId] }, "e3"],
])
// r.destroyed → ["…"]    r.notDestroyed → { "<id>": { type: "notFound", description: "…" } }`,
  },
]

export const changesSamples: CodeSample[] = [
  {
    label: "Delta sync",
    code: `// Keep the "state" from your last Calendar/get or CalendarEvent/get response.
const [[, ch]] = await jmap([
  ["CalendarEvent/changes", { accountId, sinceState: savedState }, "ch0"],
])
savedState = ch.newState
// ch.created / ch.updated → fetch those IDs with CalendarEvent/get
// ch.destroyed            → drop them locally
// ch.hasMoreChanges       → call again with the new state`,
  },
  {
    label: "Live stream",
    code: `// Server-Sent Events: the server pushes when something changes, you then run a delta sync.
const es = new EventSource("{{BASE_URL}}/jmap/eventsource", { withCredentials: true })

es.addEventListener("state", (e) => {
  const { changed } = JSON.parse(e.data)           // { "<accountId>": { CalendarEvent, Calendar } }
  const s = Object.values(changed)[0]
  if (s?.CalendarEvent !== savedState) syncChanges()  // CalendarEvent/changes, as above
})

es.addEventListener("resync", () => refetchEverything())  // server lost track → start over
es.onerror = () => { es.close(); /* reconnect with backoff */ }`,
  },
]

export const rsvpSamples: CodeSample[] = [
  {
    label: "fetch",
    code: `const res = await fetch("{{BASE_URL}}/api/scheduling/rsvp", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    event_uid: "7f3c…@caldev",
    response: "ACCEPTED",          // ACCEPTED | DECLINED | TENTATIVE
    comment: "I'll be there!",
  }),
})
const { result } = await res.json()   // { event_uid, attendee, response }`,
  },
  {
    label: "curl",
    lang: "sh",
    code: `curl -X POST {{BASE_URL}}/api/scheduling/rsvp \\
  -H "Cookie: access_token=<JWT>" \\
  -H "Content-Type: application/json" \\
  -d '{ "event_uid": "7f3c…@caldev", "response": "ACCEPTED" }'`,
  },
]

export const subscriptionSamples: CodeSample[] = [
  {
    label: "Create",
    code: `const res = await fetch("{{BASE_URL}}/api/subscriptions/", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source_url: "https://calendar.google.com/calendar/ical/…/basic.ics",   // required
    display_name: "Public holidays",
    color: "#10B981",
    sync_interval: 3600,            // seconds, minimum 300
  }),
})
// 201 → { result: { subscription, calendar_id } }  (first sync runs in the background)`,
  },
  {
    label: "Manage",
    lang: "text",
    code: `GET    /api/subscriptions/                          list
PUT    /api/subscriptions/:id                       { display_name, color, is_enabled, sync_interval }
POST   /api/subscriptions/:id/sync                  sync now
DELETE /api/subscriptions/:id?delete_calendar=true  204 No Content`,
  },
]

export const availabilitySamples: CodeSample[] = [
  {
    label: "fetch",
    code: `const w = { start: "2026-12-03T00:00:00Z", end: "2026-12-04T00:00:00Z" }

// Teammates in your organisation matching a name or address
const people = await (await fetch(
  "{{BASE_URL}}/api/availability/people?" + new URLSearchParams({ q: "jane", limit: "8", ...w }),
  { credentials: "include" },
)).json()

// Free/busy of specific people (up to 50)
const busy = await (await fetch(
  "{{BASE_URL}}/api/availability/?" + new URLSearchParams({ emails: "jane@example.com,raj@example.com", ...w }),
  { credentials: "include" },
)).json()

// result.results[i] → { email, name?, allowed, current?: { busy, until, nextBusyAt }, busy: [{ start, end, status }] }
// allowed: false → that person has not shared availability with you`,
  },
]

export const caldavSamples: CodeSample[] = [
  {
    label: "Client settings",
    lang: "text",
    code: `Account type : CalDAV (manual / "Other")
Server       : {{BASE_URL}}/dav/
Username     : you@yourdomain.com
Password     : <app password>        ← not your mailbox password`,
  },
  {
    label: "Create app password",
    code: `await fetch("{{BASE_URL}}/api/app-passwords/", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ label: "Thunderbird", password: "a-long-random-secret" }),
})
// DELETE /api/app-passwords/:id revokes it`,
  },
  {
    label: "ICS feeds",
    code: `// Read-only .ics URLs you can subscribe to from Google Calendar, Outlook, …
const res = await fetch("{{BASE_URL}}/feeds/" + tenantId + "/" + userId + "/", { credentials: "include" })
const { result } = await res.json()   // { feeds: [{ name, description, color, feed_url }] }`,
  },
]

export const errorSamples: CodeSample[] = [
  {
    label: "REST",
    lang: "json",
    code: `{ "success": false, "message": "error description", "error": { "details": "optional" } }`,
  },
  {
    label: "JMAP",
    code: `// Method-level failures are reported inside a 200 response:
["CalendarEvent/set", { "notCreated": { "e1": { "type": "invalidProperties", "description": "…" } } }, "e0"]
["CalendarEvent/set", { "notDestroyed": { "<id>": { "type": "notFound" } } }, "e3"]`,
  },
]
