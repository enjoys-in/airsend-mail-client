// ============================================================================
// Minimal iCalendar (RFC 5545) reader for invitations received by mail.
//
// Reads what the invite card needs: METHOD, the main VEVENT (title, times,
// location, organizer, guests, repeat rule) and a meeting link. Times are
// converted to real instants using TZID (IANA or common Windows names) or the
// VTIMEZONE block of the file.
// ============================================================================

import { zonedWallTime } from "@/app/v2/(version-2)/(home)/calender/_lib/recurrence";
import { findMeetingLink, toMeetingLink, type MeetingLink } from "./meeting-link";

export type InviteMethod = "REQUEST" | "CANCEL" | "REPLY" | "PUBLISH" | "COUNTER" | "REFRESH" | string;
export type PartStat = "NEEDS-ACTION" | "ACCEPTED" | "DECLINED" | "TENTATIVE" | "DELEGATED" | string;

export interface InvitePerson {
  email: string;
  name: string;
}

export interface InviteAttendee extends InvitePerson {
  partstat: PartStat;
  role: string;
}

export interface ParsedInvite {
  method: InviteMethod;
  uid: string;
  sequence: number;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** RRULE text when the event repeats */
  rrule: string;
  /** set when the file only changes one occurrence of a series */
  recurrenceId: string;
  status: string;
  organizer: InvitePerson | null;
  attendees: InviteAttendee[];
  meetingLink: MeetingLink | null;
}

interface Prop {
  name: string;
  params: Record<string, string>;
  value: string;
}

// Outlook / Exchange send Windows zone names in TZID
const WINDOWS_ZONES: Record<string, string> = {
  "India Standard Time": "Asia/Kolkata",
  "Pacific Standard Time": "America/Los_Angeles",
  "Mountain Standard Time": "America/Denver",
  "Central Standard Time": "America/Chicago",
  "Eastern Standard Time": "America/New_York",
  "GMT Standard Time": "Europe/London",
  "Greenwich Standard Time": "Atlantic/Reykjavik",
  "W. Europe Standard Time": "Europe/Berlin",
  "Romance Standard Time": "Europe/Paris",
  "Central Europe Standard Time": "Europe/Budapest",
  "Central European Standard Time": "Europe/Warsaw",
  "E. Europe Standard Time": "Europe/Chisinau",
  "FLE Standard Time": "Europe/Kiev",
  "Russian Standard Time": "Europe/Moscow",
  "Arabian Standard Time": "Asia/Dubai",
  "Pakistan Standard Time": "Asia/Karachi",
  "Bangladesh Standard Time": "Asia/Dhaka",
  "Nepal Standard Time": "Asia/Kathmandu",
  "SE Asia Standard Time": "Asia/Bangkok",
  "Singapore Standard Time": "Asia/Singapore",
  "China Standard Time": "Asia/Shanghai",
  "Tokyo Standard Time": "Asia/Tokyo",
  "Korea Standard Time": "Asia/Seoul",
  "AUS Eastern Standard Time": "Australia/Sydney",
  "New Zealand Standard Time": "Pacific/Auckland",
  "South Africa Standard Time": "Africa/Johannesburg",
  "E. South America Standard Time": "America/Sao_Paulo",
  UTC: "UTC",
  "Coordinated Universal Time": "UTC",
};

/** Join folded lines (CRLF + space/tab continues the previous line). */
function unfold(ics: string): string[] {
  return ics.replace(/\r?\n[ \t]/g, "").split(/\r?\n/).filter((l) => l.length > 0);
}

/** Split at the first `:` / `;` that is not inside double quotes. */
function splitOutsideQuotes(s: string, sep: string, limit = Infinity): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"') quoted = !quoted;
    if (ch === sep && !quoted && out.length < limit - 1) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseLine(line: string): Prop | null {
  const [head, ...rest] = splitOutsideQuotes(line, ":", 2);
  if (rest.length === 0) return null;
  const [name, ...paramParts] = splitOutsideQuotes(head, ";");
  const params: Record<string, string> = {};
  for (const p of paramParts) {
    const i = p.indexOf("=");
    if (i > 0) params[p.slice(0, i).toUpperCase()] = p.slice(i + 1).replace(/^"|"$/g, "");
  }
  return { name: name.toUpperCase(), params, value: rest[0] };
}

const unescapeText = (v: string) =>
  v.replace(/\\[nN]/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");

const stripMailto = (v: string) => v.replace(/^mailto:/i, "").trim();

/** "+0530" → minutes */
function offsetMinutes(v: string): number | null {
  const m = /^([+-])(\d{2})(\d{2})/.exec(v.trim());
  if (!m) return null;
  const mins = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === "-" ? -mins : mins;
}

function parseDate(
  prop: Prop,
  vtzOffsets: Record<string, number>,
): { date: Date; allDay: boolean } | null {
  const v = prop.value.trim();
  const dm = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (dm || prop.params.VALUE === "DATE") {
    const [, y, m, d] = dm ?? /^(\d{4})(\d{2})(\d{2})/.exec(v) ?? [];
    if (!y) return null;
    return { date: new Date(Number(y), Number(m) - 1, Number(d)), allDay: true };
  }
  const t = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(v);
  if (!t) return null;
  const w = { y: +t[1], m: +t[2], d: +t[3], h: +t[4], mi: +t[5], s: +t[6] };
  if (t[7] === "Z") return { date: new Date(Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s)), allDay: false };

  const tzid = prop.params.TZID?.replace(/^\//, "");
  if (tzid) {
    const iana = zonedWallTime(w, tzid) ?? (WINDOWS_ZONES[tzid] ? zonedWallTime(w, WINDOWS_ZONES[tzid]) : null);
    if (iana) return { date: iana, allDay: false };
    const off = vtzOffsets[tzid];
    if (off !== undefined) {
      return { date: new Date(Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s) - off * 60000), allDay: false };
    }
  }
  // floating time → viewer's local time
  return { date: new Date(w.y, w.m - 1, w.d, w.h, w.mi, w.s), allDay: false };
}

/** "PT1H30M" / "P1D" → milliseconds */
function durationMs(v: string): number | null {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim());
  if (!m) return null;
  const [, sign, w, d, h, mi, s] = m;
  const ms =
    ((+(w || 0) * 7 + +(d || 0)) * 24 * 3600 + +(h || 0) * 3600 + +(mi || 0) * 60 + +(s || 0)) * 1000;
  return sign === "-" ? -ms : ms;
}

/**
 * Parse an invitation. Returns null when the text has no usable VEVENT.
 * When the file holds a series plus overrides, the master event is used.
 */
export function parseInvite(ics: string): ParsedInvite | null {
  if (!ics || !/BEGIN:VCALENDAR/i.test(ics)) return null;

  let method: InviteMethod = "";
  const vtzOffsets: Record<string, number> = {};
  const events: Prop[][] = [];

  const stack: string[] = [];
  let current: Prop[] | null = null;
  let tzid = "";

  for (const line of unfold(ics)) {
    const prop = parseLine(line);
    if (!prop) continue;

    if (prop.name === "BEGIN") {
      const comp = prop.value.toUpperCase();
      stack.push(comp);
      if (comp === "VEVENT" && stack.length === 2) current = [];
      continue;
    }
    if (prop.name === "END") {
      const comp = stack.pop();
      if (comp === "VEVENT" && current) {
        events.push(current);
        current = null;
      }
      if (comp === "VTIMEZONE") tzid = "";
      continue;
    }

    const top = stack[stack.length - 1];
    if (top === "VCALENDAR" && prop.name === "METHOD") method = prop.value.trim().toUpperCase();
    else if (top === "VTIMEZONE" && prop.name === "TZID") tzid = prop.value.trim();
    else if (top === "STANDARD" && prop.name === "TZOFFSETTO" && tzid && vtzOffsets[tzid] === undefined) {
      const off = offsetMinutes(prop.value);
      if (off !== null) vtzOffsets[tzid] = off;
    } else if (top === "VEVENT" && current) current.push(prop);
  }

  if (events.length === 0) return null;
  const master = events.find((e) => !e.some((p) => p.name === "RECURRENCE-ID")) ?? events[0];
  const get = (name: string) => master.find((p) => p.name === name);
  const text = (name: string) => {
    const p = get(name);
    return p ? unescapeText(p.value).trim() : "";
  };

  const dtStart = get("DTSTART");
  const start = dtStart ? parseDate(dtStart, vtzOffsets) : null;
  if (!start) return null;

  const dtEnd = get("DTEND");
  let end = dtEnd ? parseDate(dtEnd, vtzOffsets)?.date : undefined;
  if (!end) {
    const dur = get("DURATION");
    const ms = dur ? durationMs(dur.value) : null;
    end = new Date(start.date.getTime() + (ms ?? (start.allDay ? 864e5 : 36e5)));
  }

  const organizerProp = get("ORGANIZER");
  const organizer = organizerProp
    ? { email: stripMailto(organizerProp.value), name: organizerProp.params.CN || "" }
    : null;

  const attendees: InviteAttendee[] = master
    .filter((p) => p.name === "ATTENDEE")
    .map((p) => ({
      email: stripMailto(p.value),
      name: p.params.CN || "",
      partstat: (p.params.PARTSTAT || "NEEDS-ACTION").toUpperCase(),
      role: (p.params.ROLE || "REQ-PARTICIPANT").toUpperCase(),
    }))
    .filter((a) => a.email);

  const description = text("DESCRIPTION");
  const location = text("LOCATION");

  // Provider-specific conference properties first, then RFC 7986 CONFERENCE / URL, then text
  const conferenceProps = [
    "X-GOOGLE-CONFERENCE",
    "X-MICROSOFT-SKYPETEAMSMEETINGURL",
    "X-MICROSOFT-ONLINEMEETINGCONFLINK",
    "X-MICROSOFT-ONLINEMEETINGEXTERNALLINK",
    "CONFERENCE",
    "URL",
  ];
  let meetingLink: MeetingLink | null = null;
  for (const name of conferenceProps) {
    for (const p of master.filter((x) => x.name === name)) {
      const link = toMeetingLink(p.value);
      if (link && (link.provider !== "other" || name === "CONFERENCE")) {
        meetingLink = link;
        break;
      }
    }
    if (meetingLink) break;
  }
  meetingLink ??= findMeetingLink(location, description);

  return {
    method: method || "PUBLISH",
    uid: text("UID"),
    sequence: Number(text("SEQUENCE")) || 0,
    title: text("SUMMARY"),
    description,
    location,
    start: start.date,
    end,
    allDay: start.allDay,
    rrule: text("RRULE"),
    recurrenceId: get("RECURRENCE-ID")?.value || "",
    status: text("STATUS").toUpperCase(),
    organizer,
    attendees,
    meetingLink,
  };
}

/** Text of the calendar part of a parsed mail (postal-mime attachment), if any. */
export function findCalendarPart(
  attachments: { mimeType?: string; filename?: string | null; content: ArrayBuffer | Uint8Array | string; method?: string }[],
): string | null {
  const parts = attachments.filter(
    (a) => /text\/calendar|application\/ics/i.test(a.mimeType || "") || /\.ics$/i.test(a.filename || ""),
  );
  if (parts.length === 0) return null;
  // the inline part carrying METHOD is the real invite; .ics files are usually copies of it
  const best = parts.find((p) => p.method) ?? parts[0];
  const c = best.content;
  if (typeof c === "string") return c;
  try {
    return new TextDecoder("utf-8").decode(c instanceof Uint8Array ? c : new Uint8Array(c));
  } catch {
    return null;
  }
}
