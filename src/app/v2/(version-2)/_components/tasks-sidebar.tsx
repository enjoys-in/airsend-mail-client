"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TasksSidebarSkeleton } from "@/components/common/tasks-skeleton";
import { setTasksSidebarSlot } from "../(home)/tasks/_lib/sidebar-slot";

/**
 * Secondary panel for /v2/tasks. Kaneo's own sidebar (workspace switcher, navigation, projects)
 * is rendered into the slot below by the Kaneo app, so it sits in the AirSend sidebar like the
 * Files and Workspace panels instead of showing a second sidebar.
 *
 * `.kaneo-root` gives the slot Kaneo's scoped design tokens and utilities. While the app is still
 * loading the slot is empty, which hides it and shows the skeleton instead.
 */
export function TasksSidebar() {
  const register = React.useCallback(
    (element: HTMLDivElement | null) => setTasksSidebarSlot(element),
    [],
  );

  return (
    <Sidebar
      collapsible="none"
      className="hidden flex-1 md:flex bg-background border-r border-border/40 select-none"
    >
      <div
        ref={register}
        className="kaneo-root flex min-h-0 flex-1 flex-col empty:hidden [&:not(:empty)+div]:hidden"
      />
      <TasksSidebarSkeleton />
    </Sidebar>
  );
}

export default TasksSidebar;
