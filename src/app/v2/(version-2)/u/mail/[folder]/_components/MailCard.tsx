"use client"
import { airsendDB } from '@/db';
import React, { useCallback } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Archive, Flag } from "lucide-react";
import { Badge } from '@/components/ui/badge';

import { cn, dateToFromNowDaily, filterNameAndEmail, formattedName } from '@/lib/utils';
import { useMailStore } from '@/store/mails';
import { RiAttachment2 } from '@remixicon/react';

import { useParams, useRouter } from 'next/navigation';
import { EmailContextMenu } from './EmailContextMenu';
import { MailStatusIndicators } from './MailStatusIndicators';

import { GetAllMailsPayload } from '@/lib/types/mail.interface';
import { Security } from '@/lib/security';
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event';

const s = new Security();

/** Safely decrypt — returns raw value when decryption fails or input is not encrypted */
function safeDecrypt(value: string | undefined | null): string {
    if (!value) return ""
    if (!value.includes(":")) return value
    const result = s.decryptAES(value)
    return result || value
}

/** Strip HTML tags and decode entities to plain text */
function stripHtml(html: string): string {
    if (!html) return ""
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
    // Collapse whitespace
    return text.replace(/\s+/g, " ").trim()
}

/** Generate a stable pastel color from a string */
const getAvatarColor = (name: string) => {
    const colors = [
        "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        "bg-violet-500/15 text-violet-600 dark:text-violet-400",
        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        "bg-rose-500/15 text-rose-600 dark:text-rose-400",
        "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
        "bg-orange-500/15 text-orange-600 dark:text-orange-400",
        "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
}

/** Hover action button */
const ActionBtn = React.memo(({ icon: Icon, hoverColor, onClick }: {
    icon: React.ElementType; hoverColor: string; onClick: (e: React.MouseEvent) => void
}) => (
    <button
        className={cn(
            "p-1.5 rounded-md transition-all duration-150",
            "text-muted-foreground hover:bg-accent",
            hoverColor
        )}
        onClick={onClick}
    >
        <Icon size={16} strokeWidth={1.8} />
    </button>
))
ActionBtn.displayName = "ActionBtn"

export const MailCard = React.memo(({ item }: { item: GetAllMailsPayload }) => {
    const router = useRouter()
    const params = useParams()
    const setSelectedMail = useMailStore((state) => state.setSelectedMail)
    const [hovered, setHovered] = React.useState(false)
    const checkedItems = useMailStore((state) => state.checkedItems)
    const setCheckedItems = useMailStore((state) => state.setCheckedItems)
    const { emit } = useCustomEvent(CustomEventKey.MailEvents)

    const decryptedFromEmail = React.useMemo(() => safeDecrypt(item.from_email), [item.from_email])
    const decryptedSubject = React.useMemo(() => safeDecrypt(item?.subject), [item?.subject])
    const decryptedPlainText = React.useMemo(() => safeDecrypt(item?.plain_text), [item?.plain_text])
    const previewText = React.useMemo(() => stripHtml(decryptedPlainText), [decryptedPlainText])

    // Determine if current user sent this mail:
    // receipient = current user's email; from_email = actual sender
    // If decrypted from_email contains receipient → I sent it → show recipients
    const isSentByMe = React.useMemo(() => {
        if (!item.receipient || !decryptedFromEmail) return false
        return decryptedFromEmail.toLowerCase().includes(item.receipient.toLowerCase())
    }, [decryptedFromEmail, item.receipient])

    // For received mail: show sender (from_email)
    // For sent mail: show first recipient
    const displayName = React.useMemo(() => {
        if (isSentByMe) {
            const firstRecipient = safeDecrypt(item.receipients?.[0] ?? "")
            return filterNameAndEmail(firstRecipient, firstRecipient)
        }
        return filterNameAndEmail(decryptedFromEmail, decryptedFromEmail)
    }, [isSentByMe, decryptedFromEmail, item.receipients])

    const avatarInitials = React.useMemo(() => formattedName(displayName), [displayName])
    const avatarColor = React.useMemo(() => getAvatarColor(displayName), [displayName])

    const attachments = React.useMemo(() => {
        if (Array.isArray(item.hasAttachment)) return item.hasAttachment
        return []
    }, [item.hasAttachment])

    const isChecked = checkedItems.includes(item.message_id)
    const anyChecked = checkedItems.length > 0

    const handleCheckChange = useCallback(
        (id: string, checked: boolean) => {
            setCheckedItems(checked
                ? [...checkedItems, id]
                : checkedItems.filter((x) => x !== id)
            )
        },
        [checkedItems, setCheckedItems]
    )

    const handleClick = useCallback(async () => {
        const data = await airsendDB.getItemByKey("mails", item.message_id) as any | null
        if (data) setSelectedMail(data)
        router.push(`/v2/u/mail/${params?.folder}/${item.message_id}`)
    }, [item.message_id, params?.folder, router, setSelectedMail])

    const handleAction = useCallback(
        (action: string) => (e: React.MouseEvent) => {
            e.stopPropagation()
            emit({ action, message_id: [item.message_id] })
        },
        [emit, item.message_id]
    )

    /** Handler for context-menu and hover actions */
    const handleContextAction = useCallback(
        (action: string, messageIds: string[]) => {
            emit({ action, message_id: messageIds })
        },
        [emit]
    )

    return (
        <EmailContextMenu item={item} onAction={handleContextAction} senderName={displayName}>
            <div
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn(
                    "group relative border-b border-border/40 cursor-pointer",
                    "transition-colors duration-150 ease-out",
                    "hover:bg-accent/50 dark:hover:bg-accent/30",
                    isChecked && "bg-blue-500/5 dark:bg-blue-500/10",
                    !item.is_read && "bg-background dark:bg-neutral-900/80",
                    item.is_read && "bg-transparent"
                )}
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    {/* Checkbox / Avatar column */}
                    <div className="relative flex-shrink-0">
                        <div className={cn(
                            "transition-all duration-150",
                            (hovered || anyChecked) ? "opacity-0 scale-75" : "opacity-100 scale-100"
                        )}>
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className={cn("text-xs font-semibold", avatarColor)}>
                                    {avatarInitials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {(hovered || anyChecked) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Checkbox
                                    className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all duration-150"
                                    checked={isChecked}
                                    onClick={(e) => e.stopPropagation()}
                                    onCheckedChange={(v) => handleCheckChange(item.message_id, !!v)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* ── Mobile: stacked rows (<640px) ── */}
                        <div className="flex flex-col gap-0.5 sm:hidden">
                            {/* Row 1: sender + timestamp */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="relative flex items-center min-w-0">
                                    {!item.is_read && (
                                        <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    )}
                                    <span className={cn(
                                        "text-sm truncate",
                                        !item.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                    )}>
                                        {isSentByMe ? (
                                            <>
                                                <span className="text-muted-foreground/70">To: </span>
                                                {displayName}
                                                {(item.receipients?.length ?? 0) > 1 && (
                                                    <span className="text-muted-foreground/50 ml-1">+{item.receipients!.length - 1}</span>
                                                )}
                                            </>
                                        ) : displayName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <MailStatusIndicators item={item} />
                                    <span className={cn(
                                        "text-xs whitespace-nowrap",
                                        hovered ? "opacity-0" : "opacity-100",
                                        !item.is_read ? "text-blue-500 font-medium" : "text-muted-foreground/60"
                                    )}>
                                        {dateToFromNowDaily(new Date((item?.timestamp || item?.created_at) as string))}
                                    </span>
                                </div>
                            </div>
                            {/* Row 2: subject */}
                            <p className={cn(
                                "text-sm truncate",
                                !item.is_read ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                                {decryptedSubject}
                            </p>
                            {/* Row 3: preview + attachments */}
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground/60 truncate flex-1 min-w-0 leading-relaxed">
                                    {previewText}
                                </p>
                                {(attachments.length > 0 || item.has_attachments) && (
                                    <Badge variant="secondary" className="flex-shrink-0 gap-1 text-[10px] font-normal px-1.5 py-0 h-5 rounded-md bg-muted text-muted-foreground">
                                        <RiAttachment2 className="w-3 h-3" />
                                        {attachments.length > 0 && <span>{attachments.length}</span>}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* ── Desktop: single-line (sender | subject | preview | meta) ── */}
                        <div className="hidden sm:flex items-center min-w-0">
                            {/* Sender — fixed width, always visible */}
                            <div className="flex-shrink-0 w-[180px] lg:w-[220px] relative flex items-center pr-3">
                                {!item.is_read && (
                                    <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                                <span className={cn(
                                    "text-sm truncate",
                                    !item.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                )}>
                                    {isSentByMe ? (
                                        <>
                                            <span className="text-muted-foreground/70">To: </span>
                                            {displayName}
                                            {(item.receipients?.length ?? 0) > 1 && (
                                                <span className="text-muted-foreground/50 ml-1">+{item.receipients!.length - 1}</span>
                                            )}
                                        </>
                                    ) : displayName}
                                </span>
                            </div>

                            {/* Subject + Preview — fills remaining space, truncates */}
                            <div className="flex-1 min-w-0 flex items-center">
                                <span className={cn(
                                    "text-sm truncate flex-shrink min-w-0",
                                    !item.is_read ? "text-foreground font-medium" : "text-muted-foreground"
                                )}>
                                    {decryptedSubject}
                                </span>
                                {previewText && (
                                    <span className="truncate flex-shrink min-w-0 ml-1.5">
                                        <span className="text-muted-foreground/30">&mdash;&nbsp;</span>
                                        <span className="text-xs text-muted-foreground/50">{previewText}</span>
                                    </span>
                                )}
                            </div>

                            {/* Right: attachments + indicators + timestamp */}
                            <div className="flex items-center gap-2 flex-shrink-0 pl-3">
                                {(attachments.length > 0 || item.has_attachments) && (
                                    <Badge variant="secondary" className="gap-1 text-[10px] font-normal px-1.5 py-0 h-5 rounded-md bg-muted text-muted-foreground">
                                        <RiAttachment2 className="w-3 h-3" />
                                        {attachments.length > 0 && <span>{attachments.length}</span>}
                                    </Badge>
                                )}
                                <MailStatusIndicators item={item} />
                                <span className={cn(
                                    "text-xs whitespace-nowrap transition-opacity duration-150",
                                    hovered ? "opacity-0" : "opacity-100",
                                    !item.is_read ? "text-blue-500 font-medium" : "text-muted-foreground/60"
                                )}>
                                    {dateToFromNowDaily(new Date((item?.timestamp || item?.created_at) as string))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gmail-style hover action overlay — floats on the right side of the card */}
                {hovered && (
                    <div
                        className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                            "flex items-center gap-0.5 px-1.5 py-1 rounded-lg",
                            "bg-background/95 dark:bg-neutral-900/95 backdrop-blur-sm",
                            "border border-border/60 shadow-sm",
                            "animate-in fade-in slide-in-from-right-2 duration-150"
                        )}
                    >
                        <ActionBtn icon={Star} hoverColor="hover:text-yellow-500" onClick={handleAction("star")} />
                        <ActionBtn icon={Flag} hoverColor="hover:text-blue-500" onClick={handleAction("importance")} />
                        <ActionBtn icon={Archive} hoverColor="hover:text-emerald-500" onClick={handleAction("archive")} />
                        <ActionBtn icon={Trash2} hoverColor="hover:text-red-500" onClick={handleAction("delete")} />
                    </div>
                )}
            </div>
        </EmailContextMenu>
    )
})

MailCard.displayName = 'MailCard'

