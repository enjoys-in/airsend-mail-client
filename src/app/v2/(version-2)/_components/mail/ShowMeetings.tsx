"use client"
import React, { useEffect, useMemo } from 'react'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useCalDevStore } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-store"
import { RiTimeLine } from "@remixicon/react"

const ShowMeetings = () => {
  const rawEvents = useCalDevStore((s) => s.rawEvents)
  const calendars = useCalDevStore((s) => s.calendars)
  const fetchEvents = useCalDevStore((s) => s.fetchEvents)
  const initSession = useCalDevStore((s) => s.initSession)
  const accountId = useCalDevStore((s) => s.accountId)

  // Fetch today's events independently on mount if not already loaded
  useEffect(() => {
    const bootstrap = async () => {
      if (!accountId) {
        await initSession();
      }
      // Fetch events for today ± 1 day to catch upcoming meetings
      const now = new Date();
      const after = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const before = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString();
      await fetchEvents(after, before);
    };
    bootstrap();
  }, [accountId, fetchEvents, initSession])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return rawEvents
      .filter((e) => {
        const end = new Date(e.dtend || e.dtstart)
        return end >= now && e.status !== "CANCELLED"
      })
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime())
      .slice(0, 3)
  }, [rawEvents])

  if (upcomingEvents.length === 0) return null

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="hover:no-underline w-full py-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium">Upcoming meetings</h3>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-0.5">
            {upcomingEvents.map((ev, idx) => {
              const cal = calendars.find((c) => c.id === ev.calendar_id)
              const start = new Date(ev.dtstart)
              const end = ev.dtend ? new Date(ev.dtend) : null
              const now = new Date()
              const isToday =
                start.getFullYear() === now.getFullYear() &&
                start.getMonth() === now.getMonth() &&
                start.getDate() === now.getDate()

              const timeFmt = (d: Date) =>
                d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              const timeLabel = ev.all_day
                ? "All day"
                : `${timeFmt(start)}${end ? ` – ${timeFmt(end)}` : ""}`
              const dateLabel = isToday
                ? "Today"
                : start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })

              // Gap to next event
              const nextEv = upcomingEvents[idx + 1]
              let gapLabel: string | null = null
              if (nextEv && end) {
                const gapMs = new Date(nextEv.dtstart).getTime() - end.getTime()
                if (gapMs > 0) {
                  const gapMin = Math.round(gapMs / 60000)
                  if (gapMin < 60) gapLabel = `${gapMin}m gap`
                  else {
                    const h = Math.floor(gapMin / 60)
                    const m = gapMin % 60
                    gapLabel = m > 0 ? `${h}h ${m}m gap` : `${h}h gap`
                  }
                }
              }

              return (
                <div key={ev.id}>
                  <div className="flex items-start gap-2 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: cal?.color || "#6366F1" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {ev.summary || "Untitled event"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <RiTimeLine size={11} className="shrink-0 text-muted-foreground/60" />
                        <span className="text-[11px] text-muted-foreground">
                          {dateLabel} · {timeLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  {gapLabel && (
                    <div className="flex items-center gap-2 px-3 py-0.5">
                      <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
                      <span className="text-[10px] text-muted-foreground/50">{gapLabel}</span>
                      <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ShowMeetings