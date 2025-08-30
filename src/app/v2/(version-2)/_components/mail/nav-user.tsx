"use client"

import {

  ChevronsUpDown,

  LogOut,

} from "lucide-react"

import {
  Avatar,
  AvatarFallback,

} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,

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
export function NavUserV2() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const currAccount = useAppSelector(state => state.accounts.currAccount)
  const handleLogout = async() => {
   await UserLogout()
    router.push("/v2")
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
                <AvatarFallback className="rounded-lg">{currAccount?.name && formatNameInParts(currAccount?.name as string) || "AE"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currAccount?.name}</span>
                <span className="truncate text-xs">{currAccount?.email}</span>
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
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => router.push(`/h-panel/settings/${currAccount?.name}`)}
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{formatNameInParts(currAccount?.name as string || "AE")}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currAccount?.name}</span>
                  <span className="truncate text-xs">{currAccount?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 w-4 h-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 w-4 h-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard  className="mr-2 w-4 h-4"/>
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 w-4 h-4"/>
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
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
