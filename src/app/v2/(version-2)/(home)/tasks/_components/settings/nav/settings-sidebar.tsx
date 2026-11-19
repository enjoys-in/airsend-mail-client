import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { normalizeSettingsPath } from "@tasks/_components/settings/nav/get-settings-breadcrumb";
import { SettingsNavGroup } from "@tasks/_components/settings/nav/settings-nav-group";
import { SettingsNavProjects } from "@tasks/_components/settings/nav/settings-nav-projects";
import { SettingsSidebarHeader } from "@tasks/_components/settings/nav/settings-sidebar-header";
import type { SettingsNav } from "@tasks/_components/settings/nav/types";
import { Sidebar, SidebarContent, useSidebar } from "@tasks/_components/ui/sidebar";

type SettingsSidebarProps = {
  nav: SettingsNav;
  onLeave: (() => void) | undefined;
};

export function SettingsSidebar({ nav, onLeave }: SettingsSidebarProps) {
  const pathname = useLocation({
    select: (location) => normalizeSettingsPath(location.pathname),
  });
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    if (pathname) setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="offcanvas" variant="inset" className="border-none">
      <SettingsSidebarHeader onLeave={onLeave} />
      <SidebarContent className="gap-0 pb-2">
        <SettingsNavGroup group={nav.account} pathname={pathname} />
        <SettingsNavGroup group={nav.workspace} pathname={pathname} />
        <SettingsNavProjects projects={nav.projects} pathname={pathname} />
        {nav.admin ? (
          <SettingsNavGroup group={nav.admin} pathname={pathname} />
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}
