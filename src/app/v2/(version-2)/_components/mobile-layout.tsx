"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileNavigation from "./MobileNavigation";

export const MobileLayoutV2 = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const params = useSearchParams();
    const mailId = params.get("id");

    // Hide bottom nav when viewing a specific mail, channel conversation, or DM
    const isConversationView =
        !!mailId ||
        /\/workspace\/(c|dm)\//.test(pathname);

    return (
        <div className="flex flex-col w-screen h-svh">
            <main className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className={cn(
                    "h-[calc(100svh-3.5rem)]"
                )}>
                    {children}
                </ScrollArea>
            </main>
            <MobileNavigation />
        </div>
    );
};