"use client"

import * as React from "react"
import { Activity, ArchiveX, CalendarDays, File, Mail, Send, Settings, Layers, CheckSquare } from "lucide-react"

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
import SidebarCalendar from "../(home)/calender/_components/sidebar-calendar"
import ChannelList from "../(home)/workspace/_components/ChannelList"
import WorkspaceSidebar from "../(home)/workspace/_components/WorkspaceSidebar"
import { FilesSidebar } from "../(home)/files/_components/FilesSidebar"
import { TasksSidebar } from "./tasks-sidebar"
import { SettingsMenuSidebar } from "./mail/settingsSidebar"
import { cn } from "@/lib/utils"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { Skeleton } from "@/components/ui/skeleton"

type NavItem = {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    matchPath: string
    /** Optional feature-flag key — item hidden when the flag is false */
    featureKey?: "canAccessCalendar" | "canAccessWorkspace" | "canAccessTasks" | "canAccessFiles"
}

const navMain: NavItem[] = [
    {
        title: "Mailbox",
        url: "/v2/u/mail/",
        icon: Mail,
        matchPath: "/v2/u/mail",
    },
    {
        title: "Calendar",
        url: "/v2/calender",
        icon: CalendarDays,
        matchPath: "/v2/calender",
        featureKey: "canAccessCalendar",
    },
    {
        title: "Files",
        url: "/v2/files",
        icon: File,
        matchPath: "/v2/files",
        featureKey: "canAccessFiles",
    },
    // {
    //     title: "Chats",
    //     url: "/v2/chats",
    //     icon: Send,
    //     matchPath: "/v2/chats",
    // },
    {
        title: "Workspace",
        url: "/v2/workspace",
        icon: Layers,
        matchPath: "/v2/workspace",
        featureKey: "canAccessWorkspace",
    },
    {
        title: "Tasks",
        url: "/v2/tasks",
        icon: CheckSquare,
        matchPath: "/v2/tasks",
        featureKey: "canAccessTasks",
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
const NavIconItem = React.memo(({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const Icon = item.icon
    return (
        <SidebarMenuItem>
            <Link href={item.url}>
                <SidebarMenuButton
                    tooltip={{ children: item.title, hidden: false }}
                    isActive={isActive}
                    className={cn(
                        "px-2.5 md:px-2 transition-all duration-200 group/rail-btn",
                        isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs"
                            : "text-muted-foreground/80 hover:text-foreground hover:bg-sidebar-accent/50"
                    )}
                >
                    <Icon className={cn(
                        "!size-[18px] stroke-[1.8] transition-all duration-200 group-hover/rail-btn:scale-110",
                        isActive ? "stroke-[2.2] text-foreground" : "text-muted-foreground group-hover/rail-btn:text-foreground"
                    )} />
                    <span>{item.title}</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
    )
})
NavIconItem.displayName = "NavIconItem"

/** Skeleton placeholder for a nav icon while feature access loads */
const NavIconSkeleton = () => (
    <SidebarMenuItem>
        <SidebarMenuButton className="px-2.5 md:px-2" disabled>
            <Skeleton className="size-4 rounded" />
        </SidebarMenuButton>
    </SidebarMenuItem>
)

/** Secondary content panel — renders based on current route */
const SidebarSecondaryPanel = React.memo(({ pathname }: { pathname: string }) => {
    if (pathname.includes("/v2/u/settings")) return <SettingsMenuSidebar />
    if (pathname.includes("/v2/u/mail") || pathname.includes("/v2/u/compose")) return <Mailboxes />
    if (pathname === "/v2/calender") return <SidebarCalendar />
    // Workspace nested sidebar — team switcher + channels + DMs
    if (pathname.startsWith("/v2/workspace")) return <WorkspaceSidebar />
    // Kaneo (tasks) renders its sidebar content into this panel; see tasks-sidebar.tsx.
    if (pathname.startsWith("/v2/tasks")) return <TasksSidebar />
    if (pathname.startsWith("/v2/files")) return <FilesSidebar />
    if (pathname === "/v2/chats") return <ChannelList />
    return null
})
SidebarSecondaryPanel.displayName = "SidebarSecondaryPanel"

export function AppSidebarV2({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { canAccessCalendar, canAccessWorkspace, canAccessTasks, canAccessFiles, isLoaded } = useFeatureAccess()

    /* Filter nav items based on feature flags */
    const featureFlagMap = { canAccessCalendar, canAccessWorkspace, canAccessTasks, canAccessFiles } as const
    const visibleNav = React.useMemo(
        () => navMain.filter((item) => {
            if (!item.featureKey) return true
            if (!isLoaded) return false         // hide gated items until config loads
            return featureFlagMap[item.featureKey]
        }),
        [isLoaded, canAccessCalendar, canAccessWorkspace, canAccessTasks, canAccessFiles],
    )

    /* Count of feature-gated items to show as skeletons while loading */
    const gatedCount = navMain.filter((item) => item.featureKey).length
    const showSkeletons = !isLoaded

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
                        {showSkeletons && Array.from({ length: gatedCount }, (_, i) => (
                            <NavIconSkeleton key={`skel-${i}`} />
                        ))}
                    </SidebarMenu>
                </SidebarHeader>
                {/* Spacer: pushes the footer (settings + account) to the bottom of the rail. */}
                <SidebarContent />
                <SidebarRail />
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/v2/u/settings">
                                <SidebarMenuButton
                                    tooltip={{ children: "Settings", hidden: false }}
                                    isActive={pathname.includes("/v2/u/settings")}
                                    className={cn(
                                        "px-2.5 md:px-2 transition-all duration-200 group/settings-btn",
                                        pathname.includes("/v2/u/settings")
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs"
                                            : "text-muted-foreground/80 hover:text-foreground hover:bg-sidebar-accent/50"
                                    )}
                                >
                                    <Settings className={cn(
                                        "!size-[18px] stroke-[1.8] transition-all duration-300 group-hover/settings-btn:rotate-45 group-hover/settings-btn:scale-110",
                                        pathname.includes("/v2/u/settings") ? "stroke-[2.2] text-foreground" : "text-muted-foreground group-hover/settings-btn:text-foreground"
                                    )} />
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <NavUserV2 />
                </SidebarFooter>
            </Sidebar>

            {/* Secondary panel */}
            <SidebarSecondaryPanel pathname={pathname} />
        </Sidebar>
    )
}
