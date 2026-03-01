"use client"
import React, { useCallback } from "react"
import {
    Archive,
    Trash2,
    Clock,
    CheckSquare,
    MoveRight,
    Tag,
    BellOff,
    Search,
    ExternalLink,
    Star,
    Pin,
    Mail,
    MailOpen,
    Reply,
    ReplyAll,
    Forward,
    AlertTriangle,
    FolderInput,
} from "lucide-react"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
    ContextMenuShortcut,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"
import { GetAllMailsPayload } from "@/lib/types/mail.interface"

/* ──────────────────────── Types ──────────────────────── */

interface EmailContextMenuProps {
    children: React.ReactNode
    item: GetAllMailsPayload
    onAction: (action: string, messageIds: string[]) => void
    senderName?: string
}

/* ──────────────────────── Helpers ──────────────────────── */

/** Styled menu item wrapper */
const MenuItem = React.memo(({
    icon: Icon,
    label,
    shortcut,
    danger,
    active,
    activeColor,
    onClick,
}: {
    icon: React.ElementType
    label: string
    shortcut?: string
    danger?: boolean
    active?: boolean
    activeColor?: string
    onClick?: () => void
}) => (
    <ContextMenuItem
        onClick={onClick}
        className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] rounded-md cursor-default",
            "transition-colors duration-100",
            danger && "text-destructive focus:text-destructive focus:bg-destructive/10",
        )}
    >
        <Icon
            className={cn(
                "h-4 w-4 flex-shrink-0",
                active && activeColor,
                danger && "text-destructive",
            )}
            strokeWidth={1.8}
        />
        <span className="flex-1">{label}</span>
        {shortcut && (
            <ContextMenuShortcut className="text-[11px] text-muted-foreground/50 ml-auto pl-4">
                {shortcut}
            </ContextMenuShortcut>
        )}
    </ContextMenuItem>
))
MenuItem.displayName = "MenuItem"

/** Sub-menu trigger wrapper */
const SubTrigger = React.memo(({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <ContextMenuSubTrigger className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] rounded-md">
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.8} />
        <span>{label}</span>
    </ContextMenuSubTrigger>
))
SubTrigger.displayName = "SubTrigger"

/** Colored dot for tab categories */
const TabDot = ({ color }: { color: string }) => (
    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", color)} />
)

/* ──────────────────────── Constants ──────────────────────── */

const FOLDERS = ["Inbox", "Sent", "Drafts", "Spam", "Trash"] as const
const LABELS = ["Important", "Work", "Personal", "To-do"] as const
const TABS = [
    { name: "Primary", color: "bg-blue-500" },
    { name: "Promotions", color: "bg-green-500" },
    { name: "Updates", color: "bg-yellow-500" },
    { name: "Forums", color: "bg-purple-500" },
] as const

/* ──────────────────────── Component ──────────────────────── */

export function EmailContextMenu({ children, item, onAction, senderName }: EmailContextMenuProps) {
    const ids = [item.message_id]

    const fire = useCallback(
        (action: string) => () => onAction(action, ids),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onAction, item.message_id]
    )

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent
                className={cn(
                    "w-60 rounded-xl p-1.5",
                    "bg-popover/95 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/80",
                    "border border-border/50 shadow-xl shadow-black/10 dark:shadow-black/30",
                    "animate-in fade-in-0 zoom-in-95 duration-150",
                )}
            >
                {/* ── Reply / Forward group ── */}
                <MenuItem icon={Reply} label="Reply" shortcut="R" onClick={fire("reply")} />
                <MenuItem icon={ReplyAll} label="Reply all" shortcut="⇧R" onClick={fire("reply_all")} />
                <MenuItem icon={Forward} label="Forward" shortcut="F" onClick={fire("forward")} />

                <ContextMenuSeparator className="my-1 bg-border/40" />

                {/* ── Quick actions ── */}
                <MenuItem
                    icon={Star}
                    label={item.is_starred ? "Unstar" : "Star"}
                    active={!!item.is_starred}
                    activeColor="text-yellow-500"
                    onClick={fire(item.is_starred ? "unstar" : "star")}
                />
                <MenuItem
                    icon={Pin}
                    label={item.is_pinned ? "Unpin" : "Pin"}
                    active={!!item.is_pinned}
                    activeColor="text-blue-500"
                    onClick={fire(item.is_pinned ? "unpin" : "pin")}
                />
                <MenuItem
                    icon={AlertTriangle}
                    label={item.is_important ? "Not important" : "Mark as important"}
                    active={!!item.is_important}
                    activeColor="text-orange-500"
                    onClick={fire(item.is_important ? "unimportance" : "importance")}
                />
                <MenuItem
                    icon={item.is_read ? MailOpen : Mail}
                    label={item.is_read ? "Mark as unread" : "Mark as read"}
                    shortcut="⇧U"
                    onClick={fire(item.is_read ? "mark_as_unread" : "mark_as_read")}
                />

                <ContextMenuSeparator className="my-1 bg-border/40" />

                {/* ── Organize ── */}
                <MenuItem icon={Archive} label="Archive" shortcut="E" onClick={fire("archive")} />

                <ContextMenuSub>
                    <SubTrigger icon={FolderInput} label="Move to" />
                    <ContextMenuSubContent className="w-44 rounded-xl p-1.5 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl">
                        {FOLDERS.map((f) => (
                            <ContextMenuItem
                                key={f}
                                className="text-[13px] px-2.5 py-1.5 rounded-md"
                                onClick={() => onAction("move-to-folder", ids)}
                            >
                                {f}
                            </ContextMenuItem>
                        ))}
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSub>
                    <SubTrigger icon={MoveRight} label="Move to tab" />
                    <ContextMenuSubContent className="w-44 rounded-xl p-1.5 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl">
                        {TABS.map((t) => (
                            <ContextMenuItem key={t.name} className="flex items-center gap-2.5 text-[13px] px-2.5 py-1.5 rounded-md">
                                <TabDot color={t.color} />
                                {t.name}
                            </ContextMenuItem>
                        ))}
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSub>
                    <SubTrigger icon={Tag} label="Label as" />
                    <ContextMenuSubContent className="w-44 rounded-xl p-1.5 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl">
                        {LABELS.map((l) => (
                            <ContextMenuItem key={l} className="text-[13px] px-2.5 py-1.5 rounded-md">
                                {l}
                            </ContextMenuItem>
                        ))}
                        <ContextMenuSeparator className="my-1 bg-border/40" />
                        <ContextMenuItem className="text-[13px] px-2.5 py-1.5 rounded-md text-primary">
                            Create new label
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator className="my-1 bg-border/40" />

                {/* ── Utilities ── */}
                <MenuItem icon={Clock} label="Snooze" onClick={fire("snooze")} />
                <MenuItem icon={CheckSquare} label="Add to Tasks" onClick={fire("add_to_tasks")} />
                <MenuItem icon={BellOff} label="Mute" onClick={fire("mute")} />

                {senderName && (
                    <MenuItem icon={Search} label={`Find from ${senderName}`} onClick={fire("search_sender")} />
                )}

                <MenuItem icon={ExternalLink} label="Open in new window" onClick={fire("open_new_window")} />

                <ContextMenuSeparator className="my-1 bg-border/40" />

                {/* ── Danger zone ── */}
                <MenuItem icon={Trash2} label="Delete" shortcut="⌫" danger onClick={fire("delete")} />
            </ContextMenuContent>
        </ContextMenu>
    )
}
