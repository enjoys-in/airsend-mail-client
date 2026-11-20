"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, ChevronDown, ChevronRight, Video } from "lucide-react";
import { useUpcomingEvents } from "../../calender/_lib/use-upcoming-events";
import type { CalendarEvent } from "../../calender/_components/event-calendar/types";
import { cn } from "@/lib/utils";

const LINK_PATTERN = /https?:\/\/[^\s<>"']+/i;

export function meetingLink(event: CalendarEvent): string | null {
  for (const text of [event.location, event.description]) {
    const match = text?.match(LINK_PATTERN);
    if (match) return match[0].replace(/[),.;]+$/, "");
  }
  return null;
}

export function meetingWhen(event: CalendarEvent, now = new Date()): string {
  if (event.start <= now && event.end > now) return "Now";
  const time = event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const startDay = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((startDay - today) / 86_400_000);
  if (days === 0) return time;
  if (days === 1) return `Tomorrow ${time}`;
  return `${event.start.toLocaleDateString([], { weekday: "short" })} ${time}`;
}

export default function UpcomingMeetings() {
  const [open, setOpen] = useState(true);
  const events = useUpcomingEvents({ limit: 3, horizonDays: 7 });
  if (events.length === 0) return null;

  return (
    <div className="px-1 pb-1" data-testid="sidebar-upcoming-meetings">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        Upcoming meetings
      </button>
      {open && (
        <ul className="space-y-0.5">
          {events.map((event) => {
            const link = meetingLink(event);
            const when = meetingWhen(event);
            const live = when === "Now";
            return (
              <li key={event.id}>
                <div className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-xs", live ? "bg-red-500/10" : "hover:bg-accent/50")}>
                  <CalendarClock className={cn("size-3.5 shrink-0", live ? "text-red-500" : "text-emerald-500")} />
                  <Link href="/v2/calender" className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{event.title || "Untitled meeting"}</span>
                    <span className={cn("block truncate", live ? "font-semibold text-red-500" : "text-muted-foreground")}>{when}</span>
                  </Link>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90"
                      title="Join meeting"
                    >
                      <Video className="size-3" />
                      Join
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
