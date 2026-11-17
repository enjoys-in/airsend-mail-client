"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  CalendarCheck,
  CalendarPlus,
  CalendarX,
  Check,
  Clock3,
  Download,
  Loader2,
  MapPin,
  MoreVertical,
  Repeat,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { getMid } from "@/lib/api/auth-state";
import { joinLocation } from "@/lib/calendar/meeting-link";
import { parseInvite, type InviteAttendee, type PartStat } from "@/lib/calendar/ics-invite";
import { errorText, personLabel, placeText, sameEmail, whenText } from "@/lib/calendar/invite-format";
import { sendIncomingScheduling, sendRSVP } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-api";
import { useCalDevStore } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-store";
import type { RsvpReply } from "@/components/common/rsvp-buttons";

type Reply = RsvpReply;

const STATUS_TEXT: Record<string, string> = {
  ACCEPTED: "Going",
  TENTATIVE: "Maybe",
  DECLINED: "Not going",
  "NEEDS-ACTION": "Awaiting reply",
};

/** Filled status badge on a guest chip: ✓ going, ? maybe, ✕ not going, clock awaiting. */
const STATUS_BADGE: Record<string, { bg: string; icon: React.ReactNode }> = {
  ACCEPTED: { bg: "bg-emerald-500", icon: <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> },
  TENTATIVE: { bg: "bg-amber-500", icon: <span className="text-[10px] font-bold leading-none">?</span> },
  DECLINED: { bg: "bg-red-500", icon: <X className="h-2.5 w-2.5" strokeWidth={3.5} /> },
  "NEEDS-ACTION": { bg: "bg-muted-foreground/40", icon: <Clock3 className="h-2.5 w-2.5" strokeWidth={3} /> },
};

const REPLIES: { value: Reply; label: string; active: string }[] = [
  { value: "ACCEPTED", label: "Yes", active: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600" },
  { value: "TENTATIVE", label: "Maybe", active: "border-amber-500 bg-amber-500 text-white hover:bg-amber-500" },
  { value: "DECLINED", label: "No", active: "border-red-600 bg-red-600 text-white hover:bg-red-600" },
];

const GUESTS_SHOWN = 6;

const DAY_NAMES: Record<string, string> = { MO: "Mon", TU: "Tue", WE: "Wed", TH: "Thu", FR: "Fri", SA: "Sat", SU: "Sun" };

/** RRULE → "Weekly on weekdays", "Every 2 weeks on Mon, Wed", "Monthly, 10 times", … */
function repeatText(rrule: string, start: Date): string {
  const parts = Object.fromEntries(
    rrule.split(";").map((p) => {
      const [k, v = ""] = p.split("=");
      return [k.toUpperCase(), v.toUpperCase()];
    }),
  );
  const n = Math.max(1, Number(parts.INTERVAL) || 1);
  const days = (parts.BYDAY || "")
    .split(",")
    .map((d) => d.replace(/^[+-]?\d+/, ""))
    .filter((d) => DAY_NAMES[d]);

  let text: string;
  switch (parts.FREQ) {
    case "DAILY":
      text = n > 1 ? `Every ${n} days` : "Daily";
      break;
    case "WEEKLY": {
      const on =
        days.length === 5 && ["MO", "TU", "WE", "TH", "FR"].every((d) => days.includes(d))
          ? "weekdays"
          : days.length
            ? days.map((d) => DAY_NAMES[d]).join(", ")
            : format(start, "EEEE");
      text = `${n > 1 ? `Every ${n} weeks` : "Weekly"} on ${on}`;
      break;
    }
    case "MONTHLY":
      text = n > 1 ? `Every ${n} months` : "Monthly";
      break;
    case "YEARLY":
      text = n > 1 ? `Every ${n} years` : "Annually";
      break;
    default:
      return "Repeating event";
  }
  if (parts.COUNT) text += `, ${parts.COUNT} times`;
  else if (/^\d{8}/.test(parts.UNTIL || "")) {
    const u = parts.UNTIL;
    text += `, until ${format(new Date(+u.slice(0, 4), +u.slice(4, 6) - 1, +u.slice(6, 8)), "MMM d, yyyy")}`;
  }
  return text;
}

function GuestChip({ guest, isMe }: { guest: InviteAttendee; isMe: boolean }) {
  const badge = STATUS_BADGE[guest.partstat] ?? STATUS_BADGE["NEEDS-ACTION"];
  return (
    <li
      title={`${guest.email} · ${STATUS_TEXT[guest.partstat] ?? guest.partstat}`}
      className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full bg-muted py-1 pl-1.5 pr-3 text-sm"
    >
      <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white", badge.bg)}>
        {badge.icon}
      </span>
      <span className="truncate">{isMe ? "You" : personLabel(guest)}</span>
    </li>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

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
  const autoApplied = useRef(false);

  // A guest answered from their own mail app (e.g. Gmail's Yes / Maybe / No), which mails a
  // METHOD:REPLY to the organizer. Apply it as soon as the organizer opens that mail, but only
  // while the calendar still shows the guest as awaiting, so an older reply opened later never
  // overwrites a newer answer. "Update in calendar" stays available for that case.
  useEffect(() => {
    if (autoApplied.current || !canAccessCalendar || !invite?.uid || invite.method !== "REPLY") return;
    if (!sameEmail(invite.organizer?.email, myEmail)) return;
    const replier = invite.attendees[0];
    if (!replier || !["ACCEPTED", "TENTATIVE", "DECLINED"].includes(replier.partstat)) return;
    const live = rawEvents.find((e) => e.uid === invite.uid);
    const guest = live?.attendees?.find((a) => sameEmail(a.email, replier.email));
    if (!guest || (guest.status && guest.status.toUpperCase() !== "NEEDS-ACTION")) return;

    autoApplied.current = true;
    sendIncomingScheduling({ tenant_id: getMid() || "", ics, sender_email: replier.email })
      .then(() => {
        setDone("updated");
        Promise.resolve(useCalDevStore.getState().syncEventChanges()).catch(() => {});
      })
      .catch(() => {}); // the manual "Update in calendar" button remains
  }, [invite, ics, myEmail, canAccessCalendar, rawEvents]);

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
  const visibleGuests = showGuests ? guests : guests.slice(0, GUESTS_SHOWN);

  const place = placeText(invite.location, invite.meetingLink?.url);
  const placeIsUrl = /^https?:\/\//i.test(place);
  const meetingText = !invite.meetingLink
    ? ""
    : invite.meetingLink.provider === "other"
      ? "Join meeting"
      : invite.meetingLink.provider === "zoom" || invite.meetingLink.provider === "teams"
        ? `Join ${invite.meetingLink.provider === "zoom" ? "Zoom" : "Teams"} Meeting`
        : `Join ${invite.meetingLink.label}`;

  const added = inCalendar || done === "added" || done === "replied";
  const showAddInMenu = canAct && !cancelled && !isReply && !iAmOrganizer && (invite.method !== "REQUEST" || me) && !added;
  const canRsvp = canAct && invite.method === "REQUEST" && !cancelled && !iAmOrganizer && !!me;
  const replyPending = busy === "ACCEPTED" || busy === "TENTATIVE" || busy === "DECLINED";

  /** Bottom line: the question and its answer buttons, or the one action that fits this mail. */
  let footer: React.ReactNode = null;
  if (canRsvp) {
    footer = (
      <>
        <p className="min-w-0 truncate text-sm">
          Are you attending? <span className="text-muted-foreground">({myEmail})</span>
        </p>
        <div className="flex shrink-0 items-center gap-2" role="group" aria-label="Your reply">
          {REPLIES.map((r) => (
            <Button
              key={r.value}
              type="button"
              variant="outline"
              disabled={replyPending}
              aria-pressed={currentStatus === r.value}
              onClick={() => reply(r.value)}
              className={cn(
                "h-9 min-w-[76px] rounded-full px-4 text-sm font-medium",
                currentStatus === r.value && r.active,
              )}
            >
              {busy === r.value ? <Loader2 className="h-4 w-4 animate-spin" /> : r.label}
            </Button>
          ))}
        </div>
      </>
    );
  } else if (canAct && cancelled && !iAmOrganizer) {
    footer = (
      <>
        <p className="text-sm text-red-600 dark:text-red-400">This event was cancelled</p>
        {done === "removed" ? (
          <span className="text-sm text-muted-foreground">Removed from your calendar</span>
        ) : (
          <Button type="button" variant="outline" disabled={!!busy} onClick={applyCancel} className="h-9 gap-1.5 rounded-full px-4">
            {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarX className="h-4 w-4" />}
            Remove from calendar
          </Button>
        )}
      </>
    );
  } else if (canAct && isReply && replier) {
    const badge = STATUS_BADGE[replier.partstat] ?? STATUS_BADGE["NEEDS-ACTION"];
    footer = (
      <>
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white", badge.bg)}>
            {badge.icon}
          </span>
          <span className="truncate">
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
        </p>
        {done === "updated" ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CalendarCheck className="h-4 w-4" /> Updated in calendar
          </span>
        ) : (
          <Button type="button" variant="outline" disabled={!!busy} onClick={applyReply} className="h-9 gap-1.5 rounded-full px-4">
            {busy === "reply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
            Update in calendar
          </Button>
        )}
      </>
    );
  } else if (canAct && !cancelled && !isReply && !iAmOrganizer && invite.method !== "REQUEST") {
    footer = (
      <>
        <p className="text-sm text-muted-foreground">Add this event to your calendar?</p>
        {added ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CalendarCheck className="h-4 w-4" /> In your calendar
          </span>
        ) : (
          <Button type="button" disabled={!!busy} onClick={addToCalendar} className="h-9 gap-1.5 rounded-full px-4">
            {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            Add to calendar
          </Button>
        )}
      </>
    );
  } else if (invite.method === "REQUEST" && !me && !iAmOrganizer) {
    footer = <p className="text-sm text-muted-foreground">You aren&apos;t on the guest list</p>;
  }

  return (
    <div className="mx-3 my-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:mx-4">
      {/* Header: title, when, menu */}
      <div className="flex items-start gap-3 px-5 pb-4 pt-4">
        <div className="min-w-0 flex-1">
          <h3 className={cn("text-base font-semibold leading-snug", cancelled && "line-through opacity-70")}>
            {invite.title || "(no title)"}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{whenText(invite.start, invite.end, invite.allDay)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="-mr-2 h-8 w-8 shrink-0 rounded-full" aria-label="More">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showAddInMenu && (
              <DropdownMenuItem disabled={!!busy} onSelect={() => addToCalendar()}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Add to calendar
              </DropdownMenuItem>
            )}
            {canAct && added && !cancelled && !isReply && (
              <DropdownMenuItem disabled>
                <CalendarCheck className="mr-2 h-4 w-4" /> In your calendar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={downloadIcs}>
              <Download className="mr-2 h-4 w-4" /> Download .ics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Details */}
      <div className="space-y-3 border-t border-border px-5 py-4">
        {invite.rrule && <Row icon={<Repeat className="h-4 w-4" />}>{repeatText(invite.rrule, invite.start)}</Row>}

        {place && (
          <Row icon={<MapPin className="h-4 w-4" />}>
            {placeIsUrl ? (
              <a href={place} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                {place}
              </a>
            ) : (
              <span className="break-words">
                {place}
                {" — "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Map
                </a>
              </span>
            )}
          </Row>
        )}

        {invite.meetingLink && !cancelled && (
          <Row icon={<Video className="h-4 w-4" />}>
            <a
              href={invite.meetingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              title={invite.meetingLink.url}
              className="text-primary hover:underline"
            >
              {meetingText}
            </a>
          </Row>
        )}

        {invite.organizer && (
          <Row icon={<UserRound className="h-4 w-4" />}>
            <span className="text-muted-foreground">Organizer: </span>
            {iAmOrganizer ? "You" : personLabel(invite.organizer)}
          </Row>
        )}

        {guests.length > 0 && !isReply && (
          <Row icon={<Users className="h-4 w-4" />}>
            <ul className="-mt-1 flex flex-wrap gap-1.5">
              {visibleGuests.map((g) => (
                <GuestChip key={g.email} guest={g} isMe={sameEmail(g.email, myEmail)} />
              ))}
              {guests.length > GUESTS_SHOWN && (
                <li>
                  <button
                    type="button"
                    onClick={() => setShowGuests((v) => !v)}
                    className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showGuests ? "Show less" : `+${guests.length - GUESTS_SHOWN} more`}
                  </button>
                </li>
              )}
            </ul>
          </Row>
        )}
      </div>

      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4">{footer}</div>
      )}
    </div>
  );
}

export default InviteCard;
