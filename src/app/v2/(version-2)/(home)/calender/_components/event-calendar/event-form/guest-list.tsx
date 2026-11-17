"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { RiCloseLine, RiGroupLine, RiUserAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RSVP_DOT, RSVP_LABEL, RsvpSummary, normalizeRsvp } from "@/components/common/rsvp-summary";
import type { CalDevAttendee } from "../../../_lib/caldev-types";
import type { Availability, GuestSuggestion } from "../../../_lib/use-guest-suggestions";
import { FormCard, bareInputClass } from "./primitives";

/** Green = free at the event's time, red = busy, amber = maybe busy, grey = not shared. */
const AVAILABILITY_DOT: Record<Availability, string> = {
  free: "bg-emerald-500",
  busy: "bg-red-500",
  tentative: "bg-amber-500",
  unknown: "bg-muted-foreground/40",
};

function StatusDot({ value, className }: { value: Availability; className?: string }) {
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", AVAILABILITY_DOT[value], className)} aria-hidden="true" />;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(name: string): string {
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const sameEmail = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Guests card: add by email, reply counts (going / maybe / not going / awaiting),
 * list with each guest's answer. `readOnly` is used when the user is a guest of
 * someone else's event — they can see the list but not change it.
 */
export function GuestList({
  guests,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  readOnly = false,
  organizer,
  myEmail,
  headerSlot,
  suggestions = [],
  suggestionsLoading = false,
  onPick,
  availability,
}: {
  guests: CalDevAttendee[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (email: string) => void;
  /** people offered while typing (team + contacts); picking one adds it as a guest */
  suggestions?: GuestSuggestion[];
  suggestionsLoading?: boolean;
  onPick?: (person: GuestSuggestion) => void;
  /** free/busy of the people already invited, by lower-cased email */
  availability?: Record<string, { availability: Availability; hint: string }>;
  readOnly?: boolean;
  /** organizer email (without mailto:) shown above the list */
  organizer?: string;
  myEmail?: string | null;
  /** extra content under the header, e.g. the user's own Yes / Maybe / No */
  headerSlot?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // invited people who are busy at the event's time (names, or emails when there is no name)
  const conflicts = guests
    .filter((g) => availability?.[g.email.toLowerCase()]?.availability === "busy")
    .map((g) => g.display_name || g.email);

  // a typed address that is not in the list can still be invited
  const typed = draft.trim();
  const canInviteTyped =
    EMAIL_RE.test(typed) && !suggestions.some((s) => s.email.toLowerCase() === typed.toLowerCase());
  const rows = suggestions.length + (canInviteTyped ? 1 : 0);
  const showMenu = open && !readOnly && (rows > 0 || suggestionsLoading);

  useEffect(() => setActive(-1), [draft, suggestions.length]);

  const choose = (i: number) => {
    if (i < suggestions.length) onPick?.(suggestions[i]);
    else onAdd();
    setActive(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && rows > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % rows);
    } else if (e.key === "ArrowUp" && rows > 0) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? rows - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showMenu && active >= 0) choose(active);
      else onAdd();
    } else if (e.key === "Escape" && showMenu) {
      setOpen(false);
    }
  };

  return (
    <FormCard
      icon={<RiGroupLine size={16} />}
      title="Guests"
      meta={guests.length > 0 ? `${guests.length} ${guests.length === 1 ? "person" : "people"}` : undefined}
      bodyClassName="p-0"
    >
      {headerSlot && <div className="border-b border-border/60 px-4 py-2.5">{headerSlot}</div>}

      {!readOnly && (
        <div className="relative flex items-center gap-2 px-4 py-1.5">
          <RiUserAddLine size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            type="email"
            value={draft}
            onChange={(e) => {
              onDraftChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            placeholder="Search your team and contacts, or type an email"
            aria-label="Guest email"
            aria-autocomplete="list"
            aria-expanded={showMenu}
            autoComplete="off"
            className={bareInputClass}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 shrink-0 rounded-lg"
            onClick={onAdd}
            disabled={!draft.trim()}
          >
            Add
          </Button>

          {showMenu && (
            <ul
              role="listbox"
              aria-label="Suggested guests"
              // mouse-down would blur the input and close the list before the click lands
              onMouseDown={(e) => e.preventDefault()}
              className="absolute inset-x-2 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg"
            >
              {suggestions.map((s, i) => (
                <li key={s.email} role="option" aria-selected={active === i}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left",
                      active === i ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {initials(s.name || s.email)}
                      <StatusDot value={s.availability} className="absolute -bottom-0.5 -right-0.5 size-2.5 ring-2 ring-popover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.name || s.email}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.name ? `${s.email} · ` : ""}
                        {s.hint}
                      </span>
                    </span>
                    {s.source === "team" && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Team
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {canInviteTyped && (
                <li role="option" aria-selected={active === suggestions.length}>
                  <button
                    type="button"
                    onClick={() => choose(suggestions.length)}
                    onMouseEnter={() => setActive(suggestions.length)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
                      active === suggestions.length ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <RiUserAddLine size={14} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      Invite <span className="font-medium">{typed}</span>
                    </span>
                  </button>
                </li>
              )}
              {rows === 0 && suggestionsLoading && (
                <li className="px-3 py-2 text-xs text-muted-foreground">Searching…</li>
              )}
            </ul>
          )}
        </div>
      )}

      {!readOnly && conflicts.length > 0 && (
        <p className="flex items-start gap-2 border-t border-border/60 bg-red-500/5 px-4 py-2.5 text-xs text-red-600 dark:text-red-400">
          <StatusDot value="busy" className="mt-1" />
          <span>
            <span className="font-medium">{conflicts.join(", ")}</span>{" "}
            {conflicts.length === 1 ? "has" : "have"} a meeting at this time. Pick another time or invite anyway.
          </span>
        </p>
      )}

      {guests.length > 0 && (
        <div className={cn("px-4 py-2.5", !readOnly && "border-t border-border/60")}>
          <RsvpSummary people={guests} />
        </div>
      )}

      {organizer && (
        <p className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          Organizer: <span className="text-foreground">{sameEmail(organizer, myEmail) ? "You" : organizer}</span>
        </p>
      )}

      {guests.length > 0 && (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {guests.map((g) => {
            const st = normalizeRsvp(g.status);
            return (
              <li key={g.email} className="flex items-center gap-3 px-4 py-2.5">
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {initials(g.display_name || g.email)}
                  <span
                    className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background", RSVP_DOT[st])}
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {g.display_name || g.email}
                    {sameEmail(g.email, myEmail) && <span className="ml-1 text-xs font-normal text-muted-foreground">(you)</span>}
                  </p>
                  {(() => {
                    const free = availability?.[g.email.toLowerCase()];
                    const showEmail = g.display_name && g.display_name !== g.email;
                    if (!showEmail && !free) return null;
                    return (
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        {showEmail && <span className="truncate">{g.email}</span>}
                        {showEmail && free && <span aria-hidden="true">·</span>}
                        {free && (
                          <span className="inline-flex shrink-0 items-center gap-1.5">
                            <StatusDot value={free.availability} />
                            {free.hint}
                          </span>
                        )}
                      </p>
                    );
                  })()}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    st === "ACCEPTED" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    st === "TENTATIVE" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    st === "DECLINED" && "bg-red-500/10 text-red-600 dark:text-red-400",
                    st === "NEEDS-ACTION" && "bg-muted text-muted-foreground",
                  )}
                >
                  {RSVP_LABEL[st]}
                </span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 rounded-full text-muted-foreground"
                    onClick={() => onRemove(g.email)}
                    aria-label={`Remove ${g.email}`}
                  >
                    <RiCloseLine size={14} />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </FormCard>
  );
}
