"use client";

import React, { type ComponentProps } from "react";
import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";
import SidebarPinnedFiles from "./sidebar-folders";
import StorageFooter from "./sidebar-footer";
import UserAccount from "./user-account";
import TagMenu from "./tag-menu";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="px-0 py-2 border-r bg-background">
      <SidebarHeader className="p-2 pt-0">
        <UserAccount />
      </SidebarHeader>

      <SidebarContent>
        <SidebarPinnedFiles />
        <TagMenu />
      </SidebarContent>

      <StorageFooter />
    </Sidebar>
  );
}

export default AppSidebar;
