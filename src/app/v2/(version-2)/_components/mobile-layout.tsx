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
import MobileNavigation from "./MobileNavigation";

export const MobileLayoutV2 = ({ children }: { children: ReactNode }) => {
    const foo = useSearchParams();
    const mailId = foo.get("id");
    const sidebarTab = useAppSelector((state) => state.layout.sidebarTab);
    const currAccName = useAppSelector((state) => state.accounts.currAccount?.name);
    const dispatch = useAppDispatch();
    const router = useRouter();
    return (
        <div className="flex flex-col  w-screen">
            <div className={cn("flex flex-row items-center p-2",)}>

            </div>
            <main className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="h-[calc(100vh-65px)]">{children}</ScrollArea>
            </main>
            <footer className={cn(" ", mailId && "hidden")}>
                <MobileNavigation />
            </footer>
        </div>
    );
};