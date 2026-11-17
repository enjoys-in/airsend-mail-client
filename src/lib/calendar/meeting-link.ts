// ============================================================================
// Meeting links — any URL (Google Meet, Teams, Zoom, Webex, Jitsi or other).
//
// CalDev has no dedicated conference field yet, so a link is kept inside the
// event's `location` ("Room 42 · https://meet.google.com/abc"). CalDev already
// sends `location` in invite emails and in the .ics, so other calendars show it.
// ============================================================================

export type MeetingProviderId =
  | "meet"
  | "teams"
  | "zoom"
  | "webex"
  | "jitsi"
  | "skype"
  | "goto"
  | "whereby"
  | "chime"
  | "bluejeans"
  | "other";

export interface MeetingLink {
  url: string;
  provider: MeetingProviderId;
  /** "Google Meet", "Microsoft Teams", … or the host name for other links */
  label: string;
}

type KnownProvider = Exclude<MeetingProviderId, "other">;

/**
 * Known meeting hosts. `host` is tested against the URL host name, `path` (when
 * given) against the path — e.g. g.co is only a meeting link under /meet.
 */
const PROVIDERS: { id: KnownProvider; label: string; host: RegExp; path?: RegExp }[] = [
  { id: "meet", label: "Google Meet", host: /(^|\.)meet\.google\.com$/i },
  { id: "meet", label: "Google Meet", host: /^g\.co$/i, path: /^\/meet\//i },
  { id: "teams", label: "Microsoft Teams", host: /(^|\.)teams\.(microsoft|live)\.(com|us)$/i },
  { id: "teams", label: "Microsoft Teams", host: /(^|\.)teams\.cloud\.microsoft$/i },
  { id: "zoom", label: "Zoom", host: /(^|\.)zoom(gov)?\.(us|com)$/i },
  { id: "webex", label: "Webex", host: /(^|\.)webex\.com$/i },
  { id: "jitsi", label: "Jitsi Meet", host: /(^|\.)(meet\.jit\.si|8x8\.vc)$/i },
  // self-hosted Jitsi usually lives on jitsi.<company-domain>
  { id: "jitsi", label: "Jitsi Meet", host: /(^|\.)jitsi\./i },
  { id: "skype", label: "Skype", host: /^join\.skype\.com$/i },
  { id: "goto", label: "GoTo Meeting", host: /(^|\.)(gotomeeting\.com|gotomeet\.me|meet\.goto\.com)$/i },
  { id: "whereby", label: "Whereby", host: /(^|\.)whereby\.com$/i },
  { id: "chime", label: "Amazon Chime", host: /(^|\.)chime\.aws$/i },
  { id: "bluejeans", label: "BlueJeans", host: /(^|\.)bluejeans\.com$/i },
];

/** http(s) URLs inside free text; stops at whitespace, quotes and closing brackets */
const URL_RE = /https?:\/\/[^\s<>"'`)\]]+/gi;

/**
 * Links typed without a scheme ("meet.google.com/abc-defg-hij", "zoom.us/j/123").
 * Only accepted when the host is a known meeting provider, so ordinary words
 * like "file.txt/x" are never treated as links.
 */
const BARE_RE = /(?<![\w@./:-])(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s<>"'`)\]]+/gi;

/** Strip punctuation that usually ends a sentence rather than the URL */
const trimUrl = (u: string) => u.replace(/[.,;:!?]+$/, "");

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function providerOf(u: URL) {
  return PROVIDERS.find((p) => p.host.test(u.hostname) && (!p.path || p.path.test(u.pathname)));
}

/** Describe a URL (scheme optional). Returns null when it isn't a valid web link. */
export function toMeetingLink(raw: string): MeetingLink | null {
  let url = trimUrl(raw.trim());
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^[^/]+\.[a-z]{2,}(:\d+)?\//i.test(url)) return null; // mailto:, tel:, sip: …
    url = `https://${url}`;
  }
  const u = parseUrl(url);
  if (!u || !/\.[a-z]{2,}$/i.test(u.hostname)) return null;
  const known = providerOf(u);
  return known
    ? { url, provider: known.id, label: known.label }
    : { url, provider: "other", label: u.hostname.replace(/^www\./i, "") };
}

/** Every link in the text: full URLs, plus bare links of known meeting providers. */
function urlsIn(text: string | undefined | null): string[] {
  if (!text) return [];
  const full = Array.from(text.matchAll(URL_RE), (m) => trimUrl(m[0]));
  const bare = Array.from(text.matchAll(BARE_RE), (m) => trimUrl(m[0])).filter((b) => {
    const u = parseUrl(`https://${b}`);
    return !!u && !!providerOf(u) && !full.some((f) => f.includes(b));
  });
  return [...full, ...bare];
}

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
  const raw = urlsIn(text)[0] || "";
  if (!raw) return { place: text.trim(), link: "" };
  const link = normalizeLink(raw);
  const place = text
    .replace(raw, "")
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
