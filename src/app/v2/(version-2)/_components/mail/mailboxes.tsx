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
import { useFeatureAccess } from "@/hooks/use-feature-access"
import Link from "next/link"
import { APP_VERSION } from "@/constants/version"

export function Mailboxes() {
  const all_folders = useMailStore((state) => state.all_folders)
  const all_labels = useMailStore((state) => state.all_labels)
  const { canAccessCalendar } = useFeatureAccess()

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background">
      <SidebarHeader className="gap-0 border-b p-0">
        <AccountSwitcherV2 />
        <Separator className="bg-border/40" />
        <SidbarTabs />
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarCollections text="Folders" list={all_folders||[]} />
            <div className="mx-4 my-1">
              <Separator className="bg-border/30" />
            </div>
            <SidebarCollections text="Labels" list={all_labels||[]} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="flex items-center w-full p-2 border-t border-border/40">
        <MultiTabSystem />
      </div>
      <SidebarFooter className="border-t border-border/40 gap-1 py-2">
        <QuotaComponent />
        {canAccessCalendar && (
          <>
            <Separator className="bg-border/30" />
            <ShowMeetings />
          </>
        )}
        <Link
          href="/change-logs"
          title="See what's new"
          className="px-4 pt-1 text-[11px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          Airsend Web Client v{APP_VERSION}
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}


