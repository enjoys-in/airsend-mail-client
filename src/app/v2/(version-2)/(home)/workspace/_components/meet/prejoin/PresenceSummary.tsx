"use client";

import React from "react";
import { CircleOff, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeetingPresence } from "../../../_lib/meet/types";
import PersonAvatar from "./PersonAvatar";

export interface PresenceSummaryProps {
  presence: Pick<MeetingPresence, "loading" | "exists" | "ended" | "participants" | "count" | "organizer" | "error">;
  /** How many faces to show before "+N". */
  maxAvatars?: number;
  className?: string;
}

/** Who is already in the meeting, from real data: count, names, and who organises it. Never invents anyone. */
export default function PresenceSummary({ presence, maxAvatars = 5, className }: PresenceSummaryProps) {
  const { loading, exists, ended, participants, count, organizer, error } = presence;

  const shell = (children: React.ReactNode) => (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/50 p-4", className)} aria-live="polite">
      {children}
    </div>
  );

  if (loading) {
    return shell(
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-4 w-44 bg-slate-800" />
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="size-8 rounded-full border-2 border-slate-900 bg-slate-800" />
          ))}
        </div>
      </div>,
    );
  }

  if (ended) {
    return shell(
      <p className="flex items-center gap-2 text-sm text-slate-300">
        <CircleOff className="size-4 text-slate-500" /> This meeting has ended.
      </p>,
    );
  }

  if (exists === false) {
    return shell(
      <p className="flex items-center gap-2 text-sm text-amber-200">
        <CircleOff className="size-4" /> We could not find this meeting. Check the link or ask the organizer.
      </p>,
    );
  }

  const organizerKey = organizer?.email?.toLowerCase();
  const isOrganizer = (p: (typeof participants)[number]) =>
    p.isHost || (!!organizerKey && p.email?.toLowerCase() === organizerKey) || (!!organizer && p.name === organizer.name);
  // Organizer first, so they are never hidden behind "+N".
  const ordered = [...participants].sort((a, b) => Number(isOrganizer(b)) - Number(isOrganizer(a)));
  const shown = ordered.slice(0, maxAvatars);
  const extra = Math.max(0, count - shown.length);

  return shell(
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
        <Users className="size-4 text-blue-400" />
        {count === 0 ? "No one has joined yet" : `${count} ${count === 1 ? "person is" : "people are"} in this meeting`}
      </p>

      {count > 0 && (
        <ul className="space-y-1.5" aria-label="People in this meeting">
          {shown.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5">
              <PersonAvatar name={p.name} src={p.avatar} className="size-7" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{p.name}</span>
              {isOrganizer(p) && (
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] text-blue-300">Organizer</span>
              )}
            </li>
          ))}
          {extra > 0 && <li className="pl-9 text-xs text-slate-400">and {extra} more</li>}
        </ul>
      )}

      {/* The organizer is known but not in the call yet */}
      {organizer && !participants.some(isOrganizer) && (
        <p className="text-xs text-slate-400">
          Organized by <span className="text-slate-200">{organizer.name}</span>
          {count === 0 ? ". They have not joined yet." : "."}
        </p>
      )}
      {count === 0 && !organizer && <p className="text-xs text-slate-400">You will be the first one here.</p>}

      {error && <p className="text-[11px] text-slate-500">We could not check who is in the meeting just now.</p>}
    </div>,
  );
}
