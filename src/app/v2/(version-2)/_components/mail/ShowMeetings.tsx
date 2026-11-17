"use client"
import React from 'react'
import Link from 'next/link'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useCalDevStore } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-store"
import { useUpcomingEvents } from "@/app/v2/(version-2)/(home)/calender/_lib/use-upcoming-events"
import { useCalendarContext } from "@/app/v2/(version-2)/(home)/calender/_components/event-calendar/calendar-context"
import { RiTimeLine, RiVideoOnLine } from "@remixicon/react"
import { findMeetingLink } from "@/lib/calendar/meeting-link"

const timeFmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

/** "Now", "in 25 min", "Today", "Tomorrow", or "Wed, Nov 18" */
function whenLabel(start: Date, end: Date, now: Date): string {
  if (start <= now && end >= now) return "Now"
  const mins = Math.round((start.getTime() - now.getTime()) / 60000)
  if (mins > 0 && mins < 60) return `in ${mins} min`
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const diffDays = Math.round((startDay - today) / 86_400_000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  return start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
}

/**
 * Next 3 meetings in the mailbox sidebar. Data comes from the CalDev store, which the
 * app layout keeps live (SSE) — this component makes no requests of its own.
 */
const ShowMeetings = () => {
  const calendars = useCalDevStore((s) => s.calendars)
  const { setCurrentDate } = useCalendarContext()
  const upcoming = useUpcomingEvents({ limit: 3 })

  if (upcoming.length === 0) return null

  const now = new Date()

  return (
    <Accordion type="single" collapsible defaultValue="meetings" className="w-full">
      <AccordionItem value="meetings" className="border-none">
        <AccordionTrigger className="hover:no-underline w-full py-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium">Upcoming meetings</h3>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-0.5">
            {upcoming.map((ev, idx) => {
              const cal = calendars.find((c) => c.id === ev.calendarId)
              const when = whenLabel(ev.start, ev.end, now)
              const isNow = when === "Now"
              const meeting = findMeetingLink(ev.location, ev.description)

              // Gap to the next meeting
              const next = upcoming[idx + 1]
              let gapLabel: string | null = null
              if (next) {
                const gapMin = Math.round((next.start.getTime() - ev.end.getTime()) / 60000)
                if (gapMin > 0) {
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
                  <div className="flex items-center gap-1">
                  <Link
                    href="/v2/calender"
                    onClick={() => setCurrentDate(ev.start)}
                    className="flex min-w-0 flex-1 items-start gap-2 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: cal?.color || "#6366F1" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {ev.title || "Untitled event"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <RiTimeLine size={11} className="shrink-0 text-muted-foreground/60" />
                        <span className="text-[11px] text-muted-foreground">
                          <span className={isNow ? "font-medium text-emerald-500" : undefined}>{when}</span>
                          {" · "}
                          {timeFmt(ev.start)} – {timeFmt(ev.end)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {meeting && (
                    <a
                      href={meeting.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Join ${meeting.label}`}
                      aria-label={`Join ${meeting.label}`}
                      className={
                        "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors " +
                        (isNow
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground")
                      }
                    >
                      <RiVideoOnLine size={15} />
                    </a>
                  )}
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
