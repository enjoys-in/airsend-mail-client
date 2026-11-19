"use client";

import React from "react";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import SidebarPinnedFiles from "./sidebar/sidebar-folders";
import StorageFooter from "./sidebar/sidebar-footer";
import UserAccount from "./sidebar/user-account";
import TagMenu from "./sidebar/tag-menu";
import SearchBar from "./sidebar/search-bar";

export function FilesSidebar() {
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background border-r border-border/40 select-none">
      <SidebarHeader className="p-2 pt-2 border-b border-border/40 space-y-2">
        <UserAccount />
        <SearchBar />
      </SidebarHeader>

      <SidebarContent>
        <SidebarPinnedFiles />
        <TagMenu />
      </SidebarContent>

      <StorageFooter />
    </Sidebar>
  );
}

export default FilesSidebar;
