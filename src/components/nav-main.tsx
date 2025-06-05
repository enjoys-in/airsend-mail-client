"use client"

import { ChevronRight, Receipt, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    enabled: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const path = usePathname()
  return (
    <SidebarGroup className="rounded-none">
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu className="rounded-none">
        {items.map((item) => item.enabled && (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link className="flex items-center justify-center gap-2" href={item.url}>
                  <SidebarMenuButton tooltip={item.title} className={path.includes(item.url) ? "dark:bg-[#ff5aa7] bg-[#5a61ff] hover:bg-[#5a61ff] text-sidebar-accent-foreground rounded-none text-gray-200 dark:text-gray-50 hover:text-gray-200 dark:hover:text-gray-100" : "rounded-none"}>
                    {item?.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                    {item.items && item.items?.length > 0 && <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />}
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
              {item.items && item.items?.length > 0 && <CollapsibleContent className="rounded-none mt-2">
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title} className="rounded-none">
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
