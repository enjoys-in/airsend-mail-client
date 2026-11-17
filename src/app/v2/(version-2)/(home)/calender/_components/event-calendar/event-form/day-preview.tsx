"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, isSameDay, isToday, startOfDay } from "date-fns";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useCalDevStore } from "../../../_lib/caldev-store";
import { expandEvents } from "../../../_lib/recurrence";

const HOUR_PX = 44;
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const HOUR_MS = 36e5;

export interface PreviewEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  /** hex colour */
  color: string;
}

interface Item extends PreviewEvent {
  key: string;
  isDraft?: boolean;
}

/** "#RRGGBB" → rgba() with the given alpha (falls back to the input). */
function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Read-only day timeline: the event being edited (`draft`) placed among the other
 * events of that day, so the user sees where it lands. Arrows browse days.
 */
export function DayPreview({
  draft,
  excludeId,
  className,
}: {
  draft: PreviewEvent;
  /** series/event id being edited — hidden so it isn't shown twice */
  excludeId?: string;
  className?: string;
}) {
  const draftDay = startOfDay(draft.start).getTime();
  const [day, setDay] = useState(() => new Date(draftDay));
  useEffect(() => setDay(new Date(draftDay)), [draftDay]); // follow the event's date

  const rawEvents = useCalDevStore((s) => s.rawEvents);
  const calendars = useCalDevStore((s) => s.calendars);

  const items = useMemo<Item[]>(() => {
    const colorOf = new Map(calendars.map((c) => [c.id, c.color]));
    const to = addDays(day, 1);
    const others: Item[] = expandEvents(rawEvents, (id) => colorOf.get(id), day, to)
      .filter((e) => (e.seriesId ?? e.id) !== excludeId && e.status !== "CANCELLED")
      .map((e) => ({
        key: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: !!e.allDay,
        color: (e.calendarId && colorOf.get(e.calendarId)) || "#6366F1",
      }));
    const draftVisible = draft.start < to && draft.end >= day;
    return draftVisible ? [...others, { ...draft, key: "draft", isDraft: true }] : others;
  }, [rawEvents, calendars, day, draft, excludeId]);

  const allDayItems = items.filter((i) => i.allDay);
  const timedItems = items.filter((i) => !i.allDay);

  // Scroll so the event (or the morning) is in view
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusHour = isSameDay(day, draft.start) && !draft.allDay ? draft.start.getHours() : 8;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: Math.max(0, (focusHour - 1.5) * HOUR_PX) });
  }, [focusHour, day]);

  const dayStart = day.getTime();
  const place = (i: Item) => {
    const s = Math.max(i.start.getTime(), dayStart);
    const e = Math.min(i.end.getTime(), dayStart + 24 * HOUR_MS);
    return {
      top: ((s - dayStart) / HOUR_MS) * HOUR_PX,
      height: Math.max(((e - s) / HOUR_MS) * HOUR_PX, 20),
    };
  };
  const nowTop = isToday(day) ? ((Date.now() - dayStart) / HOUR_MS) * HOUR_PX : null;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background",
        className,
      )}
    >
      <header className="flex items-center gap-1 border-b border-border/60 px-2 py-2">
        {[
          { label: "Previous day", icon: <RiArrowLeftSLine size={16} />, delta: -1 },
          { label: "Next day", icon: <RiArrowRightSLine size={16} />, delta: 1 },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            onClick={() => setDay((d) => addDays(d, b.delta))}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {b.icon}
          </button>
        ))}
        <p className="ml-1 flex-1 truncate text-sm font-medium">{format(day, "EEE, d MMM yyyy")}</p>
        {day.getTime() !== draftDay && (
          <button
            type="button"
            onClick={() => setDay(new Date(draftDay))}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Back to event
          </button>
        )}
      </header>

      {allDayItems.length > 0 && (
        <div className="space-y-1 border-b border-border/60 px-2 py-2">
          {allDayItems.map((i) => (
            <div
              key={i.key}
              className={cn(
                "truncate rounded-md border-l-[3px] px-2 py-1 text-xs",
                i.isDraft ? "font-medium text-foreground" : "text-muted-foreground",
              )}
              style={{ borderColor: i.color, backgroundColor: withAlpha(i.color, i.isDraft ? 0.22 : 0.1) }}
            >
              {i.title || "(no title)"}
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative" style={{ height: 24 * HOUR_PX }}>
          {HOURS.map((h) => (
            <div key={h} className="absolute inset-x-0 flex" style={{ top: h * HOUR_PX, height: HOUR_PX }}>
              <span className="w-12 shrink-0 -translate-y-2 pr-2 text-right text-[10px] tabular-nums text-muted-foreground">
                {h > 0 && format(new Date(2000, 0, 1, h), "h a")}
              </span>
              <div className="relative flex-1 border-t border-border/50">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/30" />
              </div>
            </div>
          ))}

          <div className="absolute inset-y-0 left-12 right-2">
            {timedItems.map((i) => (
              <div
                key={i.key}
                className={cn(
                  "absolute overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-xs leading-tight",
                  i.isDraft
                    ? "left-5 right-0 z-10 font-medium text-foreground shadow-sm"
                    : "left-0 right-0 text-muted-foreground",
                )}
                style={{
                  ...place(i),
                  borderColor: i.color,
                  backgroundColor: withAlpha(i.color, i.isDraft ? 0.25 : 0.12),
                }}
              >
                <p className="truncate">{i.title || "(no title)"}</p>
                <p className="truncate text-[10px] opacity-75">
                  {format(i.start, "h:mm a")} – {format(i.end, "h:mm a")}
                </p>
              </div>
            ))}
            {nowTop !== null && (
              <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: nowTop }}>
                <div className="h-px bg-red-500" />
                <div className="absolute -left-1 -top-[3px] size-[7px] rounded-full bg-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
