"use client";
import {
    ChevronDown,
    ChevronLeft,
    Forward,
    Lock,
    MoreVertical,
    Paperclip,
    Reply,
    Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { cn, formatEmail } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { Fragment, useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";
import moment from "moment";

import { Separator } from "@/components/ui/separator";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { MailDisplaySkeleton, MailHeaderSkeleton } from "./mail-skeleton";
import { useMailStore } from "@/store/mails";
import { db } from "@/db";

import { MailDropdown, type MailDropdownActions } from "./menu-dropdown";
import { Security } from "@/lib/security";
import { useMailRenderSettings } from "@/store/mails/mail-render-settings";
import { MailStatusIndicators } from "../../_components/MailStatusIndicators";
import { useMailActions, safeDecrypt } from "./use-mail-actions";

const s = new Security();

const ClientDisplay = ({
    folder,
    message_id,
}: {
    folder: string;
    message_id: string;
}) => {
    const router = useRouter();
    const { setRenderStyle, renderStyle, setRenderMode, renderMode } =
        useMailRenderSettings();

    const { selectedMail, setSelectedMail, setLoading } = useMailStore();

    const {
        handleReply,
        handleReplyAll,
        handleForward,
        handleDelete,
        handleArchive,
        handleMarkRead,
        handleMarkUnread,
        handleSpam,
        handleMoveTo,
        handleToggleStar,
        handleBlockSender,
        handleBlockDomain,
    } = useMailActions();

    const senderEmail = useMemo(
        () => (selectedMail ? safeDecrypt(selectedMail.from_email) : ""),
        [selectedMail?.from_email]
    );
    const senderDomain = useMemo(
        () => senderEmail?.split("@")[1] || "",
        [senderEmail]
    );

    useEffect(() => {
        if (!selectedMail) {
            db.mails
                .where("message_id")
                .equals(message_id)
                .first()
                .then((item) => setSelectedMail(item as any));
        }
    }, [selectedMail]);

    // Mark as read when user views the mail
    useEffect(() => {
        if (selectedMail && !selectedMail.is_read) {
            handleMarkRead();
        }
    }, [selectedMail?.message_id]);

    const dropdownActions: MailDropdownActions = {
        onReply: handleReply,
        onReplyAll: handleReplyAll,
        onForward: handleForward,
        onDelete: handleDelete,
        onArchive: handleArchive,
        onMarkUnread: handleMarkUnread,
        onSpam: handleSpam,
        onMoveTo: handleMoveTo,
        onToggleStar: handleToggleStar,
        onBlockSender: handleBlockSender,
        onBlockDomain: handleBlockDomain,
    };
    if (!selectedMail)
        return (
            <Fragment>
                <MailHeaderSkeleton folder={folder} />
                <MailDisplaySkeleton />
            </Fragment>
        );

    return (
        <Fragment>
            <div className="flex ml-1 items-center gap-4 py-2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full"
                    onClick={() => router.push(`/v2/u/mail/${folder}`)}
                >
                    <ChevronLeft />
                </Button>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-2xl font-bold truncate">{selectedMail?.subject}</h2>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {moment(selectedMail?.timestamp).format("MMM DD, YYYY hh:mm A")}
                        </span>
                    </div>
                    {/* Mail status indicators */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <MailStatusIndicators item={selectedMail as any} />
                        {(selectedMail?.has_attachments || (Array.isArray(selectedMail?.hasAttachment) && (selectedMail?.hasAttachment as any[]).length > 0)) && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Paperclip className="w-3.5 h-3.5" />
                                Attachments
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <Separator className="my-2" />
            <div className="flex flex-col lg:flex-row justify-between items-start md:px-4 pb-2 md:pl-1">
                <div className="flex items-center text-sm flex-1 md:gap-2">
                    <Avatar>
                        <AvatarImage
                            alt={formatEmail(
                                s.decryptAES(selectedMail?.from_email)
                            ).toLocaleUpperCase()}
                        />
                        <AvatarFallback className="flex items-center justify-center h-10 w-10 bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full">
                            {selectedMail?.from_email &&
                                formatEmail(
                                    s.decryptAES(selectedMail?.from_email)
                                ).toLocaleUpperCase()[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ml-2 md:ml-0">
                        <div className="flex flex-col sm:flex-row gap-2 align-text-bottom">
                            <div className="font-semibold">
                                {selectedMail?.from_email &&
                                    formatEmail(
                                        s.decryptAES(selectedMail?.from_email)
                                    )}
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            {selectedMail.folder === "sent" ? (
                                <div className="text-sm text-muted-foreground">
                                    To: {Array.isArray(selectedMail?.receipients) ? selectedMail.receipients.join(", ") : selectedMail?.receipients}
                                </div>
                            ) : (
                                <span className="group relative text-xs text-zinc-500 cursor-pointer">
                                    To me
                                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block rounded-md bg-black text-white text-[10px] px-2 py-1 whitespace-nowrap shadow-md z-10">
                                        {selectedMail?.receipient}
                                    </span>
                                </span>
                            )}
                            <Tooltip>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size={"icon"}
                                                variant={"ghost"}
                                                className="w-5 h-5"
                                            >
                                                <ChevronDown size={10} />
                                            </Button>
                                        </TooltipTrigger>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] px-4 sm:px-6 md:px-8 lg:px-10">
                                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-2 py-4 text-sm">
                                            <div className="text-right text-muted-foreground">from:</div>
                                            <div>
                                                <strong>
                                                    {selectedMail?.from_email &&
                                                        formatEmail(
                                                            s.decryptAES(
                                                                selectedMail?.from_email
                                                            )
                                                        )}
                                                </strong>
                                            </div>

                                            <div className="text-right text-muted-foreground">to:</div>
                                            <div className="break-all">
                                                {selectedMail.folder === "sent"
                                                    ? (Array.isArray(selectedMail?.receipients)
                                                        ? selectedMail.receipients.join(", ")
                                                        : selectedMail?.receipients)
                                                    : selectedMail?.receipient}
                                            </div>

                                            <div className="text-right text-muted-foreground">date:</div>
                                            <div>
                                                {moment(selectedMail?.timestamp).format("lll")}
                                            </div>

                                            <div className="text-right text-muted-foreground">subject:</div>
                                            <div>{selectedMail?.subject}</div>

                                            <div className="text-right text-muted-foreground">mailed-by:</div>
                                            <div>{selectedMail?.receipient?.split("@")[1]}</div>

                                            <div className="text-right text-muted-foreground">security:</div>
                                            <div className="flex items-center gap-1">
                                                <Lock size={10} />
                                                Standard encryption (TLS)
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <TooltipContent>Show details</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-auto flex justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleReply}
                                variant="ghost"
                                size="icon"
                                disabled={!selectedMail}
                            >
                                <Reply className="h-4 w-4" />
                                <span className="sr-only">Reply</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reply</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleForward}
                                variant="ghost"
                                size="icon"
                                disabled={!selectedMail}
                            >
                                <Forward className="h-4 w-4" />
                                <span className="sr-only">Forward</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Forward</TooltipContent>
                    </Tooltip>

                    <AlertDialog>
                        <AlertDialogTrigger
                            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Trash2 className={cn("h-4 w-4")} />
                                        <span className="sr-only">Trash</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete
                                    this mail from your account.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <MailDropdown actions={dropdownActions} senderEmail={senderEmail} senderDomain={senderDomain}>
                        <Button variant="ghost" size="icon" disabled={!selectedMail}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                        </Button>
                    </MailDropdown>
                </div>
            </div>
        </Fragment>
    );
};

export default ClientDisplay;
