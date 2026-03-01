import React from "react"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInput,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import BreadcrumbInfo from "./breadcrumb"
import Link from "next/link";

/** Icon button used in the header toolbar  */
const HeaderIconBtn = React.memo(({ children, tooltip, href }: {
    children: React.ReactNode; tooltip: string; href?: string
}) => {
    const inner = (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
        >
            {children}
        </Button>
    )
    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                {href ? <Link href={href}>{inner}</Link> : inner}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
        </Tooltip>
    )
})
HeaderIconBtn.displayName = "HeaderIconBtn"

export const HeaderV2 = React.memo(() => {
    return (
        <header className="flex h-12 shrink-0 items-center gap-2 sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-11">
            <div className="flex items-center justify-between w-full px-4">
                {/* Left: trigger + breadcrumb */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1 h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150" />
                    <Separator orientation="vertical" className="mr-2 h-4 bg-border/40" />
                    <BreadcrumbInfo />
                </div>

                {/* Center: search */}
                <div className="hidden md:flex items-center mx-auto w-full max-w-md">
                    <SidebarInput
                        placeholder="Search mail..."
                        className="h-8 rounded-lg bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-ring/30 placeholder:text-muted-foreground/50 text-sm"
                    />
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1">
                    <HeaderIconBtn tooltip="Settings" href="/v2/u/settings">
                        <Settings className="h-4 w-4" />
                    </HeaderIconBtn>
                    <Notifications />
                </div>
            </div>
        </header>
    )
})
HeaderV2.displayName = "HeaderV2"

const Notifications = React.memo(() => {
    return (
        <DropdownMenu>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1 right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Notifications</TooltipContent>
            </Tooltip>

            <DropdownMenuContent className="w-80 rounded-xl p-0 shadow-lg border-border/50" align="end" forceMount>
                <div className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                <ScrollArea className="h-64">
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground/60">No notifications yet</p>
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
Notifications.displayName = "Notifications"
