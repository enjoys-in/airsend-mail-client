"use client";

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
    const [syncingPath, setSyncingPath] = useState<string | null>(null);
    const all_mailbox = useMailStore((state) => state.all_mailbox);
    const selected_mailbox = useMailStore((state) => state.selected_mailbox);
    const setSelectedMailbox = useMailStore((state) => state.setSelectedMailbox);
    const setAllMailbox = useMailStore((state) => state.setAllMailbox);
    const setError = useMailStore((state) => state.setError);
    const setAllFolders = useMailStore((state) => state.setAllFolders);
    const setAllLabels = useMailStore((state) => state.setAllLabels);
    const { listen } = useCustomEvent(CustomEventKey.SyncMailCounts);

    const pathname = usePathname();
    const router = useRouter();

    const fetchMailboxData = useCallback(async (current_mailbox: string) => {
        try {
            const { data } = await API.getMailboxUnReadCount(current_mailbox);
            if (!data.success) return;

            const counts = {
                total_count: data?.result?.total_count,
                unread_count: data?.result?.unread_count,
                read_count: data?.result?.read_count,
            };

            // Update Dexie cache
            await db.mailboxes
                .where("path")
                .equals(current_mailbox)
                .modify(counts);

            // Read latest all_mailbox from store to avoid stale closure
            const latestMailbox = useMailStore.getState().all_mailbox;

            // Update Zustand state so UI reflects the change
            setAllMailbox(
                latestMailbox.map((m) =>
                    m.path === current_mailbox ? { ...m, ...counts } : m
                ) as any
            );
        } catch (error) {
            console.log(error);
        }
    }, [setAllMailbox]);
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
            <nav className="flex flex-col gap-0.5 px-2">
                {all_mailbox?.map((folder) => {
                    const isSelected = selected_mailbox === folder?.path || pathname.includes(folder?.path?.toLowerCase());
                    const isHovered = hoveredPath === folder?.path;
                    const hasUnread = folder.unread_count > 0;

                    return (
                        <div
                            onClick={() => {
                                setSelectedMailbox(folder.path.toLowerCase());
                                router.push(`/v2/u/mail/${folder.path.toLowerCase()}`);
                            }}
                            key={folder?.title}
                            className={cn(
                                "group flex items-center justify-between h-8 px-2 rounded-lg cursor-pointer",
                                "transition-colors duration-150 ease-out",
                                isSelected
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                            onMouseEnter={() => setHoveredPath(folder?.path)}
                            onMouseLeave={() => setHoveredPath(null)}
                        >
                            <Link
                                prefetch
                                href={`/v2/u/mail/${folder.path.toLowerCase()}`}
                                className="flex items-center gap-2 min-w-0 flex-1"
                            >
                                <MailBoxIcon name={folder?.path} key={folder?.path} />
                                <span className="text-[13px] truncate">
                                    {sentenceCase(folder?.title)}
                                </span>
                            </Link>

                            <div className="flex items-center gap-1">
                                {isHovered && (
                                    <button
                                        className="text-muted-foreground/50 hover:text-foreground p-0.5 rounded transition-colors duration-150"
                                        disabled={syncingPath === folder?.path}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSyncingPath(folder?.path);
                                            await fetchMailboxData(folder?.path);
                                            setSyncingPath(null);
                                        }}
                                    >
                                        <RefreshCcw size={12} className={syncingPath === folder?.path ? "animate-spin" : ""} />
                                    </button>
                                )}
                                {folder?.total_count > 0 && (
                                    <span className={cn(
                                        "text-[11px] tabular-nums min-w-[1.25rem] text-center",
                                        hasUnread ? "text-foreground font-semibold" : "text-muted-foreground/50"
                                    )}>
                                        {folder.total_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </Suspense>
    );
}

function SkeletonMenuItem() {
    return (
        <div className="flex flex-col gap-1 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between h-8 px-2 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                        <div className="w-16 h-3 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="w-4 h-3 rounded bg-muted animate-pulse" />
                </div>
            ))}
        </div>
    );
}
