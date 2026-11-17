/**
 * Public CalDev (calendar service) URL. A build-time constant, so the docs page stays fully static.
 * Lives outside any "use client" file so server components can read the value.
 */
export const CALDEV_PUBLIC_URL = "https://calender.airsend.in"

/** Where API access requests go. */
export const REQUEST_EMAIL = "su@enjoys.in"

export const REQUEST_MAILTO =
  `mailto:${REQUEST_EMAIL}?subject=` +
  encodeURIComponent("Calendar API access request") +
  "&body=" +
  encodeURIComponent(
    [
      "Hi Airsend team,",
      "",
      `I would like access to the calendar service (${CALDEV_PUBLIC_URL}).`,
      "",
      "Airsend email: ",
      "What I am building: ",
      "Interface needed (JMAP / REST / CalDAV / ICS): ",
      "App origin (for CORS), if a browser app: ",
      "",
      "Thanks",
    ].join("\n")
  )

/** Section list shared by the sticky page nav. Order = page order. */
export const PAGE_SECTIONS: { id: string; label: string }[] = [
  { id: "using-the-calendar", label: "Using the calendar" },
  { id: "calendar-service", label: "Calendar service" },
  { id: "base-url", label: "Base URL" },
  { id: "authentication", label: "Authentication" },
  { id: "request-access", label: "Get access" },
  { id: "quick-start", label: "Quick start" },
  { id: "events", label: "Events" },
  { id: "sync", label: "Sync" },
  { id: "rsvp", label: "RSVP" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "availability", label: "Availability" },
  { id: "caldav", label: "CalDAV & ICS" },
  { id: "reference", label: "Reference" },
  { id: "errors", label: "Errors" },
]
