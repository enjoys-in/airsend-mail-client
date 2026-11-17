"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/db";
import { Security } from "@/lib/security";
import { getAvailability, searchPeople, type PersonAvailability } from "./caldev-api";

/**
 * Guest suggestions and free/busy dots for the event dialog.
 *
 *  - contacts: people from the user's own mail (senders and recipients), most frequent first;
 *  - team: people of the same organisation from CalDev, with free/busy for the event's time.
 *
 * Both are merged by email. A person's dot answers one question: "are they free when this
 * event happens?" (green free, red busy, amber maybe, grey not shared).
 */

export type Availability = "free" | "busy" | "tentative" | "unknown";

export interface GuestSuggestion {
  email: string;
  name: string;
  /** "team" = same organisation (CalDev), "contact" = from the user's mail */
  source: "team" | "contact";
  availability: Availability;
  /** short wording for the dot: "Free at this time", "Busy 2:00 PM – 3:00 PM", ... */
  hint: string;
}

type Status = Pick<GuestSuggestion, "availability" | "hint">;

const EMAIL = /[^\s<>"',;]+@[^\s<>"',;]+\.[^\s<>"',;]+/;
const security = new Security();

function decrypt(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  if (!value.includes(":")) return value;
  try {
    return security.decryptAES(value) || value;
  } catch {
    return value;
  }
}

/** "Ann Lee <ann@x.com>" → { name: "Ann Lee", email: "ann@x.com" } */
function parseAddress(raw: string): { name: string; email: string } | null {
  const m = raw.match(EMAIL);
  if (!m) return null;
  const email = m[0].toLowerCase();
  const name = raw.replace(m[0], "").replace(/[<>"']/g, "").trim();
  return { email, name: name && name.toLowerCase() !== email ? name : "" };
}

interface Contact {
  email: string;
  name: string;
  count: number;
}

let contactCache: { at: number; mine: string; list: Contact[] } | null = null;
const CONTACT_TTL = 2 * 60 * 1000;
const CONTACT_SCAN = 2000; // mails read from the local store

async function loadContacts(myEmail: string): Promise<Contact[]> {
  if (contactCache && contactCache.mine === myEmail && Date.now() - contactCache.at < CONTACT_TTL) {
    return contactCache.list;
  }
  const seen = new Map<string, Contact>();
  const add = (raw: string) => {
    const p = parseAddress(raw);
    if (!p || p.email === myEmail) return;
    const cur = seen.get(p.email);
    if (cur) {
      cur.count++;
      if (!cur.name && p.name) cur.name = p.name;
    } else {
      seen.set(p.email, { ...p, count: 1 });
    }
  };
  try {
    const mails = await db.mails.limit(CONTACT_SCAN).toArray();
    for (const m of mails) {
      add(decrypt(m.from_email));
      const to = m.receipients as unknown;
      if (Array.isArray(to)) to.forEach((r) => add(decrypt(r)));
    }
  } catch {
    // the local store is a convenience: suggestions still work from the team directory
  }
  const list = [...seen.values()].sort((a, b) => b.count - a.count);
  contactCache = { at: Date.now(), mine: myEmail, list };
  return list;
}

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** Dot + hint for one person over the event's [start, end). */
export function availabilityOf(p: PersonAvailability | undefined, start: Date, end: Date): Status {
  if (!p || !p.allowed) return { availability: "unknown", hint: "Availability not shared" };
  const s = start.getTime();
  const e = Math.max(end.getTime(), s + 1);
  const hit = p.busy.filter((b) => new Date(b.start).getTime() < e && new Date(b.end).getTime() > s);
  if (hit.length === 0) return { availability: "free", hint: "Free at this time" };
  const sure = hit.find((b) => b.status !== "tentative");
  const b = sure ?? hit[0];
  const span = `${clock(b.start)} – ${clock(b.end)}`;
  // CalDev shares free/busy only (no titles), so all we can say is that something is booked
  return sure
    ? { availability: "busy", hint: `Has a meeting ${span}` }
    : { availability: "tentative", hint: `May have a meeting ${span}` };
}

/**
 * @param query   what the user typed under "Invite people"
 * @param exclude emails already invited
 */
export function useGuestSuggestions({
  query,
  start,
  end,
  exclude,
  myEmail,
  enabled,
}: {
  query: string;
  start: Date;
  end: Date;
  exclude: string[];
  myEmail?: string | null;
  enabled: boolean;
}) {
  const me = (myEmail ?? "").toLowerCase();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [team, setTeam] = useState<PersonAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // contacts: read once per open, cached for a couple of minutes
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadContacts(me).then((c) => alive && setContacts(c));
    return () => {
      alive = false;
    };
  }, [enabled, me]);

  // team: debounced; the previous request is cancelled; one call also returns the free/busy
  const startMs = start.getTime();
  const endMs = end.getTime();
  const q = query.trim();
  useEffect(() => {
    if (!enabled) return;
    const ctl = new AbortController();
    setLoading(true);
    const t = setTimeout(
      () => {
        searchPeople(q, { start: new Date(startMs), end: new Date(endMs) }, 8, ctl.signal)
          .then((r) => !ctl.signal.aborted && setTeam(r))
          .catch(() => !ctl.signal.aborted && setTeam([]))
          .finally(() => !ctl.signal.aborted && setLoading(false));
      },
      q ? 200 : 0,
    );
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [enabled, q, startMs, endMs]);

  const excludeKey = exclude.map((e) => e.toLowerCase()).join(",");
  const suggestions = useMemo<GuestSuggestion[]>(() => {
    const skip = new Set([me, ...excludeKey.split(",").filter(Boolean)]);
    const out = new Map<string, GuestSuggestion>();
    const from = new Date(startMs);
    const to = new Date(endMs);

    for (const p of team) {
      const email = p.email.toLowerCase();
      if (skip.has(email)) continue;
      out.set(email, { email: p.email, name: p.name || "", source: "team", ...availabilityOf(p, from, to) });
    }
    const needle = q.toLowerCase();
    let fromContacts = 0;
    for (const c of contacts) {
      if (fromContacts >= 6) break;
      if (skip.has(c.email) || out.has(c.email)) continue;
      if (needle && !c.email.startsWith(needle) && !c.name.toLowerCase().includes(needle)) continue;
      out.set(c.email, { email: c.email, name: c.name, source: "contact", availability: "unknown", hint: "Availability not shared" });
      fromContacts++;
    }
    return [...out.values()].slice(0, 10);
  }, [team, contacts, q, excludeKey, me, startMs, endMs]);

  return { suggestions, loading };
}

/**
 * Free/busy dots for the guests already on the event. Refreshes when the event time or the guest
 * list changes. Returns a map keyed by lower-cased email.
 */
export function useGuestAvailability({
  emails,
  start,
  end,
  enabled,
}: {
  emails: string[];
  start: Date;
  end: Date;
  enabled: boolean;
}) {
  const [byEmail, setByEmail] = useState<Record<string, Status>>({});
  const key = emails.map((e) => e.toLowerCase()).sort().join(",");
  const startMs = start.getTime();
  const endMs = end.getTime();
  const latest = useRef(0);

  useEffect(() => {
    if (!enabled || !key) {
      setByEmail({});
      return;
    }
    const id = ++latest.current;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      getAvailability(key.split(","), { start: new Date(startMs), end: new Date(endMs) }, ctl.signal)
        .then((rows) => {
          if (id !== latest.current) return;
          const next: Record<string, Status> = {};
          for (const r of rows) next[r.email.toLowerCase()] = availabilityOf(r, new Date(startMs), new Date(endMs));
          setByEmail(next);
        })
        .catch(() => {
          if (id === latest.current) setByEmail({});
        });
    }, 250);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [enabled, key, startMs, endMs]);

  return byEmail;
}
