export type CalendarView = "month" | "week" | "day" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  label?: string;
  location?: string;
  // CalDev metadata — flows through the event pipeline for API roundtrips
  calendarId?: string;
  attendees?: CalendarEventAttendee[];
  categories?: string[];
  recurrenceRule?: string;
  status?: string;
}

export interface CalendarEventAttendee {
  email: string;
  display_name: string;
  role: string;
  status: string;
  rsvp: boolean;
  type: string;
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald";
