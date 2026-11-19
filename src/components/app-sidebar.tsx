import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { SideBarToggleButton } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MenuList } from "@/lib/data"

export function HPanelAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-border/70 px-2 py-0">
        <SideBarToggleButton />
      </SidebarHeader>
      <SidebarContent className="gap-2 py-1">
        <NavMain items={MenuList.navMain} />
        <NavProjects projects={MenuList.projects} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/70 p-2">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
