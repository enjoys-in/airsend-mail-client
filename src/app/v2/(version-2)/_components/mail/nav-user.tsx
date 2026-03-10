"use client"

import React from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAppSelector } from "@/store/hooks"
import { formatNameInParts } from "@/lib/utils"

import { useRouter } from "next/navigation"
import { UserLogout } from "@/components/server-actions/logout-user"
import { API } from "@/lib/api/handler"
import { airsendDB } from "@/db"

export function NavUserV2() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const currAccount = useAppSelector(state => state.accounts.currAccount)
  const [mounted, setMounted] = React.useState(false)
  const [displayName, setDisplayName] = React.useState("")

  React.useEffect(() => { setMounted(true) }, [])

  // Fetch display_name from IndexDB settings when account changes
  React.useEffect(() => {
    if (!currAccount?.email) return
    airsendDB
      .getMultiNestedItem("settings", currAccount.email, [
        "settings.user.display_name",
      ])
      .then((res) => {
        const storedName =
          (res.value?.settings as any)?.user?.display_name || ""
        setDisplayName(storedName)
      })
      .catch(() => {})
  }, [currAccount?.email])

  const resolvedName = mounted
    ? displayName || currAccount?.name || ""
    : ""
  const resolvedEmail = mounted ? (currAccount?.email ?? "") : ""
  const resolvedTenant = mounted ? (currAccount?.tenant_name ?? "") : ""
  const initials = mounted && resolvedName
    ? formatNameInParts(resolvedName)
    : ""

  const handleLogout = async () => {
    const { data } = await API.handleLogout()
    if (data.success) {
      await UserLogout()
      router.replace("/v2")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{resolvedName}</span>
                <span className="truncate text-xs text-muted-foreground">{resolvedEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div
                className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
                onClick={() => router.push("/v2/u/settings")}
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{resolvedName}</span>
                  <span className="truncate text-xs text-muted-foreground">{resolvedEmail}</span>
                  {resolvedTenant && (
                    <span className="truncate text-[10px] text-muted-foreground/70">{resolvedTenant}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/v2/u/settings")}>
                <BadgeCheck className="mr-2 w-4 h-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/v2/u/settings")}>
                <Settings className="mr-2 w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/v2/u/settings")}>
                <Bell className="mr-2 w-4 h-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
