"use client";

import React from "react";
import Link from "next/link";
import { CalendarClock, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Meeting } from "../../_lib/chat-types";

/**
 * The strip at the top of a channel when a meeting is on. `live` means it has really started; `starting` means it was
 * scheduled and its time has come (it is NOT called live: nobody has necessarily joined yet).
 */
export default function ChannelMeetingBanner({ meeting, phase }: { meeting: Meeting; phase: "live" | "starting" }) {
  if (phase === "live") {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Radio className="size-3.5 shrink-0 animate-pulse text-red-500" />
          <span className="truncate text-xs font-medium text-red-600 dark:text-red-400">Live meeting in progress: {meeting.title}</span>
          <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">• Started by {meeting.organizerName}</span>
        </div>
        <Button size="sm" asChild className="h-7 shrink-0 gap-1 bg-red-600 text-xs text-white shadow-sm hover:bg-red-700">
          <Link href={meeting.meetingUrl}>
            <Video className="size-3" />
            Join
          </Link>
        </Button>
      </div>
    );
  }

  const at = new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <CalendarClock className="size-3.5 shrink-0 text-amber-500" />
        <span className="truncate text-xs font-medium text-amber-700 dark:text-amber-400">
          Meeting scheduled for {at}: {meeting.title}
        </span>
        <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">• Organized by {meeting.organizerName}</span>
      </div>
      <Button size="sm" variant="outline" asChild className="h-7 shrink-0 gap-1 text-xs">
        <Link href={meeting.meetingUrl}>
          <Video className="size-3" />
          Join
        </Link>
      </Button>
    </div>
  );
}
