"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import {
  CalendarCheck,
  CalendarPlus,
  CalendarX,
  Download,
  Loader2,
  MapPin,
  Repeat,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { getMid } from "@/lib/api/auth-state";
import { JoinMeetingButton } from "@/components/common/join-meeting-button";
import { joinLocation } from "@/lib/calendar/meeting-link";
import { parseInvite, type InviteAttendee, type PartStat } from "@/lib/calendar/ics-invite";
import { sendIncomingScheduling, sendRSVP } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-api";
import { useCalDevStore } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-store";
import { RsvpButtons, type RsvpReply } from "@/components/common/rsvp-buttons";
import { RsvpSummary } from "@/components/common/rsvp-summary";

type Reply = RsvpReply;

const STATUS_TEXT: Record<string, string> = {
  ACCEPTED: "Going",
  TENTATIVE: "Maybe",
  DECLINED: "Not going",
  "NEEDS-ACTION": "Awaiting reply",
};

const STATUS_DOT: Record<string, string> = {
  ACCEPTED: "bg-emerald-500",
  TENTATIVE: "bg-amber-500",
  DECLINED: "bg-red-500",
  "NEEDS-ACTION": "bg-muted-foreground/40",
};

const sameEmail = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Readable error from a CalDev REST failure */
function errorText(e: unknown, fallback: string): string {
  const data = (e as { response?: { data?: { message?: string; error?: { details?: string } } } })?.response?.data;
  return data?.error?.details || data?.message || (e instanceof Error ? e.message : "") || fallback;
}

function whenText(start: Date, end: Date, allDay: boolean): string {
  if (allDay) {
    // all-day end is exclusive
    const last = new Date(end.getTime() - 1);
    return isSameDay(start, last)
      ? `${format(start, "EEE, d MMM yyyy")} · All day`
      : `${format(start, "EEE, d MMM")} – ${format(last, "EEE, d MMM yyyy")} · All day`;
  }
  const zone = format(start, "O");
  return isSameDay(start, end)
    ? `${format(start, "EEE, d MMM yyyy")} · ${format(start, "h:mm a")} – ${format(end, "h:mm a")} (${zone})`
    : `${format(start, "EEE, d MMM, h:mm a")} – ${format(end, "EEE, d MMM yyyy, h:mm a")} (${zone})`;
}

const personLabel = (p: { name: string; email: string }) => p.name || p.email;

/**
 * Calendar invitation shown above a mail body. Lets the user reply Yes / Maybe /
 * No (the reply goes to the organizer through CalDev), add the event to their
 * calendar, apply a cancellation, or record a guest's reply to their own event.
 */
export function InviteCard({ ics }: { ics: string }) {
  const invite = useMemo(() => parseInvite(ics), [ics]);
  const myEmail = useAppSelector((s) => s.accounts.currAccount?.email);
  const { canAccessCalendar } = useFeatureAccess();
  const rawEvents = useCalDevStore((s) => s.rawEvents);

  const me = invite?.attendees.find((a) => sameEmail(a.email, myEmail));
  const [myStatus, setMyStatus] = useState<PartStat | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [showGuests, setShowGuests] = useState(false);

  if (!invite) return null;

  const inCalendar = !!invite.uid && rawEvents.some((e) => e.uid === invite.uid && e.status !== "CANCELLED");
  const iAmOrganizer = sameEmail(invite.organizer?.email, myEmail);
  const currentStatus = myStatus ?? me?.partstat ?? null;
  const cancelled = invite.method === "CANCEL" || invite.status === "CANCELLED";
  const isReply = invite.method === "REPLY";
  const replier: InviteAttendee | undefined = isReply ? invite.attendees[0] : undefined;

  const refreshCalendar = () => {
    Promise.resolve(useCalDevStore.getState().syncEventChanges()).catch(() => {});
  };

  /** Hand the invitation to CalDev (adds / updates / cancels the user's copy). */
  const importIcs = () =>
    sendIncomingScheduling({
      tenant_id: getMid() || "",
      ics,
      sender_email: invite.organizer?.email || "",
    });

  const run = async (key: string, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const reply = (value: Reply) =>
    run(value, async () => {
      try {
        // An outside organizer's event must exist in this user's calendar before RSVP
        if (!inCalendar) await importIcs();
        await sendRSVP({ event_uid: invite.uid, response: value });
        setMyStatus(value);
        setDone("replied");
        refreshCalendar();
        toast.success(
          value === "DECLINED" ? "Declined — the organizer has been told" : "Reply sent to the organizer",
        );
      } catch (e) {
        toast.error(errorText(e, "Could not send your reply"));
      }
    });

  const addToCalendar = () =>
    run("add", async () => {
      try {
        if (invite.method === "REQUEST") {
          await importIcs();
        } else {
          // Plain .ics (PUBLISH): create a copy in the user's default calendar
          const store = useCalDevStore.getState();
          await store.bootstrap();
          const cals = useCalDevStore.getState().calendars;
          const cal = cals.find((c) => c.is_default && !c.is_readonly) ?? cals.find((c) => !c.is_readonly);
          if (!cal) throw new Error("No calendar to add the event to");
          const linkInLocation = invite.meetingLink && invite.location.includes(invite.meetingLink.url);
          const created = await useCalDevStore.getState().addEvent(
            {
              id: "",
              title: invite.title || "(no title)",
              description: invite.description,
              start: invite.start,
              end: invite.allDay ? new Date(invite.end.getTime() - 1) : invite.end,
              allDay: invite.allDay,
              location:
                invite.meetingLink && !linkInLocation
                  ? joinLocation(invite.location, invite.meetingLink.url)
                  : invite.location,
              recurrenceRule: invite.rrule || undefined,
            },
            cal.id,
          );
          if (!created) throw new Error("Could not add the event");
        }
        setDone("added");
        refreshCalendar();
        toast.success("Added to your calendar");
      } catch (e) {
        toast.error(errorText(e, "Could not add to calendar"));
      }
    });

  const applyCancel = () =>
    run("cancel", async () => {
      try {
        await importIcs();
        setDone("removed");
        refreshCalendar();
        toast.success("Removed from your calendar");
      } catch (e) {
        toast.error(errorText(e, "Could not remove the event"));
      }
    });

  const applyReply = () =>
    run("reply", async () => {
      try {
        await importIcs();
        setDone("updated");
        refreshCalendar();
        toast.success("Guest status updated");
      } catch (e) {
        toast.error(errorText(e, "Could not update the guest status"));
      }
    });

  const downloadIcs = () => {
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(invite.title || "invite").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 60)}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const canAct = canAccessCalendar && !!invite.uid;
  // Answers change after the mail was sent: prefer the calendar's live copy when it has guests
  const live = invite.uid ? rawEvents.find((e) => e.uid === invite.uid) : undefined;
  const guests: InviteAttendee[] =
    live && live.attendees?.length
      ? live.attendees.map((a) => ({ email: a.email, name: a.display_name, partstat: a.status, role: a.role }))
      : invite.attendees;
  const visibleGuests = showGuests ? guests : guests.slice(0, 4);

  return (
    <div className="mx-3 my-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:mx-4">
      {cancelled && (
        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400">
          <CalendarX className="h-4 w-4" />
          This event was cancelled
        </div>
      )}
      {isReply && replier && (
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 text-sm">
          <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[replier.partstat] ?? STATUS_DOT["NEEDS-ACTION"])} />
          <span>
            <b>{personLabel(replier)}</b>{" "}
            {replier.partstat === "ACCEPTED"
              ? "accepted"
              : replier.partstat === "DECLINED"
                ? "declined"
                : replier.partstat === "TENTATIVE"
                  ? "replied maybe to"
                  : "replied to"}{" "}
            your invitation
          </span>
        </div>
      )}

      <div className="flex gap-4 p-4">
        {/* Date tile */}
        <div
          className={cn(
            "flex h-16 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-border text-center",
            cancelled && "opacity-60",
          )}
        >
          <span className="w-full bg-red-500 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {format(invite.start, "MMM")}
          </span>
          <span className="flex-1 pt-1 text-xl font-semibold leading-none tabular-nums">{format(invite.start, "d")}</span>
          <span className="pb-1 text-[10px] text-muted-foreground">{format(invite.start, "EEE")}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className={cn("text-base font-semibold leading-snug", cancelled && "line-through opacity-70")}>
              {invite.title || "(no title)"}
            </h3>
            {currentStatus && STATUS_TEXT[currentStatus] && !iAmOrganizer && !isReply && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[currentStatus])} />
                {STATUS_TEXT[currentStatus]}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{whenText(invite.start, invite.end, invite.allDay)}</p>

          {invite.rrule && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Repeat className="h-3.5 w-3.5" /> Repeating event
            </p>
          )}

          {invite.location && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="break-words">{invite.location}</span>
            </p>
          )}

          {invite.organizer && (
            <p className="text-xs text-muted-foreground">
              Organizer: <span className="text-foreground">{iAmOrganizer ? "You" : personLabel(invite.organizer)}</span>
            </p>
          )}

          {guests.length > 0 && !isReply && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowGuests((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Users className="h-3.5 w-3.5" />
                {guests.length} guest{guests.length > 1 ? "s" : ""}
                {guests.length > 4 && <span className="underline">{showGuests ? "show less" : "show all"}</span>}
              </button>
              <RsvpSummary
                people={guests.map((g) => ({ status: g.partstat }))}
                className="mt-1.5 max-w-sm"
              />
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {visibleGuests.map((g) => (
                  <li
                    key={g.email}
                    title={`${g.email} · ${STATUS_TEXT[g.partstat] ?? g.partstat}`}
                    className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-border bg-muted/40 py-0.5 pl-0.5 pr-2 text-xs"
                  >
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase">
                      {personLabel(g).charAt(0)}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-card",
                          STATUS_DOT[g.partstat] ?? STATUS_DOT["NEEDS-ACTION"],
                        )}
                      />
                    </span>
                    <span className="truncate">{sameEmail(g.email, myEmail) ? "You" : personLabel(g)}</span>
                  </li>
                ))}
                {!showGuests && guests.length > 4 && (
                  <li className="px-1 text-xs text-muted-foreground">+{guests.length - 4}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
        {invite.meetingLink && !cancelled && <JoinMeetingButton link={invite.meetingLink} size="sm" />}

        {canAct && invite.method === "REQUEST" && !cancelled && !iAmOrganizer && me && (
          <RsvpButtons
            value={currentStatus}
            pending={busy === "ACCEPTED" || busy === "TENTATIVE" || busy === "DECLINED" ? busy : null}
            onReply={reply}
          />
        )}

        {canAct && !cancelled && !isReply && !iAmOrganizer && (invite.method !== "REQUEST" || me) && (
          inCalendar || done === "added" || done === "replied" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" /> In your calendar
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={addToCalendar}
              className="h-7 gap-1.5 rounded-lg px-2.5 text-xs"
            >
              {busy === "add" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarPlus className="h-3.5 w-3.5" />}
              Add to calendar
            </Button>
          )
        )}

        {canAct && cancelled && !iAmOrganizer && (
          done === "removed" ? (
            <span className="text-xs text-muted-foreground">Removed from your calendar</span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={applyCancel}
              className="h-7 gap-1.5 rounded-lg px-2.5 text-xs"
            >
              {busy === "cancel" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarX className="h-3.5 w-3.5" />}
              Remove from calendar
            </Button>
          )
        )}

        {canAct && isReply && replier && (
          done === "updated" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" /> Guest status updated
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={applyReply}
              className="h-7 gap-1.5 rounded-lg px-2.5 text-xs"
            >
              {busy === "reply" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarCheck className="h-3.5 w-3.5" />}
              Update in calendar
            </Button>
          )
        )}

        {invite.method === "REQUEST" && !me && !iAmOrganizer && (
          <span className="text-xs text-muted-foreground">You aren&apos;t on the guest list</span>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={downloadIcs}
          className="ml-auto h-7 gap-1.5 rounded-lg px-2 text-xs text-muted-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          .ics
        </Button>
      </div>
    </div>
  );
}

export default InviteCard;
