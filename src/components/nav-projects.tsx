"use client"

import { type LucideIcon } from "lucide-react"


import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Separator } from "./ui/separator"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {

const path = usePathname()
  return (
    <SidebarGroup className="rounded-none">
      <SidebarMenu className="rounded-none">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name} >
            <SidebarMenuButton asChild className={path === item.url ? "dark:bg-[#ff5aa7] bg-[#5a61ff] hover:bg-[#5a61ff] text-sidebar-accent-foreground rounded-none text-gray-200 dark:text-gray-50 hover:text-gray-200 dark:hover:text-gray-100" : "rounded-none"}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <Separator />
        <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <span>Sponsor Us</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
