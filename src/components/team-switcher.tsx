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

export function SideBarToggleButton() {
  const { open } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Link href={"/h-panel"}>
            <Image className="logo hidden dark:block data-[state=open]:hidden" src={open ? "/navbar-logo.png" : "/favicon.png"} alt="logo" width={512} height={512} />
            <Image className="logo dark:hidden data-[state=open]:hidden"src={open ? "/navbar-logo-light.png" : "/favicon.png"} 
              alt="logo" width={512} height={512} />


          </Link>

        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
