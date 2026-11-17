"use client";

import { useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import {
  RiAlignLeft,
  RiCalendarEventLine,
  RiExternalLinkLine,
  RiMapPinLine,
  RiRepeatLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { JoinMeetingButton } from "@/components/common/join-meeting-button";
import { RsvpButtons, type RsvpReply } from "@/components/common/rsvp-buttons";
import { RSVP_DOT, RSVP_LABEL, RsvpSummary, normalizeRsvp } from "@/components/common/rsvp-summary";
import { findMeetingLink, splitLocation } from "@/lib/calendar/meeting-link";
import { useAppSelector } from "@/store/hooks";
import { useCalDevStore } from "../_lib/caldev-store";
import { sendRSVP } from "../_lib/caldev-api";
import { useCalendarContext } from "./event-calendar/calendar-context";
import type { CalendarEvent } from "./event-calendar";

const sameEmail = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** "Wed, Nov 18 · 12:15 AM – 12:30 AM" (adds the end date when the event spans days) */
function formatWhen(ev: CalendarEvent): string {
  if (ev.allDay) {
    return isSameDay(ev.start, ev.end)
      ? `${format(ev.start, "EEE, MMM d")} · All day`
      : `${format(ev.start, "EEE, MMM d")} – ${format(ev.end, "EEE, MMM d")}`;
  }
  return isSameDay(ev.start, ev.end)
    ? `${format(ev.start, "EEE, MMM d")} · ${format(ev.start, "h:mm a")} – ${format(ev.end, "h:mm a")}`
    : `${format(ev.start, "EEE, MMM d, h:mm a")} – ${format(ev.end, "EEE, MMM d, h:mm a")}`;
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Read-only details of one meeting (opened from the "Upcoming meetings" sidebar):
 * when, where, a Join button for the meeting link, guests with their replies, and
 * a way to jump to the event in the calendar.
 */
export function MeetingDetailDialog({
  event,
  onClose,
  hideOpenInCalendar = false,
}: {
  event: CalendarEvent | null;
  onClose: () => void;
  /** already on the calendar page: no need for the "Open in calendar" link */
  hideOpenInCalendar?: boolean;
}) {
  const { setCurrentDate } = useCalendarContext();
  const calendars = useCalDevStore((s) => s.calendars);
  const rawEvents = useCalDevStore((s) => s.rawEvents);
  const myEmail = useAppSelector((s) => s.accounts.currAccount?.email);
  const [rsvpPending, setRsvpPending] = useState<RsvpReply | null>(null);

  if (!event) return null;

  const rawId = event.seriesId || event.id;
  const raw = rawEvents.find((e) => e.id === rawId);
  const cal = calendars.find((c) => c.id === event.calendarId);
  const color = cal?.color || "#6366F1";

  const meeting = findMeetingLink(event.location, event.description);
  const place = splitLocation(event.location).place;
  const guests = raw?.attendees ?? event.attendees ?? [];
  const organizer = (raw?.organizer || "").replace(/^mailto:/i, "");
  const eventUid = raw?.uid || "";

  const myGuest = guests.find((g) => sameEmail(g.email, myEmail));
  const isGuest = !!organizer && !sameEmail(organizer, myEmail) && !!myGuest;

  const now = new Date();
  const isNow = event.start <= now && event.end >= now;

  const handleRsvp = async (reply: RsvpReply) => {
    if (!eventUid || rsvpPending) return;
    setRsvpPending(reply);
    try {
      await sendRSVP({ event_uid: eventUid, response: reply });
      toast.success(reply === "DECLINED" ? "Declined. The organizer has been told" : "Reply sent to the organizer");
      Promise.resolve(useCalDevStore.getState().syncEventChanges()).catch(() => {});
    } catch (e) {
      const data = (e as { response?: { data?: { message?: string; error?: { details?: string } } } })?.response?.data;
      toast.error(data?.error?.details || data?.message || "Could not send your reply");
    } finally {
      setRsvpPending(null);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[88vh] w-[calc(100vw-1.5rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b border-border/60 px-5 py-4 pr-12 text-left">
          <div className="flex items-start gap-2.5">
            <span className="mt-2 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <div className="min-w-0 flex-1">
              <DialogTitle className="break-words text-base font-semibold leading-snug">
                {event.title || "Untitled event"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                {isNow && <span className="mr-1.5 font-medium text-emerald-500">Happening now ·</span>}
                {cal?.name ?? "Calendar"}
                {event.status === "TENTATIVE" && " · Tentative"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {meeting && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{meeting.label}</p>
                <p className="truncate text-xs text-muted-foreground">{meeting.url}</p>
              </div>
              <JoinMeetingButton link={meeting} />
            </div>
          )}

          <Row icon={<RiTimeLine size={16} />}>
            <p>{formatWhen(event)}</p>
            {(event.recurrenceRule || raw?.recurrence_rule) && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <RiRepeatLine size={12} /> Repeats
              </p>
            )}
          </Row>

          {place && (
            <Row icon={<RiMapPinLine size={16} />}>
              <p className="break-words">{place}</p>
            </Row>
          )}

          {event.description?.trim() && (
            <Row icon={<RiAlignLeft size={16} />}>
              <p className="whitespace-pre-wrap break-words text-muted-foreground">{event.description.trim()}</p>
            </Row>
          )}

          {(organizer || guests.length > 0) && (
            <Row icon={<RiUserLine size={16} />}>
              {organizer && (
                <p className="truncate text-muted-foreground">
                  Organizer: <span className="text-foreground">{sameEmail(organizer, myEmail) ? "You" : organizer}</span>
                </p>
              )}
              {guests.length > 0 && (
                <div className="mt-2 space-y-2">
                  <RsvpSummary people={guests} />
                  <ul className="space-y-1">
                    {guests.map((g) => {
                      const st = normalizeRsvp(g.status);
                      return (
                        <li key={g.email} className="flex items-center gap-2 text-xs">
                          <span className={`size-2 shrink-0 rounded-full ${RSVP_DOT[st]}`} />
                          <span className="min-w-0 flex-1 truncate">
                            {g.display_name && g.display_name !== g.email ? `${g.display_name} · ` : ""}
                            <span className="text-muted-foreground">{g.email}</span>
                          </span>
                          <span className="shrink-0 text-muted-foreground">{RSVP_LABEL[st]}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Row>
          )}

          {isGuest && eventUid && (
            <RsvpButtons value={myGuest?.status} pending={rsvpPending} onReply={handleRsvp} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-5 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {!hideOpenInCalendar && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link
                href="/v2/calender"
                onClick={() => {
                  setCurrentDate(event.start);
                  onClose();
                }}
              >
                <RiCalendarEventLine size={14} />
                Open in calendar
                <RiExternalLinkLine size={12} className="text-muted-foreground" />
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
