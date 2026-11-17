// ============================================================================
// Meeting links — any URL (Google Meet, Teams, Zoom, Webex, Jitsi or other).
//
// CalDev has no dedicated conference field yet, so a link is kept inside the
// event's `location` ("Room 42 · https://meet.google.com/abc"). CalDev already
// sends `location` in invite emails and in the .ics, so other calendars show it.
// ============================================================================

export type MeetingProviderId = "meet" | "teams" | "zoom" | "webex" | "jitsi" | "other";

export interface MeetingLink {
  url: string;
  provider: MeetingProviderId;
  /** "Google Meet", "Microsoft Teams", … or the host name for other links */
  label: string;
}

const PROVIDERS: { id: Exclude<MeetingProviderId, "other">; label: string; host: RegExp }[] = [
  { id: "meet", label: "Google Meet", host: /(^|\.)meet\.google\.com$/i },
  { id: "teams", label: "Microsoft Teams", host: /(^|\.)teams\.(microsoft|live)\.com$/i },
  { id: "zoom", label: "Zoom", host: /(^|\.)zoom\.(us|com)$/i },
  { id: "webex", label: "Webex", host: /(^|\.)webex\.com$/i },
  { id: "jitsi", label: "Jitsi Meet", host: /(^|\.)(meet\.jit\.si|8x8\.vc)$/i },
];

/** http(s) URLs inside free text; stops at whitespace, quotes and closing brackets */
const URL_RE = /https?:\/\/[^\s<>"'`)\]]+/gi;

/** Strip punctuation that usually ends a sentence rather than the URL */
const trimUrl = (u: string) => u.replace(/[.,;:!?]+$/, "");

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** Describe a URL. Returns null when it isn't a valid http(s) URL. */
export function toMeetingLink(raw: string): MeetingLink | null {
  const url = trimUrl(raw.trim());
  if (!/^https?:\/\//i.test(url)) return null;
  const host = hostOf(url);
  if (!host) return null;
  const known = PROVIDERS.find((p) => p.host.test(host));
  return known
    ? { url, provider: known.id, label: known.label }
    : { url, provider: "other", label: host.replace(/^www\./i, "") };
}

const urlsIn = (text: string | undefined | null): string[] =>
  text ? Array.from(text.matchAll(URL_RE), (m) => trimUrl(m[0])) : [];

/**
 * Best meeting link across several texts (checked in order). A known provider
 * anywhere wins; otherwise the first URL of the *first* text (the location) is
 * used — a random link in a long description is not treated as a meeting.
 */
export function findMeetingLink(...texts: (string | undefined | null)[]): MeetingLink | null {
  for (const text of texts) {
    for (const u of urlsIn(text)) {
      const link = toMeetingLink(u);
      if (link && link.provider !== "other") return link;
    }
  }
  const first = urlsIn(texts[0])[0];
  return first ? toMeetingLink(first) : null;
}

const SEP = " · ";

/** "Room 42 · https://…" → { place: "Room 42", link: "https://…" } */
export function splitLocation(location: string | undefined | null): { place: string; link: string } {
  const text = location || "";
  const link = urlsIn(text)[0] || "";
  if (!link) return { place: text.trim(), link: "" };
  const place = text
    .replace(link, "")
    .replace(/\s*·\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { place, link };
}

/** Inverse of splitLocation. Adds https:// when the user typed a bare host. */
export function joinLocation(place: string, link: string): string {
  const cleanLink = normalizeLink(link);
  return [place.trim(), cleanLink].filter(Boolean).join(SEP);
}

/** "meet.google.com/abc" → "https://meet.google.com/abc"; "" stays "" */
export function normalizeLink(link: string): string {
  const v = link.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
