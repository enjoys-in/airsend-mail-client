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
import MultiTabSystem from "./composeMail"
import { useMailStore } from "@/store/mails"

export function Mailboxes() {
  const { all_folders, all_labels } = useMailStore()

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
            <SidebarCollections text="Folder" list={all_folders||[]} />
            <Separator />
            <SidebarCollections text="Lables" list={all_labels||[]} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="flex flex-row items-center w-full p-2">
        <MultiTabSystem />
      </div>
      <SidebarFooter className="border-t">
        <QuotaComponent />
        <Separator />
        <ShowMeetings />
      </SidebarFooter>
    </Sidebar>
  )
}


