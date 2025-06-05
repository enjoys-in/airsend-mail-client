"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn, } from "@/lib/utils"

import Link from "next/link"
import { Suspense, useCallback, useEffect, useState } from "react"

import Badge from "@/components/common/badges"
import { RefreshCcw } from "lucide-react"

import { useMailStore } from "@/store/mails"
import { sentenceCase } from 'change-case'
import { MailBoxIcon } from "./MailboxIcons"
import { useCacheStorage } from "@/hooks/useCacheStorage"
import { API } from "@/lib/api/handler"
import { airsendDB } from "@/db"
import { usePathname } from "next/navigation"


export function ListFolders() {
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const { all_mailbox, selected_mailbox, setSelectedMailbox, setAllMailbox, setError } = useMailStore()
    const { addItem } = useCacheStorage()
    const pathname = usePathname()

    const fetchMailboxData = useCallback(async (current_mailbox: string) => {
        try {
            // sync with db as well
         
        } catch (error) {

        }
    }, [])

    return (
        <Suspense fallback={<SkeletonMenuItem />}>
            {all_mailbox.map((folder) => {
                const isSelected = selected_mailbox === folder.path;
                const isHovered = hoveredPath === folder.path;

                return (
                    <div
                        key={folder.name}
                        className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "flex justify-between items-center px-2  group rounded-none",
                            (isSelected || pathname.includes(folder.path.toLowerCase())) ? "dark:bg-[#5a61ff22]" : "bg-neutral-800"
                        )}

                        onMouseEnter={() => setHoveredPath(folder.path)}
                        onMouseLeave={() => setHoveredPath(null)}
                    >
                        <Link href={`${folder.path.toLowerCase()}`} onClick={() => setSelectedMailbox(folder.path.toLowerCase())} className="flex items-center gap-2">
                            <MailBoxIcon name={folder.name} key={folder.special_use} />
                            <span
                                className={cn(
                                    "text-sm truncate",
                                    isSelected ? "dark:text-[#5a61ff] font-bold" : "dark:text-zinc-300"
                                )}
                            >
                                {sentenceCase(folder.name)}
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {isHovered && (
                                <span
                                    className="pointer-events-auto text-muted-foreground text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        fetchMailboxData(folder.path);
                                    }}
                                >
                                    <RefreshCcw size={14} />
                                </span>

                            )}
                            <Badge text={String(folder.unseen_count)} variant="blue" className="w-6 h-6 flex items-center justify-center text-xs" />
                        </div>
                    </div>

                );
            })}
        </Suspense>
    );
}

function SkeletonMenuItem() {
    return (
        <div className={`flex items-center justify-between p-2 rounded  "bg-gray-800"`}>
            <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 bg-gray-700 rounded-full animate-pulse" />
        </div>
    )
}