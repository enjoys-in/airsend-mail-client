// ============================================================================
// Recurrence expansion + time helpers for CalDev events
//
// CalDev returns ONE JMAP object per series (UI_GUIDE §6): the UI must expand
// `recurrenceRules` itself and apply `recurrenceOverrides` (keyed by the
// ORIGINAL start of the occurrence: a UTC instant "2026-11-16T09:00:00Z", or
// "YYYY-MM-DD" for all-day series). Expansion happens in the event's
// `timeZone` so "every Monday 09:00 New York" stays at 09:00 across DST.
//
// All-day events are stored as 00:00:00Z of the first day with an EXCLUSIVE
// end (UI_GUIDE §11) and must be rendered by date, not by local midnight.
// ============================================================================

import type { CalendarEvent } from "../_components/event-calendar/types";
import type { CalDevEvent, OccurrencePatch } from "./caldev-types";
import { hexToEventColor } from "./caldev-types";

const DAY_MS = 864e5;

// ---------------------------------------------------------------------------
// Time zone helpers (Intl based — no extra dependencies)
// ---------------------------------------------------------------------------

type Wall = { y: number; m: number; d: number; h: number; mi: number; s: number };

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function isUTCZone(zone?: string): boolean {
  return !zone || zone === "UTC" || zone === "Etc/UTC" || zone === "GMT" || zone === "Z";
}

function getFormatter(zone: string): Intl.DateTimeFormat | null {
  let f = fmtCache.get(zone);
  if (f) return f;
  try {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  } catch {
    return null; // unknown zone → caller falls back to UTC
  }
  fmtCache.set(zone, f);
  return f;
}

/** Wall-clock fields of an instant in `zone`. */
function toWall(t: number, zone?: string): Wall {
  const f = zone && !isUTCZone(zone) ? getFormatter(zone) : null;
  if (!f) {
    const d = new Date(t);
    return {
      y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
      h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(),
    };
  }
  const p: Record<string, number> = {};
  for (const part of f.formatToParts(new Date(t))) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  return { y: p.year, m: p.month, d: p.day, h: p.hour === 24 ? 0 : p.hour, mi: p.minute, s: p.second };
}

const wallToUTCms = (w: Wall) => Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s);

/** Instant for wall-clock fields in `zone` (DST gaps resolve forward). */
function fromWall(w: Wall, zone?: string): number {
  const guess = wallToUTCms(w);
  if (!zone || isUTCZone(zone) || !getFormatter(zone)) return guess;
  const offset1 = wallToUTCms(toWall(guess, zone)) - guess;
  let t = guess - offset1;
  const offset2 = wallToUTCms(toWall(t, zone)) - t;
  if (offset2 !== offset1) t = guess - offset2;
  return t;
}

/** The viewer's IANA zone (UI_GUIDE §5: send it on every timed event). */
export function userTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// ---------------------------------------------------------------------------
// All-day conversion (server: 00:00Z first day, exclusive end;
// UI: local 00:00 of first day → local 23:59:59.999 of last day)
// ---------------------------------------------------------------------------

/** UI all-day range → API start/end ("YYYY-MM-DDT00:00:00Z", end exclusive). */
export function allDayToAPI(start: Date, end: Date): { start: string; end: string } {
  const s = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  let e = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) + DAY_MS;
  if (e <= s) e = s + DAY_MS;
  return { start: isoNoMs(s), end: isoNoMs(e) };
}

/** API all-day start/end → UI local dates (same calendar dates, inclusive end). */
export function allDayFromAPI(startISO: string, endISO?: string): { start: Date; end: Date } {
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;
  const start = new Date(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
  // exclusive end → last day inclusive
  const last = e && e.getTime() > s.getTime() ? new Date(e.getTime() - DAY_MS) : s;
  const end = new Date(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate(), 23, 59, 59, 999);
  return { start, end };
}

/** RFC 3339 UTC without milliseconds — the format override keys use. */
export function isoNoMs(t: number | Date): string {
  return new Date(t).toISOString().replace(/\.\d{3}Z$/, "Z");
}

// ---------------------------------------------------------------------------
// RRULE parsing / expansion (RFC 5545 subset used by calendar apps)
// ---------------------------------------------------------------------------

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

interface ParsedRule {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  count?: number;
  until?: number; // instant (ms)
  byDay?: { wd: number; n: number }[]; // n = 0 → every such weekday
  byMonthDay?: number[];
  byMonth?: number[];
}

function parseUntil(v: string): number | undefined {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(v.trim());
  if (!m) return undefined;
  const [, y, mo, d, h = "23", mi = "59", s = "59"] = m;
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
}

function parseRule(rule: string): ParsedRule | null {
  const parts: Record<string, string> = {};
  for (const seg of rule.replace(/^RRULE:/i, "").split(";")) {
    const [k, v] = seg.split("=");
    if (k && v) parts[k.trim().toUpperCase()] = v.trim().toUpperCase();
  }
  const freq = parts.FREQ as ParsedRule["freq"];
  if (!["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) return null; // SECONDLY/MINUTELY/HOURLY not expanded
  const out: ParsedRule = { freq, interval: Math.max(1, parseInt(parts.INTERVAL || "1", 10) || 1) };
  if (parts.COUNT) out.count = Math.max(0, parseInt(parts.COUNT, 10) || 0);
  if (parts.UNTIL) out.until = parseUntil(parts.UNTIL);
  if (parts.BYDAY) {
    out.byDay = parts.BYDAY.split(",")
      .map((x) => {
        const m = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/.exec(x.trim());
        return m ? { wd: WEEKDAYS.indexOf(m[2]), n: m[1] ? parseInt(m[1], 10) : 0 } : null;
      })
      .filter((x): x is { wd: number; n: number } => !!x);
  }
  if (parts.BYMONTHDAY) out.byMonthDay = parts.BYMONTHDAY.split(",").map(Number).filter((n) => n && !isNaN(n));
  if (parts.BYMONTH) out.byMonth = parts.BYMONTH.split(",").map(Number).filter((n) => n >= 1 && n <= 12);
  return out;
}

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1-12

/** Candidate days (1-based day-of-month, ascending) of month y/m for MONTHLY/YEARLY rules. */
function monthDays(y: number, m: number, r: ParsedRule, dtDay: number): number[] {
  const dim = daysInMonth(y, m);
  const out = new Set<number>();
  if (r.byMonthDay?.length) {
    for (const md of r.byMonthDay) {
      const d = md > 0 ? md : dim + md + 1;
      if (d >= 1 && d <= dim) out.add(d);
    }
  } else if (r.byDay?.length) {
    const firstWd = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    for (const { wd, n } of r.byDay) {
      const all: number[] = [];
      for (let d = 1 + ((wd - firstWd + 7) % 7); d <= dim; d += 7) all.push(d);
      if (n === 0) all.forEach((d) => out.add(d));
      else {
        const d = n > 0 ? all[n - 1] : all[all.length + n];
        if (d) out.add(d);
      }
    }
  } else if (dtDay <= dim) {
    out.add(dtDay); // months without that day are skipped (RFC 5545)
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * Real start instants (ms) of a series that start before `to`.
 * COUNT is counted from DTSTART, so occurrences before `from` are still walked.
 */
function seriesStarts(startMs: number, rule: string, zone: string | undefined, to: number): number[] {
  const r = parseRule(rule);
  if (!r) return [startMs];

  const w = toWall(startMs, zone);
  const out: number[] = [];
  let emitted = 0;
  const MAX_ITER = 20000;
  let iter = 0;

  // returns false when expansion must stop
  const emit = (y: number, m: number, d: number): boolean => {
    const t = fromWall({ y, m, d, h: w.h, mi: w.mi, s: w.s }, zone);
    if (t < startMs) return true; // before DTSTART: not an occurrence
    if (r.until !== undefined && t > r.until) return false;
    if (r.count !== undefined && emitted >= r.count) return false;
    if (t >= to) return false;
    emitted++;
    out.push(t);
    return true;
  };

  if (r.freq === "DAILY") {
    for (let k = 0; iter++ < MAX_ITER; k += r.interval) {
      const dt = new Date(Date.UTC(w.y, w.m - 1, w.d + k));
      const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
      if (r.byMonth?.length && !r.byMonth.includes(m)) continue;
      if (r.byDay?.length && !r.byDay.some((b) => b.wd === dt.getUTCDay())) continue;
      if (!emit(y, m, d)) break;
    }
  } else if (r.freq === "WEEKLY") {
    const dtWd = new Date(Date.UTC(w.y, w.m - 1, w.d)).getUTCDay();
    const wds = (r.byDay?.length ? r.byDay.map((b) => b.wd) : [dtWd]);
    // week starts Monday (RFC 5545 default WKST=MO)
    const offsets = [...new Set(wds.map((wd) => (wd + 6) % 7))].sort((a, b) => a - b);
    const weekStartOffset = (dtWd + 6) % 7;
    outer: for (let k = 0; iter++ < MAX_ITER; k += r.interval) {
      for (const off of offsets) {
        const dt = new Date(Date.UTC(w.y, w.m - 1, w.d - weekStartOffset + k * 7 + off));
        if (!emit(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())) break outer;
      }
    }
  } else if (r.freq === "MONTHLY") {
    outer: for (let k = 0; iter++ < MAX_ITER; k += r.interval) {
      const dt = new Date(Date.UTC(w.y, w.m - 1 + k, 1));
      const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1;
      if (r.byMonth?.length && !r.byMonth.includes(m)) continue;
      for (const d of monthDays(y, m, r, w.d)) {
        if (!emit(y, m, d)) break outer;
      }
    }
  } else {
    // YEARLY
    const months = r.byMonth?.length ? [...r.byMonth].sort((a, b) => a - b) : [w.m];
    outer: for (let k = 0; iter++ < MAX_ITER; k += r.interval) {
      const y = w.y + k;
      for (const m of months) {
        const days = r.byMonth?.length || r.byMonthDay?.length || r.byDay?.length
          ? monthDays(y, m, r, w.d)
          : (w.d <= daysInMonth(y, m) ? [w.d] : []);
        for (const d of days) {
          if (!emit(y, m, d)) break outer;
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Series → UI occurrences
// ---------------------------------------------------------------------------

/** Separator between series id and occurrence key in UI ids. */
export const OCCURRENCE_SEP = "::";

/** Override key for an occurrence's original start (UI_GUIDE §6). */
export function occurrenceKey(startMs: number, allDay: boolean): string {
  if (allDay) {
    const d = new Date(startMs);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  return isoNoMs(startMs);
}

/** Map one API (start, end) pair to UI dates. */
function toUIRange(startMs: number, endMs: number, allDay: boolean): { start: Date; end: Date } {
  if (allDay) return allDayFromAPI(isoNoMs(startMs), isoNoMs(endMs));
  return { start: new Date(startMs), end: new Date(endMs) };
}

function baseUIEvent(ev: CalDevEvent, color: string | undefined): Omit<CalendarEvent, "id" | "start" | "end"> {
  return {
    title: ev.summary || "(no title)",
    description: ev.description,
    allDay: ev.all_day,
    color: hexToEventColor(color || "#3B82F6"),
    location: ev.location,
    label: ev.categories?.[0],
    calendarId: ev.calendar_id,
    attendees: ev.attendees as any,
    categories: ev.categories,
    recurrenceRule: ev.recurrence_rule || undefined,
    status: ev.status,
  };
}

/**
 * Expand a CalDev event (one series) into the UI occurrences that overlap
 * [from, to). Non-recurring events return a single item (when it overlaps).
 */
export function expandEvent(
  ev: CalDevEvent,
  calendarColor: string | undefined,
  from: Date,
  to: Date,
): CalendarEvent[] {
  const startMs = new Date(ev.dtstart).getTime();
  if (isNaN(startMs)) return [];
  let endMs = ev.dtend ? new Date(ev.dtend).getTime() : NaN;
  if (isNaN(endMs) || endMs < startMs) endMs = ev.all_day ? startMs + DAY_MS : startMs;
  const dur = endMs - startMs;
  const base = baseUIEvent(ev, calendarColor);
  const fromMs = from.getTime();
  const toMs = to.getTime();

  // Window edges in UI terms; all-day events are compared by their UI dates.
  const overlaps = (r: { start: Date; end: Date }) =>
    r.end.getTime() >= fromMs && r.start.getTime() < toMs;

  if (!ev.recurrence_rule) {
    const range = toUIRange(startMs, endMs, ev.all_day);
    return overlaps(range) ? [{ ...base, id: ev.id, ...range }] : [];
  }

  const overrides: Record<string, OccurrencePatch | null> = ev.recurrence_overrides || {};
  const out: CalendarEvent[] = [];
  const seen = new Set<string>();
  // all-day series expand in UTC (dates); timed series in their own zone
  const zone = ev.all_day ? "UTC" : ev.time_zone || "UTC";
  // widen the window by a day + the event duration so edge occurrences are kept
  const starts = seriesStarts(startMs, ev.recurrence_rule, zone, toMs + DAY_MS);

  const push = (key: string, origStart: number, o: OccurrencePatch | null | undefined) => {
    seen.add(key);
    if (o?.excluded) return;
    const s = o?.start ? new Date(o.start).getTime() : origStart;
    const e = o?.end ? new Date(o.end).getTime() : s + dur;
    const range = toUIRange(s, e, ev.all_day);
    if (!overlaps(range)) return;
    out.push({
      ...base,
      ...(o?.title !== undefined && { title: o.title || "(no title)" }),
      ...(o?.description !== undefined && { description: o.description }),
      ...(o?.location !== undefined && { location: o.location }),
      ...(o?.status !== undefined && { status: o.status }),
      id: `${ev.id}${OCCURRENCE_SEP}${key}`,
      seriesId: ev.id,
      occurrenceKey: key,
      ...range,
    });
  };

  for (const s of starts) {
    if (s + dur + DAY_MS < fromMs) continue;
    const key = occurrenceKey(s, ev.all_day);
    push(key, s, overrides[key]);
  }
  // occurrences moved INTO the window from outside it
  for (const [key, o] of Object.entries(overrides)) {
    if (seen.has(key) || !o || o.excluded || !o.start) continue;
    push(key, new Date(o.start).getTime(), o);
  }
  return out;
}

/** Expand a list of CalDev events for the window [from, to). */
export function expandEvents(
  events: CalDevEvent[],
  colorOf: (calendarId: string) => string | undefined,
  from: Date,
  to: Date,
): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const ev of events) {
    out.push(...expandEvent(ev, colorOf(ev.calendar_id), from, to));
  }
  return out;
}

/** Parse a UI id into series id + occurrence key (if it is an occurrence). */
export function parseOccurrenceId(id: string): { seriesId: string; key?: string } {
  const i = id.indexOf(OCCURRENCE_SEP);
  if (i < 0) return { seriesId: id };
  return { seriesId: id.slice(0, i), key: id.slice(i + OCCURRENCE_SEP.length) };
}

/** API start/end strings for a UI event range. */
export function uiRangeToAPI(start: Date, end: Date, allDay: boolean): { start: string; end: string } {
  if (allDay) return allDayToAPI(start, end);
  return { start: isoNoMs(start), end: isoNoMs(end) };
}

/** Original start instant (ms) of an occurrence key. */
export function occurrenceKeyToMs(key: string): number {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? new Date(`${key}T00:00:00Z`).getTime() : new Date(key).getTime();
}
