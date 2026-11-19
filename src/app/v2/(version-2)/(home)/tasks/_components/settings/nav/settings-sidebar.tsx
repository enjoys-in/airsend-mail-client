import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  HostedSidebar,
  useHostedSidebarSlot,
} from "@tasks/_components/common/hosted-sidebar";
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
  const hostSlot = useHostedSidebarSlot();

  useEffect(() => {
    if (pathname) setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const sections = (
    <>
      <SettingsSidebarHeader onLeave={onLeave} />
      <SidebarContent className="gap-0 pb-2">
        <SettingsNavGroup group={nav.account} pathname={pathname} />
        <SettingsNavGroup group={nav.workspace} pathname={pathname} />
        <SettingsNavProjects projects={nav.projects} pathname={pathname} />
        {nav.admin ? (
          <SettingsNavGroup group={nav.admin} pathname={pathname} />
        ) : null}
      </SidebarContent>
    </>
  );

  // Desktop, inside the AirSend shell: the settings navigation lives in the AirSend sidebar.
  if (hostSlot) return <HostedSidebar slot={hostSlot}>{sections}</HostedSidebar>;

  return (
    <Sidebar collapsible="offcanvas" variant="inset" className="border-none">
      {sections}
    </Sidebar>
  );
}
