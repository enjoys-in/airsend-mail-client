"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { SettingsMenu } from "./settingsMenu"

export function SettingsMenuSidebar() {
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-sidebar border-r border-border/40">
      <SidebarContent className="p-0 overflow-hidden">
        <SettingsMenu />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 bg-sidebar/50 backdrop-blur-xs py-2 px-3">
        <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground/70">
          <span className="font-medium tracking-tight">Airsend Mail v2.7</span>
          <span>&copy; {new Date().getFullYear()} Enjoys</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
