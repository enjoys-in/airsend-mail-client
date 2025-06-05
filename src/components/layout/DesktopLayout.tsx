import React, { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import LeftSidebar from "@/components/layout/left-sidebar";
import Topbar from "@/components/layout/topbar";
import RightSideBar from "@/components/layout/right-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DesktopLayout = ({ children }: { children: ReactNode}) => {
    return (
        <React.Fragment>
            <LeftSidebar />
            <Separator orientation="vertical" className="h-screen" />
            <div className="flex-1 h-[100dvh] flex flex-col">
                <Topbar />
                <div className="hidden md:flex flex-row flex-1">
                    <main className="flex-1">
                        <ScrollArea className="h-[calc(100vh-65px)]">{children}</ScrollArea>
                    </main>
                    <RightSideBar />
                </div>
            </div>
        </React.Fragment>
    );
};