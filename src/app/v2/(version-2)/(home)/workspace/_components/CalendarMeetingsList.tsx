"use client";

import Link from "next/link";
import { CalendarClock, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUpcomingEvents } from "../../calender/_lib/use-upcoming-events";
import { meetingLink, meetingWhen } from "./UpcomingMeetings";

export default function CalendarMeetingsList({ todayOnly }: { todayOnly: boolean }) {
  const events = useUpcomingEvents({ limit: 20, horizonDays: todayOnly ? 1 : 14 });
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const shown = todayOnly ? events.filter((event) => event.start < endOfToday) : events;
  if (shown.length === 0) return null;

  return (
    <section className="space-y-2" data-testid="calendar-meetings">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarClock className="size-4 text-emerald-500" />
          From your calendar
          <Badge variant="outline" className="text-[11px] font-normal">{shown.length}</Badge>
        </h2>
        <Link href="/v2/calender" className="text-xs text-muted-foreground hover:text-foreground">
          Open calendar
        </Link>
      </div>
      <ul className="divide-y divide-border/50 rounded-lg border border-border/60 bg-card">
        {shown.map((event) => {
          const link = meetingLink(event);
          const when = meetingWhen(event, now);
          const live = when === "Now";
          const attendees = event.attendees?.length ?? 0;
          return (
            <li key={event.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className={`w-20 shrink-0 text-xs ${live ? "font-semibold text-red-500" : "text-muted-foreground"}`}>{when}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{event.title || "Untitled meeting"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {attendees > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Users className="size-3" />
                      {attendees}
                    </span>
                  )}
                </p>
              </div>
              {link && (
                <Button asChild size="sm" variant={live ? "default" : "outline"} className="h-7 gap-1 text-xs">
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <Video className="size-3.5" />
                    Join
                  </a>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
