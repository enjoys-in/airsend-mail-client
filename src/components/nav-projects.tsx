"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

/** Secondary links (API keys, docs, source): a quiet "Resources" group under the main navigation. */
export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const path = usePathname() ?? ""

  return (
    <SidebarGroup className="px-2">
      <SidebarGroupLabel className="h-7 px-2 text-xs font-normal text-muted-foreground">Resources</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {projects.map((item) => {
          const external = /^https?:\/\//.test(item.url)
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                isActive={!external && path === item.url}
                className="h-9 gap-2.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:font-medium data-[active=true]:text-foreground"
              >
                <Link href={item.url} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuButton className="h-9 gap-2.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <span>Sponsor us</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
