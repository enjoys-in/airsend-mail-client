"use client"

import { ChevronsUpDown, LogOut, Settings } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { AdminLogout } from "./server-actions/logout-admin"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { API } from "@/lib/api/handler"
import { broadcastLogout } from "@/lib/auth-sync"
/** "Mullayam Singh" -> "MS", "ops@x.in" -> "O". */
const initialsOf = (value?: string) => {
  const parts = String(value || "").trim().split(/[\s@._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "A") + (parts.length > 1 ? parts[1][0] : "")).toUpperCase()
}

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
      broadcastLogout("admin")
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
                className="h-12 gap-2.5 px-2 data-[state=open]:bg-muted group-data-[collapsible=icon]:!p-0"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  {user?.picture ?
                    <AvatarImage src={avatar} alt={user?.name} /> :
                    <AvatarFallback className="rounded-full bg-muted text-xs font-medium">{initialsOf(user?.name || user?.email)}</AvatarFallback>
                  }
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg border-border/70 shadow-md"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex items-center gap-2.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-full">
                    {user?.picture ?
                      <AvatarImage src={avatar} alt={user?.name} /> :
                      <AvatarFallback className="rounded-full bg-muted text-xs font-medium">{initialsOf(user?.name || user?.email)}</AvatarFallback>
                    }
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/h-panel/settings/${user?.name}`)}>
                <Settings className="mr-2 h-4 w-4" />
                Profile settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
