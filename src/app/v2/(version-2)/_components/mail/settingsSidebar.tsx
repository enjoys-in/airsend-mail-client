
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,

} from "@/components/ui/sidebar"

import { SettingsMenu } from "./settingsMenu"

export function SettingsMenuSidebar() {

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarContent className="p-0">
        <SettingsMenu />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex flex-row items-center mx-auto w-full p-2">
          <small>
            Airsend Mail Client 2.0.0
          </small>
          <small className="ml-auto text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Enjoys Inc.
          </small>
        </div>
      </SidebarFooter>
    </Sidebar>

  )
}
