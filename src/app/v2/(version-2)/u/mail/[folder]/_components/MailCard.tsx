"use client"
import { airsendDB } from '@/db';
import React, { useCallback } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Archive, Flag, MoreVertical } from "lucide-react";
import { Badge } from '@/components/ui/badge';

import { cn, dateToFromNowDaily, filterNameAndEmail, formattedName } from '@/lib/utils';
import { useMailStore } from '@/store/mails';
import { RiAttachment2 } from '@remixicon/react';

import { useParams, useRouter } from 'next/navigation';
import { EmailContextMenu } from './EmailContextMenu';

import { GetAllMailsPayload } from '@/lib/types/mail.interface';
import { Security } from '@/lib/security';
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event';

const s = new Security();

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
            "p-1.5 rounded-lg transition-all duration-150",
            "text-muted-foreground/60 hover:bg-accent",
            hoverColor
        )}
        onClick={onClick}
    >
        <Icon size={14} strokeWidth={1.8} />
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

    const decryptedFromEmail = React.useMemo(() => s.decryptAES(item.from_email), [item.from_email])
    const decryptedPlainText = React.useMemo(() => s.decryptAES(item?.plain_text) || item?.plain_text, [item?.plain_text])
    const displayName = React.useMemo(() => filterNameAndEmail(decryptedFromEmail, decryptedFromEmail), [decryptedFromEmail])
    const avatarInitials = React.useMemo(() => formattedName(displayName), [displayName])
    const avatarColor = React.useMemo(() => getAvatarColor(displayName), [displayName])

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

    return (
        <EmailContextMenu>
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
                                    {item.folder === "sent"
                                        ? formattedName(filterNameAndEmail(item.receipients[0], item.receipients[0]))
                                        : avatarInitials
                                    }
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
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        {/* Top row: sender + timestamp */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {!item.is_read && (
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                                <span className={cn(
                                    "text-sm truncate",
                                    !item.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                )}>
                                    {item.folder === "sent"
                                        ? <>
                                            <span className="text-muted-foreground/70">To: </span>
                                            {filterNameAndEmail(item.receipients[0], item.receipients[0])}
                                            {item.receipients.length > 1 && (
                                                <span className="text-muted-foreground/50 ml-1">+{item.receipients.length - 1}</span>
                                            )}
                                        </>
                                        : displayName
                                    }
                                </span>
                            </div>

                            {/* Right side: actions or timestamp */}
                            <div className="flex-shrink-0 flex items-center">
                                {hovered ? (
                                    <div className="flex items-center gap-0.5 animate-in fade-in duration-150">
                                        <ActionBtn icon={Star} hoverColor="hover:text-yellow-500" onClick={handleAction("starred")} />
                                        <ActionBtn icon={Flag} hoverColor="hover:text-blue-500" onClick={handleAction("mark_as_important")} />
                                        <ActionBtn icon={Archive} hoverColor="hover:text-emerald-500" onClick={handleAction("archive")} />
                                        <ActionBtn icon={Trash2} hoverColor="hover:text-red-500" onClick={handleAction("delete")} />
                                    </div>
                                ) : (
                                    <span className={cn(
                                        "text-xs whitespace-nowrap",
                                        !item.is_read ? "text-blue-500 font-medium" : "text-muted-foreground/60"
                                    )}>
                                        {dateToFromNowDaily(new Date(item?.timestamp as string))}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Subject line */}
                        <div className={cn(
                            "text-sm truncate",
                            !item.is_read ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                            {item?.subject}
                        </div>

                        {/* Preview + attachments */}
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground/60 truncate flex-1 min-w-0 leading-relaxed">
                                {decryptedPlainText}
                            </p>
                            {item?.hasAttachment && Array.isArray(item.hasAttachment) && item.hasAttachment.length > 0 && (
                                <Badge variant="secondary" className="flex-shrink-0 gap-1 text-[10px] font-normal px-1.5 py-0 h-5 rounded-md bg-muted/50">
                                    <RiAttachment2 className="w-3 h-3" />
                                    <span>{item.hasAttachment.length}</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </EmailContextMenu>
    )
})

MailCard.displayName = 'MailCard'

