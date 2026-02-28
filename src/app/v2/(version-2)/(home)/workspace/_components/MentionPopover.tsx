"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "../_lib/chat-store";

// ---------------------------------------------------------------------------
// MentionPopover — @mention suggestion dropdown
// ---------------------------------------------------------------------------

export default function MentionPopover({
  query,
  onSelect,
  onClose,
}: {
  query: string;
  onSelect: (username: string) => void;
  onClose: () => void;
}) {
  const { members, activeTeamId } = useChatStore();

  const teamMembers = members.filter(
    (m) =>
      m.teamId === activeTeamId &&
      (m.username.toLowerCase().includes(query.toLowerCase()) ||
        m.displayName.toLowerCase().includes(query.toLowerCase())),
  );

  if (teamMembers.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 z-20 mb-1 w-64 rounded-lg border border-border/60 bg-popover shadow-lg">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Members
      </div>
      <ScrollArea className="max-h-48">
        {teamMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member.username)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {member.displayName.charAt(0)}
              <span
                className={cn(
                  "absolute -bottom-0 -right-0 size-2 rounded-full border border-popover",
                  member.status === "online" && "bg-emerald-500",
                  member.status === "idle" && "bg-yellow-500",
                  member.status === "dnd" && "bg-red-500",
                  member.status === "offline" && "bg-gray-400",
                )}
              />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-medium">
                {member.displayName}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                @{member.username}
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
