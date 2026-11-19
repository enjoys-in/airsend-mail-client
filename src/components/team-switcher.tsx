"use client"
import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"

/** Logo at the top of the h-panel sidebar: the wordmark when open, the icon when collapsed. */
export function SideBarToggleButton() {
  const { open } = useSidebar()
  const dark = open ? "/navbar-logo.png" : "/favicon.png"
  const light = open ? "/navbar-logo-light.png" : "/favicon.png"
  const size = open ? "h-7 w-auto" : "h-6 w-6"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg" className="h-12 px-2 hover:bg-transparent">
          <Link href="/h-panel" aria-label="AirSend admin home">
            <Image className={`logo hidden dark:block ${size}`} src={dark} alt="AirSend" width={512} height={512} priority />
            <Image className={`logo dark:hidden ${size}`} src={light} alt="AirSend" width={512} height={512} priority />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
