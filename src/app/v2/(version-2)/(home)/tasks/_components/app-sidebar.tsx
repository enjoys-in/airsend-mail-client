import { useLocation } from "@tanstack/react-router";
import type * as React from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { NavMain } from "@tasks/_components/nav-main";
import { NavProjects } from "@tasks/_components/nav-projects";
import { NavSecondary } from "@tasks/_components/nav-secondary";
import { ThemeToggleDropdown } from "@tasks/_components/theme-toggle-dropdown";
import { TrialCard } from "@tasks/_components/trial-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@tasks/_components/ui/sidebar";
import { VersionDisplay } from "@tasks/_components/version-display";
import { WorkspaceSwitcher } from "@tasks/_components/workspace-switcher";
import { useTasksSidebarSlot } from "@tasks/_lib/sidebar-slot";

function SidebarSections() {
  return (
    <>
      <SidebarHeader className="pt-1 pb-1.5">
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden gap-1 py-1">
        <NavMain />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary />
        <TrialCard />
        <div className="flex items-center justify-between">
          <VersionDisplay />
          <ThemeToggleDropdown />
        </div>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = useLocation({ select: (location) => location.pathname });
  const hostSlot = useTasksSidebarSlot();

  // Navigation that doesn't start from a sidebar link (creating a project,
  // the command palette) must still dismiss the mobile drawer.
  useEffect(() => {
    if (pathname) setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  // Desktop, inside the AirSend shell: the sections live in the AirSend sidebar's panel. The
  // wrapper carries the attributes Kaneo's `Sidebar` would have put on its own root, because the
  // menu components style themselves from them.
  if (!isMobile && hostSlot) {
    return createPortal(
      <div
        className="group flex h-full min-h-0 w-full flex-col text-sidebar-foreground"
        data-collapsible=""
        data-side="left"
        data-slot="sidebar"
        data-state="expanded"
        data-variant="inset"
      >
        <SidebarSections />
      </div>,
      hostSlot,
    );
  }

  // Mobile drawer, or no AirSend panel to render into: Kaneo's own sidebar.
  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="border-none"
      {...props}
    >
      <SidebarSections />
    </Sidebar>
  );
}
