"use client";
import React, { ReactNode, } from "react";
import { cn } from "@/lib/utils";
import BottomMenu from "@/components/BottomMenu";
import { useRouter, useSearchParams } from "next/navigation";
import RootTab from "@/components/RootTab";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarTab } from "@/store/slices/layout";
import { PREFERENCE_LINKS } from "@/constants/links";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import Topbar from "./topbar";
export const MobileLayout = ({ children }: { children: ReactNode }) => {
    const foo = useSearchParams();
    const mailId = foo.get("id");
    const sidebarTab = useAppSelector((state) => state.layout.sidebarTab);
    const currAcc = useAppSelector((state) => state.accounts.currAccount);
    const dispatch = useAppDispatch();
    const router = useRouter();
    return (
        <div className="flex flex-col h-[99dvh] w-screen">
            <div className={cn("flex flex-row items-center p-2",)}>
                <Topbar />
            </div>

            {/* <div className="flex md:hidden mx-10 flex-col justify-center">
                {
                    currAcc?.role === "USER" && <RootTab<"Mailbox" | "Workspace">
                        activeTab={sidebarTab}
                        changeTab={(newTab) => {
                            dispatch(setSidebarTab(newTab));
                            router.push(newTab === "Mailbox" ? "/u" : "/u/workspace/" + currAcc?.tenant_name);
                        }}
                        leftLabel="Mailbox"
                        rightLabel="Workspace"
                    />
                }

                <div className="flex justify-start">
                    {sidebarTab === "Workspace" && (
                        <Select defaultValue="/workspace" onValueChange={(newVal) => router.push(newVal)} >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {[
                                        PREFERENCE_LINKS.map((link) => (
                                            <SelectItem key={link.title} value={link.href.replace("username", currAcc!.tenant_name)}>
                                                {link.title}
                                            </SelectItem>
                                        )),
                                    ]}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div> */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="h-[calc(100vh-65px)]">{children}</ScrollArea>
            </main>
            {currAcc?.role === "USER" && <footer className={cn("h-[75px] ", mailId && "hidden")}>
                <BottomMenu />
            </footer>
            }

        </div>
    );
};