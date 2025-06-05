"use client";
import {
    ChevronDown,
    ChevronLeft,
    Forward,
    Lock,
    MoreVertical,
    Reply,
    Star,
    Trash2,
} from "lucide-react";

import {
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useEffect, useMemo, useRef } from "react";
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

import { MailDisplaySkeleton } from "./mail-skeleton";
import { useMailStore } from "@/store/mails";
import { airsendDB } from "@/db";
import { useAppSelector } from "@/store/hooks";
import { MailDropdown } from "./menu-dropdown";
import { SendMail } from "@/components/server-actions/send-mail";

export const MailDisplay = ({ folder, message_id }: { folder: string, message_id: string }) => {
    const router = useRouter();
    const currAccount = useAppSelector(state => state.accounts.currAccount)

    const replyTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const { selectedMail, setSelectedMail, setLoading } = useMailStore()

    const fetchMailBodyFromCache = async () => {

        await airsendDB.getItemByKey("mails", message_id as string).then((item) => {
            if (!item) {
                setLoading(true)
                fetchMailBody()
                return;
            }
            if (item.synced) {
                setLoading(false)
                setSelectedMail(item as any)
                return;
            }
        })

    }
    const fetchMailBody = async () => {
        try {
            const { data } = await API.getSingleMailData(message_id) as AxiosResponse<ApiResponse<MailData>>
            if (!data.success) {
                throw new Error(data.message)
            }
            await airsendDB.updateItem("mails", message_id as string, data.result)

            setSelectedMail(data.result)
            setLoading(false)

        } catch (error) {

        }
    }
    const handleReplySendBtn = async () => {
        const options = {
            from: currAccount?.email,
            to: selectedMail?.from,
            subject: `Re: ${selectedMail?.title}`,
            body: `
            ${replyTextAreaRef.current?.value}
            --------------------------------------------
            ${selectedMail?.content}
            
            `,
            inReplyTo: selectedMail?.uid
        }
        try {
            const data = await SendMail({  
                ...options,
             });

            if (!data.success) {
                throw new Error(data.message)
            }
           

        } catch (error: any) {

           
        }
    }
    const handleReplyBtnClicked = () => {
        if (!replyTextAreaRef.current || !selectedMail) return;
        replyTextAreaRef.current.focus();

    };
    useEffect(() => {
        if (!selectedMail) {
            fetchMailBody()
        }
        else {
            fetchMailBodyFromCache()
        }
    }, [])

    if (!selectedMail) return <MailDisplaySkeleton />

    return (
        <div
            className="flex-1 md:flex-none flex flex-col overflow-auto"
            style={{ height: "calc(100dvh - 80px)" }}
        >
            <div className="flex ml-1 items-center gap-4">
                <Button size={"icon"} variant={"ghost"} className='bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full'
                    onClick={() => router.back()}
                >
                    <ChevronLeft />
                </Button>
                <h2 className="pl-4 text-2xl font-bold p-4">{selectedMail?.subject}</h2>
                {/* {selectedMail?.timestamp} */}

            </div>
            <Separator className="my-2" />
            <div className="flex flex-col lg:flex-row justify-between items-start md:px-4 pb-2 md:pl-1">
                <div className="flex items-center text-sm flex-1 md:gap-2">
                    <Avatar>
                        <AvatarImage alt={formatEmail(selectedMail?.from.toLocaleUpperCase())} />
                        <AvatarFallback className='flex items-center justify-center h-10 w-10 bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full'>
                            {selectedMail?.from && formatEmail(selectedMail?.from)
                                .split(" ")
                                .map((chunk) => chunk[0])
                                .join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ml-2 md:ml-0">
                        <div className="flex flex-col sm:flex-row gap-2 align-text-bottom">
                            <div className="font-semibold">{selectedMail?.from && formatEmail(selectedMail?.from)}</div>
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
                                                    <strong>{selectedMail?.from && formatEmail(selectedMail?.from)}</strong>

                                                </div>
                                                <div>{selectedMail?.to}</div>
                                                <div>{moment(selectedMail?.timestamp).format("lll")}</div>
                                                <div>{selectedMail?.subject}</div>
                                                <div>{selectedMail?.to}</div>
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
                                onClick={handleReplyBtnClicked}
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

            <ScrollArea className="flex-1 flex flex-col overflow-auto border-t border-gray-300 dark:border-gray-800">
                {Array.isArray(selectedMail?.hasAttachment) && selectedMail?.hasAttachment.length > 0 && (<FileAttachment attachments={selectedMail?.hasAttachment} messageId={selectedMail?.message_id} />)}
                <MailIframe html={selectedMail?.html || selectedMail?.content} senderEmail={selectedMail?.from} />
                <Separator className="mt-auto" />
                <div className="">
                    <form>
                        <div className="grid gap-4">
                            <Textarea
                                ref={replyTextAreaRef}
                                className="p-4"
                                placeholder={`Reply ${selectedMail?.to}...`}
                            />
                            <div className="flex items-center">
                                <Button
                                    onClick={handleReplySendBtn}
                                    size="sm"
                                    className="ml-auto"
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </ScrollArea>
        </div>
    )

}
