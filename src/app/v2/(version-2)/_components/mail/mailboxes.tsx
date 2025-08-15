import { Plus } from "lucide-react"
import SidbarTabs from "./SidbarTabs"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,

  SidebarGroup,

  SidebarGroupContent,

  SidebarHeader,
} from "@/components/ui/sidebar"

import SidebarCollections from "./SidebarCollections"
import QuotaComponent from "./QuotaComponent"
import ShowMeetings from "./ShowMeetings"
import { AccountSwitcherV2 } from "./AccountSwitcher"

import { ComposeEmailDrawerSheet } from "@/components/compose-email-sheet-dialog"
import Link from "next/link"

export function Mailboxes() {

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex ">
      <SidebarHeader className="gap-1 border-b my-1 p-0">
        <AccountSwitcherV2 />
        <Separator />
        <SidbarTabs />
      </SidebarHeader>
      <SidebarContent>

        <SidebarGroup >
          <SidebarGroupContent>
            <SidebarCollections text="Folder" />
            <Separator />
            <SidebarCollections text="Lables" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="flex flex-row items-center w-full p-2">
        <Link prefetch href="/v2/u/compose"
          className="flex items-center  justify-center gap-2 w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Mail</span>
        </Link>
      </div>
      <SidebarFooter className="border-t">
        <QuotaComponent />
        <Separator />
        <ShowMeetings />
      </SidebarFooter>
    </Sidebar>
  )
}


