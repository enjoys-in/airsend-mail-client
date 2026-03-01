"use client"

import * as React from "react"
import { AudioWaveform, ChevronsUpDown, Command, GalleryVerticalEnd, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { FavIcon } from "@/components/logo-image"
import { useAppSelector } from "@/store/hooks"
const domains = [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },

]

export function AccountSwitcherV2() {
  const { isMobile } = useSidebar()
  const currAccount = useAppSelector(state => state.accounts.currAccount)
  const [activeTeam, setActiveTeam] = React.useState(domains[0])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  if (!activeTeam) {
    return null
  }

  // Use empty strings on server / before mount to avoid hydration mismatch
  const accountName = mounted ? (currAccount?.name ?? "") : ""
  const accountEmail = mounted ? (currAccount?.email ?? "") : ""

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex w-full items-center justify-between py-0 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-black bg-black flex items-center justify-center" >
                    <FavIcon w={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-foreground">
                      {accountName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {accountEmail}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
            Domains
            </DropdownMenuLabel>
            {domains.map((domain, index) => (
              <DropdownMenuItem
                key={domain.name}
                onClick={() => setActiveTeam(domain)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <domain.logo className="size-4 shrink-0" />
                </div>
                {domain.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Account</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
