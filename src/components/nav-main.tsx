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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
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
          return <NavItem key={item.title} item={item} path={path} active={isActive(item.url)} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

type Item = {
  title: string
  url: string
  icon?: LucideIcon
  items?: { title: string; url: string }[]
}

/**
 * One main-nav entry. The label always navigates. When the entry has sub-items, the chevron is a separate button that only
 * opens and closes them (it never navigates), and the section opens by itself when the user lands inside it.
 */
function NavItem({ item, path, active }: { item: Item; path: string; active: boolean }) {
  const hasSub = !!item.items && item.items.length > 0
  const [open, setOpen] = useState(active)

  // Navigating into the section (from anywhere, including the label) opens it; leaving it never force-closes it.
  useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  const button = (
    <SidebarMenuButton
      asChild
      tooltip={item.title}
      isActive={active}
      className="h-9 gap-2.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:font-medium data-[active=true]:text-foreground"
    >
      <Link href={item.url}>
        {item.icon && <item.icon className="h-4 w-4" />}
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  )

  if (!hasSub) return <SidebarMenuItem>{button}</SidebarMenuItem>

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild className="group/collapsible">
      <SidebarMenuItem>
        {button}
        <CollapsibleTrigger asChild>
          <SidebarMenuAction
            aria-label={`${open ? "Collapse" : "Expand"} ${item.title}`}
            className="top-2 h-5 w-5 text-muted-foreground opacity-70 hover:opacity-100"
          >
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuAction>
        </CollapsibleTrigger>
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
      </SidebarMenuItem>
    </Collapsible>
  )
}
