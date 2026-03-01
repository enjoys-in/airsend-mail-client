"use client"

import * as React from "react"
import { Activity, ArchiveX, Calendar, File, Inbox, Send, Settings } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,

    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

import { FavIcon } from "@/components/logo-image"
import Link from "next/link"
import { NavUserV2 } from "./mail/nav-user"
import { Mailboxes } from "./mail/mailboxes"
import { usePathname } from "next/navigation"
import { StackIcon } from "@radix-ui/react-icons"
import SidebarCalendar from "../(home)/calender/_components/sidebar-calendar"
import ChannelList from "../(home)/workspace/_components/ChannelList"
import WorkspaceSidebar from "../(home)/workspace/_components/WorkspaceSidebar"
import { SettingsMenuSidebar } from "./mail/settingsSidebar"
import { cn } from "@/lib/utils"
import { useFeatureAccess } from "@/hooks/use-feature-access"

type NavItem = {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    matchPath: string
    /** Optional feature-flag key — item hidden when the flag is false */
    featureKey?: "canAccessCalendar" | "canAccessWorkspace"
}

const navMain: NavItem[] = [
    {
        title: "Mailbox",
        url: "/v2/u/mail/",
        icon: Inbox,
        matchPath: "/v2/u/mail",
    },
    {
        title: "Calendar",
        url: "/v2/calender",
        icon: Calendar,
        matchPath: "/v2/calender",
        featureKey: "canAccessCalendar",
    },
    // {
    //     title: "Files",
    //     url: "/v2/files",
    //     icon: File,
    //     matchPath: "/v2/files",
    // },
    // {
    //     title: "Chats",
    //     url: "/v2/chats",
    //     icon: Send,
    //     matchPath: "/v2/chats",
    // },
    {
        title: "Workspace",
        url: "/v2/workspace",
        icon: StackIcon,
        matchPath: "/v2/workspace",
        featureKey: "canAccessWorkspace",
    },
    // {
    //     title: "Teams",
    //     url: "#",
    //     icon: ArchiveX,
    //     matchPath: "/v2/teams",
    // },
    // {
    //     title: "Activity",
    //     url: "#",
    //     icon: Activity,
    //     matchPath: "/v2/activity",
    // },
]

/** Icon rail nav item — isolated so hover/active state doesn't re-render siblings */
const NavIconItem = React.memo(({ item, isActive }: { item: NavItem; isActive: boolean }) => (
    <SidebarMenuItem>
        <Link href={item.url}>
            <SidebarMenuButton
                tooltip={{ children: item.title, hidden: false }}
                isActive={isActive}
                className={cn(
                    "px-2.5 md:px-2 transition-colors duration-150",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
            >
                <item.icon className="size-4" />
                <span>{item.title}</span>
            </SidebarMenuButton>
        </Link>
    </SidebarMenuItem>
))
NavIconItem.displayName = "NavIconItem"

/** Secondary content panel — renders based on current route */
const SidebarSecondaryPanel = React.memo(({ pathname }: { pathname: string }) => {
    if (pathname.includes("/v2/u/settings")) return <SettingsMenuSidebar />
    if (pathname.includes("/v2/u/mail") || pathname.includes("/v2/u/compose")) return <Mailboxes />
    if (pathname === "/v2/calender") return <SidebarCalendar />
    // Workspace nested sidebar — team switcher + channels + DMs
    if (pathname.startsWith("/v2/workspace")) return <WorkspaceSidebar />
    if (pathname === "/v2/chats" || pathname === "/v2/files") return <ChannelList />
    return null
})
SidebarSecondaryPanel.displayName = "SidebarSecondaryPanel"

export function AppSidebarV2({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { canAccessCalendar, canAccessWorkspace, isLoaded } = useFeatureAccess()

    /* Filter nav items based on feature flags (always show while loading) */
    const featureFlagMap = { canAccessCalendar, canAccessWorkspace } as const
    const visibleNav = React.useMemo(
        () => navMain.filter((item) => {
            if (!item.featureKey) return true
            if (!isLoaded) return true          // show everything until config loads
            return featureFlagMap[item.featureKey]
        }),
        [isLoaded, canAccessCalendar, canAccessWorkspace],
    )

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
            {...props}
        >
            {/* Icon rail */}
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r border-border/40"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <Link href="/v2/u/mail/inbox">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                                        <FavIcon />
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu>
                        {visibleNav.map((item) => (
                            <NavIconItem
                                key={item.title}
                                item={item}
                                isActive={pathname.includes(item.matchPath)}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenuItem>
                                <Link href="/v2/u/settings">
                                    <SidebarMenuButton
                                        tooltip={{ children: "Settings", hidden: false }}
                                        isActive={pathname.includes("/v2/u/settings")}
                                        className={cn(
                                            "px-2.5 md:px-2 transition-colors duration-150",
                                            pathname.includes("/v2/u/settings") && "bg-sidebar-accent text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <Settings className="size-4" />
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
                <SidebarFooter>
                    <NavUserV2 />
                </SidebarFooter>
            </Sidebar>

            {/* Secondary panel */}
            <SidebarSecondaryPanel pathname={pathname} />
        </Sidebar>
    )
}
