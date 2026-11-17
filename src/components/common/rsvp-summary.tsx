"use client";

import { cn } from "@/lib/utils";

export type RsvpStatus = "ACCEPTED" | "TENTATIVE" | "DECLINED" | "NEEDS-ACTION";

export const RSVP_DOT: Record<RsvpStatus, string> = {
  ACCEPTED: "bg-emerald-500",
  TENTATIVE: "bg-amber-500",
  DECLINED: "bg-red-500",
  "NEEDS-ACTION": "bg-muted-foreground/40",
};

export const RSVP_LABEL: Record<RsvpStatus, string> = {
  ACCEPTED: "Going",
  TENTATIVE: "Maybe",
  DECLINED: "Not going",
  "NEEDS-ACTION": "Awaiting",
};

/** Anything other than a reply (DELEGATED, empty, unknown) counts as awaiting. */
export function normalizeRsvp(status: string | undefined | null): RsvpStatus {
  const s = (status || "").toUpperCase();
  return s === "ACCEPTED" || s === "TENTATIVE" || s === "DECLINED" ? s : "NEEDS-ACTION";
}

export function countRsvp(people: { status?: string | null }[]): Record<RsvpStatus, number> {
  const out: Record<RsvpStatus, number> = { ACCEPTED: 0, TENTATIVE: 0, DECLINED: 0, "NEEDS-ACTION": 0 };
  for (const p of people) out[normalizeRsvp(p.status)]++;
  return out;
}

const ORDER: RsvpStatus[] = ["ACCEPTED", "TENTATIVE", "DECLINED", "NEEDS-ACTION"];

/**
 * "3 going · 1 maybe · 1 not going · 2 awaiting" with a stacked progress bar.
 * Zero counts are hidden; nothing renders when there are no guests.
 */
export function RsvpSummary({
  people,
  showBar = true,
  className,
}: {
  people: { status?: string | null }[];
  showBar?: boolean;
  className?: string;
}) {
  if (people.length === 0) return null;
  const counts = countRsvp(people);
  const total = people.length;

  return (
    <div className={cn("space-y-1.5", className)}>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-label="Guest replies">
        {ORDER.filter((k) => counts[k] > 0).map((k) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", RSVP_DOT[k])} />
            <span>
              <b className="font-semibold tabular-nums text-foreground">{counts[k]}</b> {RSVP_LABEL[k].toLowerCase()}
            </span>
          </li>
        ))}
      </ul>
      {showBar && (
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
          {ORDER.filter((k) => counts[k] > 0 && k !== "NEEDS-ACTION").map((k) => (
            <span key={k} className={RSVP_DOT[k]} style={{ width: `${(counts[k] / total) * 100}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}
