"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

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

/** Main h-panel navigation: 36px items, quiet active state (muted background + medium weight), sub-items under the active section. */
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
  const path = usePathname() ?? ""
  const isActive = (url: string) => url !== "#" && (path === url || path.startsWith(url + "/"))

  return (
    <SidebarGroup className="px-2 pt-1">
      <SidebarGroupLabel className="h-7 px-2 text-xs font-normal text-muted-foreground">Main</SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          if (!item.enabled) return null
          const active = isActive(item.url)
          const hasSub = !!item.items && item.items.length > 0
          return (
            <Collapsible key={item.title} asChild defaultOpen={active} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                    className="h-9 gap-2.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:font-medium data-[active=true]:text-foreground"
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                      {hasSub && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {hasSub && (
                  <CollapsibleContent className="mt-0.5">
                    <SidebarMenuSub className="mx-3.5 gap-0.5 border-l border-border/70 px-0 py-0.5">
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={path === subItem.url}
                            className="h-8 translate-x-0 pl-3 text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:font-medium data-[active=true]:text-foreground"
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
