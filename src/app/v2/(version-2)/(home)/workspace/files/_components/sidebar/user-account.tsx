"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ChevronsUpDown, User } from "lucide-react";
import { useUserInfoProvider } from "../providers/user-info-provider";

export default function UserAccount() {
  const { user } = useUserInfoProvider();
  const userName = user?.name || "Workspace Files";
  const userEmail = user?.email || "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="flex h-10 items-center justify-between rounded-lg p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                    {userName[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium leading-none truncate max-w-[110px]">{userName}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">{userEmail}</span>
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="start">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
