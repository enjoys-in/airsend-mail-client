"use client";
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
import { Fragment, useEffect, useMemo, useRef } from "react";
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
import { Security } from "@/lib/security";

export const MailDisplay = ({ folder, message_id, children }: { folder: string, message_id: string, children: React.ReactNode }) => {
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
            if (item.is_read) {
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
            // await airsendDB.updateItem("mails", message_id as string, data.result)

            // setSelectedMail(data.result)
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


    return (
        <Fragment>
            <Separator />
            <ScrollArea className="flex-1 flex flex-col overflow-auto border-t border-gray-300 dark:border-gray-800">
                {/* {Array.isArray(selectedMail?.hasAttachment) && selectedMail?.hasAttachment.length > 0 && 
                (<FileAttachment attachments={selectedMail?.hasAttachment} messageId={selectedMail?.message_id} />

                )} */}
                {selectedMail && children}

            </ScrollArea>
            <Separator className="mt-auto" />
            <div className="">
                <form>
                    <div className="grid gap-4">
                        <Textarea
                            ref={replyTextAreaRef}
                            className="p-4"
                            placeholder={`Reply ${selectedMail?.from_email && "to " + Security.DecryptFromString(selectedMail?.from_email!)}...`}
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
        </Fragment>
    )

}
