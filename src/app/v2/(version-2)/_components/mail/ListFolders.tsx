"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";

import Badge from "@/components/common/badges";
import { RefreshCcw } from "lucide-react";

import { useMailStore } from "@/store/mails";
import { sentenceCase } from "change-case";
import { MailBoxIcon } from "./MailboxIcons";

import { API } from "@/lib/api/handler";
import { airsendDB, db } from "@/db";
import { usePathname, useRouter } from "next/navigation";
import { MailLablesType } from "@/lib/types/MailBoxListResponse.interface";
import { CustomEventKey, useCustomEvent } from "@/hooks/use-custom-event";

export function ListFolders() {
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const {
        all_mailbox,
        selected_mailbox,
        setSelectedMailbox,
        setAllMailbox,
        setError,
        setAllFolders,
        setAllLabels,
    } = useMailStore();
    const { listen } = useCustomEvent(CustomEventKey.SyncMailCounts);

    const pathname = usePathname();
    const router = useRouter();

    const fetchMailboxData = useCallback(async (current_mailbox: string) => {
        try {
            // sync with db as well
            const { data } = await API.getMailboxUnReadCount(current_mailbox);
            if (!data.success) return;

            await db.mailboxes
                .where("path")
                .equals(current_mailbox)
                .modify({
                    total_count: data?.result?.total_count,
                    unread_count: data?.result?.unread_count,
                    read_count: data?.result?.read_count,
                });
        } catch (error) {
            console.log(error);
        }
    }, []);
    const syncMailboxAndLables = async () => {
        try {
            const { data } = await API.fetchUserFolderLabels(MailLablesType.ALL);
            if (!data.success) return;
            setAllMailbox(
                data?.result.filter(
                    (item: any) => item.type === MailLablesType.MAILBOX
                ) as any[]
            );
            setAllLabels(
                data?.result.filter(
                    (item: any) => item.type === MailLablesType.LABEL
                ) as any[]
            );
            setAllFolders(
                data?.result.filter(
                    (item: any) => item.type === MailLablesType.FOLDER
                ) as any[]
            );
            await airsendDB.bulkPutItems("mailboxes", data.result as any);
        } catch (error) { }
    };
    useEffect(() => {
        airsendDB.getAllItems("mailboxes").then((data) => {
            if (data.length === 0) {
                syncMailboxAndLables();
            }

            setAllMailbox(
                data?.filter(
                    (item: any) => item.type === MailLablesType.MAILBOX
                ) as any[]
            );
            setAllLabels(
                data?.filter((item: any) => item.type === MailLablesType.LABEL) as any[]
            );
            setAllFolders(
                data?.filter(
                    (item: any) => item.type === MailLablesType.FOLDER
                ) as any[]
            );
        });

        const unsubscribe = listen(fetchMailboxData);
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <Suspense fallback={<SkeletonMenuItem />}>
            {all_mailbox?.map((folder) => {
                const isSelected = selected_mailbox === folder?.path;
                const isHovered = hoveredPath === folder?.path;

                return (
                    <div
                        onClick={() => {
                            setSelectedMailbox(folder.path.toLowerCase());
                            router.push(`/v2/u/mail/${folder.path.toLowerCase()}`);
                        }}
                        key={folder?.title}
                        className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "flex justify-between items-center px-2  group rounded-none cursor-pointer",
                            isSelected || pathname.includes(folder?.path?.toLowerCase())
                                ? "dark:bg-[#5a61ff22]"
                                : "bg-neutral-800"
                        )}
                        onMouseEnter={() => setHoveredPath(folder?.path)}
                        onMouseLeave={() => setHoveredPath(null)}
                    >
                        <Link
                            prefetch
                            href={`/v2/u/mail/${folder.path.toLowerCase()}`}
                            className="flex items-center w-40 gap-2"
                        >
                            <MailBoxIcon name={folder?.path} key={folder?.path} />
                            <div className="w-full flex items-center justify-between">
                                <span
                                    className={cn(
                                        "text-sm truncate",
                                        isSelected
                                            ? "dark:text-[#5a61ff] font-bold"
                                            : "dark:text-zinc-300"
                                    )}
                                >
                                    {sentenceCase(folder?.title)}
                                </span>

                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            {isHovered && (
                                <span
                                    className="pointer-events-auto text-muted-foreground text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        fetchMailboxData(folder?.path);
                                    }}
                                >
                                    <RefreshCcw size={14} />
                                </span>
                            )}
                            {/* <Badge
                                    text={String(folder?.unread_count)}
                                    variant="blue"
                                    className="w-6 h-6 flex items-center justify-center text-xs font-bold"
                                /> */}
                            <span className={`ml-auto text-gray-400 text-xs ${folder.unread_count > folder.read_count ? "font-bold" : ""}`}>
                                {" "}
                                {String(folder?.total_count)}
                            </span>
                        </div>
                    </div>
                );
            })}
        </Suspense>
    );
}

function SkeletonMenuItem() {
    return (
        <div
            className={`flex items-center justify-between p-2 rounded  "bg-gray-800"`}
        >
            <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 bg-gray-700 rounded-full animate-pulse" />
        </div>
    );
}
