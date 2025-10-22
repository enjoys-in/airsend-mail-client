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
    useSidebar,
} from "@/components/ui/sidebar"

import { FavIcon } from "@/components/logo-image"
import Link from "next/link"
import { NavUserV2 } from "./mail/nav-user"
import { Mailboxes } from "./mail/mailboxes"
import { usePathname } from "next/navigation"
import { StackIcon } from "@radix-ui/react-icons"
import SidebarCalendar from "../(home)/calender/_components/sidebar-calendar"
import ChannelList from "../(home)/workspace/_components/ChannelList"
import { SettingsMenuSidebar } from "./mail/settingsSidebar"

// This is sample data
const navMain = [
    {
        title: "Mailbox",
        url: "/v2/u/mail/",
        icon: Inbox,
        isActive: true,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
        isActive: false,
    },
    {
        title: "Files",
        url: "#",
        icon: File,
        isActive: false,
    },
    {
        title: "Chats",
        url: "#",
        icon: Send,
        isActive: false,
    },
    {
        title: "Workspace",
        url: "#",
        icon: StackIcon,
        isActive: false,
    },
    {
        title: "Teams",
        url: "#",
        icon: ArchiveX,
        isActive: false,
    },
    {
        title: "Activity",
        url: "#",
        icon: Activity,
        isActive: false,
    },

]
export function AppSidebarV2({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const pathname = usePathname()

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
            {...props}
        >
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <Link href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <FavIcon />
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu>
                        {navMain.map((item) => (
                            <Link key={item.title} href={item.url}>
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={{
                                            children: item.title,
                                            hidden: false,
                                        }}

                                        className="px-2.5 md:px-2"
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </Link>
                        ))}
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <Link href="/v2/u/settings">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ">
                                        <Settings />
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
                <SidebarFooter>
                    <NavUserV2 />
                </SidebarFooter>
            </Sidebar>
            {pathname.includes("/v2/u/settings") && <SettingsMenuSidebar />}
            {(pathname.includes("/v2/u/mail") || pathname.includes("/v2/u/compose")) && <Mailboxes />}
            {(pathname === "/v2/calender") && <SidebarCalendar />}
            {/* {  ( pathname === "/v2/teams") &&  <ChannelList />     } */}
            {(pathname === "/v2/workspace") && <ChannelList />}
            {(pathname === "/v2/chats") && <ChannelList />}
            {(pathname === "/v2/files") && <ChannelList />}
            {(pathname === "/v2/settings") && <ChannelList />}

        </Sidebar>
    )
}
