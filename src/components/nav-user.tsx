"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { AdminLogout } from "./server-actions/logout-admin"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { API } from "@/lib/api/handler"
export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [avatar, setAvatar] = useState<string>()
  const user = useAppSelector(state => state.admin.user)
  async function cacheImage(url: string, key: string) {
    const res = await fetch(url)
    const blob = await res.blob()
    const reader = new FileReader()

    return new Promise<string>((resolve) => {
      reader.onloadend = () => {
        localStorage.setItem(key, reader.result as string)
        resolve(reader.result as string)
      }
      reader.readAsDataURL(blob) // convert blob → base64
    })
  }

  const handleLogout = async () => {

    const { data } = await API.handleAdminLogout()
    if (data) {
      await AdminLogout()
      router.replace("/h-panel")
    }


  }
  useEffect(() => {
    if (user) {
      const key = `avatar-${user?.mid}`
      const cached = localStorage.getItem(key)
      if (cached) {
        setAvatar(cached)
      } else if (user?.picture) {
        cacheImage(user.picture, key).then(setAvatar)
      }
    }

  }, [user?.picture])
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {
          user &&
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {user?.picture ?
                    <AvatarImage src={avatar} alt={user?.name} /> :
                    <AvatarFallback className="rounded-lg">{formatNameInParts(user?.name as string || "AE")}</AvatarFallback>
                  }

                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
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
                  onClick={() => router.push(`/h-panel/settings/${user?.name}`)}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user?.picture ?
                      <AvatarImage src={avatar} alt={user?.name} /> :
                      <AvatarFallback className="rounded-lg">{formatNameInParts(user?.name as string || "AE")}</AvatarFallback>
                    }

                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
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
        }

      </SidebarMenuItem>
    </SidebarMenu>
  )
}
