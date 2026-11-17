// ============================================================================
// Display helpers shared by the invite card (mail view) and the RSVP chip
// (mail list).
// ============================================================================

import { format, isSameDay } from "date-fns";

export const sameEmail = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

export const personLabel = (p: { name: string; email: string }) => p.name || p.email;

/** Readable error from a CalDev REST failure */
export function errorText(e: unknown, fallback: string): string {
  const data = (e as { response?: { data?: { message?: string; error?: { details?: string } } } })?.response?.data;
  return data?.error?.details || data?.message || (e instanceof Error ? e.message : "") || fallback;
}

/** Short zone name of the viewer for a date, e.g. "PST" or "GMT+5:30". */
export function zoneName(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return format(d, "O");
  }
}

/** "Tue Jul 18, 2019 10:30am – 11:30am PST" */
export function whenText(start: Date, end: Date, allDay: boolean): string {
  if (allDay) {
    // all-day end is exclusive
    const last = new Date(end.getTime() - 1);
    return isSameDay(start, last)
      ? `${format(start, "EEE MMM d, yyyy")} · All day`
      : `${format(start, "EEE MMM d")} – ${format(last, "EEE MMM d, yyyy")} · All day`;
  }
  const time = (d: Date) => format(d, "h:mmaaa");
  return isSameDay(start, end)
    ? `${format(start, "EEE MMM d, yyyy")} ${time(start)} – ${time(end)} ${zoneName(start)}`
    : `${format(start, "EEE MMM d, yyyy")} ${time(start)} – ${format(end, "EEE MMM d")} ${time(end)} ${zoneName(start)}`;
}

/** Location without the meeting link (CalDev keeps "Room · https://meet…" in LOCATION). */
export function placeText(location: string, meetingUrl?: string): string {
  if (!meetingUrl) return location.trim();
  return location
    .replace(meetingUrl, "")
    .replace(/\s*[·|,;-]\s*$/, "")
    .replace(/^\s*[·|,;-]\s*/, "")
    .trim();
}
