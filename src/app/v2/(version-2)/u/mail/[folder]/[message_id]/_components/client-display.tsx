"use client"
import {
    ChevronDown,
    ChevronLeft,
    Forward,
    Lock,
    MoreVertical,
    Reply,
    Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { cn, formatEmail } from '@/lib/utils'
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
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useRouter } from "next/navigation";
import moment from "moment";
import { ROLE } from "@/lib/types/user.interface";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileAttachmentInterface, MailData } from "@/lib/types/mail.interface";
import { ApiResponse } from '@/lib/types';
import FileAttachment from '../../../_components/file-attachment';
import { MailIframe } from '@/components/common/mail-iframe';
import { API } from '@/lib/api/handler';
import { AxiosResponse } from 'axios';

import { MailDisplaySkeleton, MailHeaderSkeleton } from "./mail-skeleton";
import { useMailStore } from "@/store/mails";
import { airsendDB, db } from "@/db";
import { useAppSelector } from "@/store/hooks";
import { MailDropdown } from "./menu-dropdown";
import { SendMail } from "@/components/server-actions/send-mail";
import { Security } from "@/lib/security";


const ClientDisplay = ({ folder, message_id }: { folder: string, message_id: string }) => {
    const router = useRouter();
    const currAccount = useAppSelector(state => state.accounts.currAccount)


    const { selectedMail, setSelectedMail, setLoading } = useMailStore()
    useEffect(() => {
        if (!selectedMail) {
            db.mails.where("message_id").equals(message_id).first().then(item => setSelectedMail(item as any))
        }

    }, [selectedMail])
    if (!selectedMail) return (
        <Fragment>
            <MailHeaderSkeleton folder={folder} />
            <MailDisplaySkeleton />
        </Fragment>
    )


    return (
        <Fragment>
            <div className="flex ml-1 items-center gap-4 py-2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full"
                    onClick={() => router.back()}
                >
                    <ChevronLeft />
                </Button>

                <div className="flex items-baseline gap-3">
                    <h2 className="text-2xl font-bold">{selectedMail?.subject}</h2>
                    <span className="text-sm text-muted-foreground">
                        {moment(selectedMail?.date).format("MMM DD, YYYY hh:mm A")}
                    </span>
                </div>
            </div>

            <Separator className="my-2" />
            <div className="flex flex-col lg:flex-row justify-between items-start md:px-4 pb-2 md:pl-1">
                <div className="flex items-center text-sm flex-1 md:gap-2">
                    <Avatar>
                        <AvatarImage alt={formatEmail(Security.DecryptFromString(selectedMail?.from_email)).toLocaleUpperCase()} />
                        <AvatarFallback className='flex items-center justify-center h-10 w-10 bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full'>
                            {selectedMail?.from_email && formatEmail(Security.DecryptFromString(selectedMail?.from_email)).toLocaleUpperCase()
                                .split(" ")
                                .map((chunk) => chunk[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ml-2 md:ml-0">
                        <div className="flex flex-col sm:flex-row gap-2 align-text-bottom">
                            <div className="font-semibold">{selectedMail?.from_email && formatEmail(Security.DecryptFromString(selectedMail?.from_email))}</div>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-xs text-zinc-500">To me</span>
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
                                    <PopoverContent className="flex w-[450px] px-4 sm:px-6 md:px-8 lg:px-10">
                                        <div className="flex flex-row gap-4 px-2 py-4 text-sm">
                                            {/* Left Column */}
                                            <div className="flex flex-col items-end text-right shrink-0">
                                                <div>from:</div>
                                                <div>to:</div>
                                                <div>date:</div>
                                                <div>subject:</div>
                                                <div>mailed-by:</div>
                                                <div>security:</div>
                                            </div>
                                            {/* Right Column */}
                                            <div className="flex flex-col">
                                                <div>
                                                    <strong>{selectedMail?.from_email && formatEmail(Security.DecryptFromString(selectedMail?.from_email))}</strong>

                                                </div>
                                                <div>{selectedMail?.receipient}</div>
                                                <div>{moment(selectedMail?.timestamp).format("lll")}</div>
                                                <div>{selectedMail?.subject}</div>
                                                <div>{selectedMail?.receipient?.split("@")[1]}</div>
                                                <div className="flex items-center gap-1">
                                                    <Lock size={10} />
                                                    Standard encryption (TLS)
                                                </div>
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
                            <Button variant="ghost" size="icon" disabled={!selectedMail}>
                                <Forward className="h-4 w-4" />
                                <span className="sr-only">Forward</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Forward</TooltipContent>
                    </Tooltip>


                    <AlertDialog>
                        <AlertDialogTrigger
                            className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" })
                            )}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Trash2 className={cn("h-4 w-4")} />
                                        <span className="sr-only">Trash</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Add to Trash</TooltipContent>
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
                                >
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <MailDropdown>
                        <Button variant="ghost" size="icon" disabled={!selectedMail}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                        </Button>
                    </MailDropdown>


                </div>
            </div>

        </Fragment>
    )
}

export default ClientDisplay