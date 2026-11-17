"use client"

import React from "react"
import Link from "next/link"
import PostalMime from "postal-mime"
import { toast } from "sonner"
import { ChevronDown, Clock, Loader2, MapPin, UserRound } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { getMid } from "@/lib/api/auth-state"
import { loadRawMail } from "@/lib/mail/load-raw-mail"
import { findCalendarPart, parseInvite, type ParsedInvite, type PartStat } from "@/lib/calendar/ics-invite"
import { errorText, placeText, sameEmail, whenText } from "@/lib/calendar/invite-format"
import { sendIncomingScheduling, sendRSVP } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-api"
import { useCalDevStore } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-store"
import type { RsvpReply } from "@/components/common/rsvp-buttons"

type AttachmentMeta = { contentType?: string; mimeType?: string; filename?: string | null }

/** True when the list metadata shows a calendar part (text/calendar or a .ics file). */
export function hasCalendarAttachment(attachments: AttachmentMeta[]): boolean {
    return attachments.some(
        (a) => /text\/calendar|application\/ics/i.test(a.contentType || a.mimeType || "") || /\.ics$/i.test(a.filename || ""),
    )
}

const REPLY_LABEL: Record<RsvpReply, string> = { ACCEPTED: "Yes", TENTATIVE: "Maybe", DECLINED: "No" }

// Parsed invites per mail, so reopening the popover is instant
const inviteCache = new Map<string, { invite: ParsedInvite; ics: string } | null>()

/** Events inside the popover must not reach the mail row (it opens the mail on click). */
const stop = (e: React.SyntheticEvent) => e.stopPropagation()

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">{icon}</span>
            <div className="min-w-0 flex-1 break-words">{children}</div>
        </div>
    )
}

function InviteDetails({ messageId, onLoaded }: { messageId: string; onLoaded: (invite: ParsedInvite | null) => void }) {
    const [state, setState] = React.useState<{ invite: ParsedInvite; ics: string } | null | undefined>(
        inviteCache.get(messageId),
    )
    const [failed, setFailed] = React.useState(false)
    const [busy, setBusy] = React.useState<RsvpReply | null>(null)
    const [myStatus, setMyStatus] = React.useState<PartStat | null>(null)
    const myEmail = useAppSelector((s) => s.accounts.currAccount?.email)
    const { canAccessCalendar } = useFeatureAccess()
    const rawEvents = useCalDevStore((s) => s.rawEvents)

    React.useEffect(() => {
        if (inviteCache.has(messageId)) return
        let alive = true
        loadRawMail(messageId)
            .then((raw) => PostalMime.parse(raw))
            .then((email) => {
                const ics = findCalendarPart(email.attachments)
                const invite = ics ? parseInvite(ics) : null
                const value = invite && ics ? { invite, ics } : null
                inviteCache.set(messageId, value)
                if (alive) {
                    setState(value)
                    onLoaded(invite)
                }
            })
            .catch(() => alive && setFailed(true))
        return () => {
            alive = false
        }
    }, [messageId, onLoaded])

    if (failed) return <p className="text-sm text-muted-foreground">Could not load this invitation.</p>

    if (state === undefined) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        )
    }

    if (!state) return <p className="text-sm text-muted-foreground">This calendar file has no event in it.</p>

    const { invite, ics } = state
    const live = invite.uid ? rawEvents.find((e) => e.uid === invite.uid) : undefined
    const inCalendar = !!live && live.status !== "CANCELLED"
    const guests =
        live && live.attendees?.length
            ? live.attendees.map((a) => ({ email: a.email, partstat: a.status?.toUpperCase() }))
            : invite.attendees.map((a) => ({ email: a.email, partstat: a.partstat }))
    const me = invite.attendees.find((a) => sameEmail(a.email, myEmail))
    const iAmOrganizer = sameEmail(invite.organizer?.email, myEmail)
    const cancelled = invite.method === "CANCEL" || invite.status === "CANCELLED"
    const current = (myStatus ?? me?.partstat ?? null) as PartStat | null
    // My own answer, counted even before the calendar copy catches up
    const going = guests.filter((g) =>
        (sameEmail(g.email, myEmail) && myStatus) ? myStatus === "ACCEPTED" : g.partstat === "ACCEPTED",
    ).length
    const canRsvp = canAccessCalendar && !!invite.uid && invite.method === "REQUEST" && !cancelled && !iAmOrganizer && !!me

    const place = placeText(invite.location, invite.meetingLink?.url)
    const meetingUrl = invite.meetingLink?.url

    const reply = async (value: RsvpReply) => {
        if (busy) return
        setBusy(value)
        try {
            // An outside organizer's event must exist in this user's calendar before RSVP
            if (!inCalendar) {
                await sendIncomingScheduling({ tenant_id: getMid() || "", ics, sender_email: invite.organizer?.email || "" })
            }
            await sendRSVP({ event_uid: invite.uid, response: value })
            setMyStatus(value)
            Promise.resolve(useCalDevStore.getState().syncEventChanges()).catch(() => {})
            toast.success(value === "DECLINED" ? "Declined — the organizer has been told" : "Reply sent to the organizer")
        } catch (e) {
            toast.error(errorText(e, "Could not send your reply"))
        } finally {
            setBusy(null)
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <h4 className={cn("text-base font-medium leading-snug", cancelled && "line-through opacity-70")}>
                    {invite.title || "(no title)"}
                </h4>
                {inCalendar && (
                    <Link href="/v2/calender" className="text-sm text-primary hover:underline">
                        View in Calendar
                    </Link>
                )}
                {cancelled && <p className="text-sm text-red-600 dark:text-red-400">This event was cancelled</p>}
            </div>

            <Row icon={<Clock className="h-3.5 w-3.5" />}>{whenText(invite.start, invite.end, invite.allDay)}</Row>

            {(place || meetingUrl) && (
                <Row icon={<MapPin className="h-3.5 w-3.5" />}>
                    {place}
                    {place && meetingUrl && " · "}
                    {meetingUrl && (
                        <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                            {meetingUrl}
                        </a>
                    )}
                </Row>
            )}

            {invite.method !== "REPLY" && guests.length > 0 && (
                <Row icon={<UserRound className="h-3.5 w-3.5" />}>
                    {going > 0 ? `${going} going` : `${guests.length} invited`}
                </Row>
            )}

            {canRsvp ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            disabled={!!busy}
                            className="mt-1 inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent disabled:opacity-60"
                        >
                            {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                REPLY_LABEL[current as RsvpReply] ?? "Reply"
                            )}
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" onClick={stop} onContextMenu={stop}>
                        {(Object.keys(REPLY_LABEL) as RsvpReply[]).map((value) => (
                            <DropdownMenuItem
                                key={value}
                                onSelect={() => reply(value)}
                                className={cn(current === value && "font-semibold")}
                            >
                                {REPLY_LABEL[value]}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : iAmOrganizer ? (
                <p className="text-xs text-muted-foreground">You are the organizer</p>
            ) : invite.method === "REQUEST" && !me ? (
                <p className="text-xs text-muted-foreground">You aren&apos;t on the guest list</p>
            ) : null}
        </div>
    )
}

/** Gmail-style "RSVP ▾" chip on a mail row; the popover loads the invite on first open. */
export function InviteRsvpChip({ messageId, className }: { messageId: string; className?: string }) {
    const [open, setOpen] = React.useState(false)
    const [method, setMethod] = React.useState<string | null>(() => inviteCache.get(messageId)?.invite.method ?? null)
    const onLoaded = React.useCallback((invite: ParsedInvite | null) => setMethod(invite?.method ?? null), [])

    const label =
        method === "CANCEL" ? "Cancelled" : method === "REPLY" ? "Reply" : method && method !== "REQUEST" ? "Event" : "RSVP"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    onClick={stop}
                    onContextMenu={stop}
                    aria-label="Calendar invitation"
                    className={cn(
                        "inline-flex h-5 flex-shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5",
                        "text-[11px] font-medium text-foreground/80 transition-colors hover:bg-accent",
                        open && "bg-accent",
                        className,
                    )}
                >
                    {label}
                    <ChevronDown className="h-3 w-3" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[360px] max-w-[calc(100vw-32px)] cursor-default p-4"
                onClick={stop}
                onContextMenu={stop}
                onPointerDown={stop}
            >
                {open && <InviteDetails messageId={messageId} onLoaded={onLoaded} />}
            </PopoverContent>
        </Popover>
    )
}

export default InviteRsvpChip
