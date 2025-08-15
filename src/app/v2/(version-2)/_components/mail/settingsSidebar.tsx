
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
            Airsend Mail Client 1.0.1.2
          </small>
        </div>
      </SidebarFooter>
    </Sidebar>

  )
}
