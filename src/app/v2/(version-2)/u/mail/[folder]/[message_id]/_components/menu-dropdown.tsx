"use client";

import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    Archive,
    BellOff,
    Forward,
    Mail,
    MailWarning,
    MoveRight,
    Reply,
    ReplyAll,
    ShieldBan,
    Star,
    Trash2,
    UserX,
} from "lucide-react";

import { useMailStore } from "@/store/mails";

export interface MailDropdownActions {
    onReply?: () => void;
    onReplyAll?: () => void;
    onForward?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onMarkUnread?: () => void;
    onSpam?: () => void;
    onMoveTo?: (folder: string) => void;
    onToggleStar?: () => void;
    onBlockSender?: () => void;
    onBlockDomain?: () => void;
}

export function MailDropdown({
    children,
    actions,
    senderEmail,
    senderDomain,
}: {
    children: React.ReactNode;
    actions?: MailDropdownActions;
    /** Full sender email address (for display in confirm dialog) */
    senderEmail?: string;
    /** Sender domain (for display in confirm dialog) */
    senderDomain?: string;
}) {
    const all_mailbox = useMailStore((s) => s.all_mailbox);
    const all_folders = useMailStore((s) => s.all_folders);

    const [confirmType, setConfirmType] = useState<"sender" | "domain" | null>(null);

    const moveTargets = [
        ...(all_mailbox?.map((m) => m.path) ?? []),
        ...(all_folders?.map((f) => f.path) ?? []),
    ];

    const handleConfirm = () => {
        if (confirmType === "sender") actions?.onBlockSender?.();
        if (confirmType === "domain") actions?.onBlockDomain?.();
        setConfirmType(null);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    {/* Reply / Reply All / Forward */}
                    <DropdownMenuItem onClick={actions?.onReply} className="gap-2 text-xs">
                        <Reply className="h-3.5 w-3.5" /> Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={actions?.onReplyAll} className="gap-2 text-xs">
                        <ReplyAll className="h-3.5 w-3.5" /> Reply all
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={actions?.onForward} className="gap-2 text-xs">
                        <Forward className="h-3.5 w-3.5" /> Forward
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Star */}
                    <DropdownMenuItem onClick={actions?.onToggleStar} className="gap-2 text-xs">
                        <Star className="h-3.5 w-3.5" /> Star
                    </DropdownMenuItem>

                    {/* Mark as unread */}
                    <DropdownMenuItem onClick={actions?.onMarkUnread} className="gap-2 text-xs">
                        <Mail className="h-3.5 w-3.5" /> Mark as unread
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Archive */}
                    <DropdownMenuItem onClick={actions?.onArchive} className="gap-2 text-xs">
                        <Archive className="h-3.5 w-3.5" /> Archive
                    </DropdownMenuItem>

                    {/* Delete */}
                    <DropdownMenuItem
                        onClick={actions?.onDelete}
                        className="gap-2 text-xs text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>

                    {/* Report spam */}
                    <DropdownMenuItem onClick={actions?.onSpam} className="gap-2 text-xs">
                        <MailWarning className="h-3.5 w-3.5" /> Report spam
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Block sender */}
                    <DropdownMenuItem
                        onClick={() => setConfirmType("sender")}
                        className="gap-2 text-xs"
                    >
                        <UserX className="h-3.5 w-3.5" /> Block sender
                    </DropdownMenuItem>

                    {/* Block domain */}
                    <DropdownMenuItem
                        onClick={() => setConfirmType("domain")}
                        className="gap-2 text-xs"
                    >
                        <ShieldBan className="h-3.5 w-3.5" /> Block domain
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Move to */}
                    {moveTargets.length > 0 && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2 text-xs">
                                <MoveRight className="h-3.5 w-3.5" /> Move to
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-44 max-h-60 overflow-y-auto">
                                {moveTargets.map((target) => (
                                    <DropdownMenuItem
                                        key={target}
                                        className="text-xs capitalize"
                                        onClick={() => actions?.onMoveTo?.(target)}
                                    >
                                        {target}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )}

                    {/* Mute (placeholder) */}
                    <DropdownMenuItem disabled className="gap-2 text-xs">
                        <BellOff className="h-3.5 w-3.5" /> Mute
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation dialog for block sender / domain */}
            <AlertDialog open={!!confirmType} onOpenChange={(open) => !open && setConfirmType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmType === "sender" ? "Block sender" : "Block domain"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmType === "sender"
                                ? `Are you sure you want to block all emails from ${senderEmail || "this sender"}? You can unblock later in Settings → Email Config.`
                                : `Are you sure you want to block all emails from the domain ${senderDomain || "this domain"}? This will block every sender at this domain. You can unblock later in Settings → Email Config.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleConfirm}
                        >
                            Block
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
  