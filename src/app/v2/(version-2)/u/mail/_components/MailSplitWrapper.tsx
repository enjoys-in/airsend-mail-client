"use client"

import React, { Suspense, useMemo } from "react"
import { useParams } from "next/navigation"
import { useSettingsStore } from "@/store/settings"
import ClientMailCard from "../[folder]/_components/ClientMailCard"
import { Mail } from "lucide-react"

export function MailSplitWrapper({ children }: { children: React.ReactNode }) {
    const params = useParams()
    const hasMessageId = Boolean(params?.message_id)

    const inboxLayout = useSettingsStore((s) => (s.settings?.personalization?.layout === "list" ? "row" : "column"))
        || (typeof window !== "undefined" ? (localStorage.getItem("airsend_inbox_layout") as "column" | "row") : null)
        || "column"

    const isColumnSplit = inboxLayout === "column"

    if (!isColumnSplit) {
        // Row View: standard 100% full-width view
        return <div className="w-full flex-1 min-w-0">{children}</div>
    }

    // Column Split View:
    // When on [folder] (no message_id in URL):
    // Left pane is {children} (ClientMailCard), Right pane is Empty Reading Pane on desktop
    if (!hasMessageId) {
        return (
            <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden">
                <div className="w-full md:w-[380px] lg:w-[440px] xl:w-[480px] shrink-0 md:border-r border-border/50 h-full overflow-y-auto no-scrollbar">
                    {children}
                </div>
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/5 select-none border-t border-border/30">
                    <div className="size-16 rounded-3xl bg-muted/60 border border-border/60 flex items-center justify-center mb-4 text-muted-foreground/40 shadow-2xs">
                        <Mail className="size-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                        Select an email to read
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
                        Choose a conversation from the list on the left to view its contents, attachments, and reply.
                    </p>
                </div>
            </div>
        )
    }

    // When on [folder]/[message_id]:
    // Left pane is ClientMailCard on desktop, Right pane is {children} (the message detail)
    return (
        <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden">
            <div className="hidden md:block md:w-[380px] lg:w-[440px] xl:w-[480px] shrink-0 md:border-r border-border/50 h-full overflow-y-auto no-scrollbar">
                <Suspense fallback={null}>
                    <ClientMailCard />
                </Suspense>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-y-auto min-w-0">
                {children}
            </div>
        </div>
    )
}

export default MailSplitWrapper
