"use client";

import type { ReactNode } from "react";
import { RiCloseLine, RiGroupLine, RiUserAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RSVP_DOT, RSVP_LABEL, RsvpSummary, normalizeRsvp } from "@/components/common/rsvp-summary";
import type { CalDevAttendee } from "../../../_lib/caldev-types";
import { FormCard, bareInputClass } from "./primitives";

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
}: {
  guests: CalDevAttendee[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (email: string) => void;
  readOnly?: boolean;
  /** organizer email (without mailto:) shown above the list */
  organizer?: string;
  myEmail?: string | null;
  /** extra content under the header, e.g. the user's own Yes / Maybe / No */
  headerSlot?: ReactNode;
}) {
  return (
    <FormCard
      icon={<RiGroupLine size={16} />}
      title="Guests"
      meta={guests.length > 0 ? `${guests.length} ${guests.length === 1 ? "person" : "people"}` : undefined}
      bodyClassName="p-0"
    >
      {headerSlot && <div className="border-b border-border/60 px-4 py-2.5">{headerSlot}</div>}

      {!readOnly && (
        <div className="flex items-center gap-2 px-4 py-1.5">
          <RiUserAddLine size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            type="email"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
            placeholder="Invite people by email"
            aria-label="Guest email"
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
        </div>
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
                  {g.display_name && g.display_name !== g.email && (
                    <p className="truncate text-xs text-muted-foreground">{g.email}</p>
                  )}
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
