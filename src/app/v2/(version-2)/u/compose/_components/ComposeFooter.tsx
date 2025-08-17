import React, { useState } from "react";
import { Pen, Eye, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { airsendDB } from "@/db";
import { useAppSelector } from "@/store/hooks";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useHtmlEditor } from "./plain-editor/htmlEditor";
import AiPromptButton from "./plain-editor/aiPromptButton";
import { SendMail } from "@/components/server-actions/send-mail";
import { toast } from "sonner";
import { fileToArrayBuffer } from '@/lib/utils';
import axios, { AxiosError } from "axios";
import { useMultiTabStore } from "@/store/settings/multiTabSystem";
import { API } from "@/lib/api/handler";
interface EmailData {
    from: string;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    html: string;
    attachments: File[];
}
const ComposeFooter: React.FC<{ data: EmailData }> = ({ data }) => {
    const { getHTML, setHTML, attachments } = useHtmlEditor();
    const { currAccount } = useAppSelector((state) => state.accounts);
    const { focusedTab, closeTab } = useMultiTabStore()
    const [signatures, setSignatures] = useState<any[]>([]);

    const fetchSignatures = async () => {
        if (!currAccount?.email) return;
        const { success, value } = await airsendDB.getNestedItem(
            "settings",
            currAccount.email as string,
            "settings.signatures"
        );
        if (success && value) setSignatures(value);
    };
    const handleInsertSignature = (signature: string) => {
        const newHTML = getHTML() + signature;
        setHTML(newHTML);
    };
    const handleSend = async () => {
        try {
            const newHTML = getHTML();
            const formData = new FormData();


            const newObjct = Object.assign({}, data, {
                html: newHTML,
                subject: data.subject === "" ? "no subject" : data.subject,

            });
            if (newObjct.subject === "no subject") {

                // show toast notification when an event is added
            }
            formData.append("payload", JSON.stringify(newObjct));
            formData.append("settings", JSON.stringify(
                {
                    is_scheduled: false,
                    tracking_enabled: false,
                }
            ));
            // Convert attachments to ArrayBuffer/Blob
            const userAttachments = await Promise.all(
                attachments.map(async (attachment) => {
                    const arrayBuffer = await attachment.file.arrayBuffer();
                    return new Blob([arrayBuffer], { type: attachment.file.type });
                })
            );
            userAttachments.forEach((blob, index) => {
                formData.append("attachments[]", blob, attachments[index].file.name);
            });

            const res = await API.sendMailOG(formData)

            if (!res.data?.success) {

                throw new Error(res.data?.message);

            }

            toast.success("Email sent successfully");
            closeTab(focusedTab)
        } catch (error: any) {

            if (error instanceof AxiosError && error.response?.data.message === "Validation Error") {
                error?.response?.data.result.forEach((message: string) => {
                    toast.error(message);
                });
                return;
            }
            toast.error(error.message);
        }
    };
    React.useLayoutEffect(() => {
        if (signatures.length === 0) fetchSignatures();
    }, [currAccount?.email]);

    return (
        <div className="sticky top-0 bottom-0 z-10  w-full border-t border-border bg-white dark:bg-neutral-900 px-3  flex items-center justify-between">
            <div className="w-full">
                <AiPromptButton />
            </div>

            <div className="flex items-center gap-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" title="Signatures">
                            <Pen size={18} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="w-72">
                        <h4 className="text-sm font-medium mb-2">Signatures</h4>
                        {signatures.length > 0 ? (
                            <div className="space-y-2">
                                {signatures.map((signature, index) => (
                                    <div
                                        onClick={() => handleInsertSignature(signature)}
                                        key={index}
                                        className="p-2 rounded-md hover:bg-accent cursor-pointer text-sm"
                                    >
                                        {signature}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No signatures found
                            </p>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* RIGHT: Send Button with dropdown */}
            <DropdownMenu>
                <div className="inline-flex items-center rounded-none overflow-hidden border border-gray-300 dark:border-neutral-700">
                    <div className="w-8 h-full bg-gray-800 dark:bg-neutral-700" />
                    <div className="flex -space-x-px">
                        <Button
                            type="button"
                            variant={"ghost"}
                            onClick={handleSend}
                            className="inline-flex items-center justify-center gap-2 rounded-none text-sm font-medium h-9 px-4 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                        >
                            Send Now
                        </Button>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={"ghost"}
                                className="inline-flex items-center justify-center gap-2 rounded-none text-sm font-medium h-9 px-3 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                            >
                                <ChevronDown size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                    </div>
                </div>

                <DropdownMenuContent className="w-48">
                    <DropdownMenuItem className="flex items-center gap-2">
                        <Eye size={16} />
                        Preview Email
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                        <Clock size={16} />
                        Schedule Email
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ComposeFooter;
