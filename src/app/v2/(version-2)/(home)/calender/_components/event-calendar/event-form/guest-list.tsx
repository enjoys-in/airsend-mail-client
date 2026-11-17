"use client";

import { RiCloseLine, RiGroupLine, RiUserAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalDevAttendee } from "../../../_lib/caldev-types";
import { FormCard, bareInputClass } from "./primitives";

const STATUS_LABEL: Record<string, string> = {
  "NEEDS-ACTION": "Invited",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  TENTATIVE: "Maybe",
};

function initials(name: string): string {
  const parts = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Guests card: add by email, list with initials avatar, RSVP status and remove. */
export function GuestList({
  guests,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
}: {
  guests: CalDevAttendee[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (email: string) => void;
}) {
  return (
    <FormCard
      icon={<RiGroupLine size={16} />}
      title="Guests"
      meta={guests.length > 0 ? `${guests.length} ${guests.length === 1 ? "person" : "people"}` : undefined}
      bodyClassName="p-0"
    >
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

      {guests.length > 0 && (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {guests.map((g) => (
            <li key={g.email} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {initials(g.display_name || g.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{g.display_name || g.email}</p>
                {g.display_name && g.display_name !== g.email && (
                  <p className="truncate text-xs text-muted-foreground">{g.email}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {STATUS_LABEL[g.status] ?? g.status}
              </span>
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
            </li>
          ))}
        </ul>
      )}
    </FormCard>
  );
}
