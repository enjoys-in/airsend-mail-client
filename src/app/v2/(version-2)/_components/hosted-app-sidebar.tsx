"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TasksSidebarSkeleton } from "@/components/common/tasks-skeleton";

/**
 * Secondary sidebar panel for an embedded app (Tasks, Files). The app renders its own sidebar
 * content into the slot element below (see src/components/common/slot-store.ts), so it sits in the
 * AirSend sidebar like the other modules' panels instead of showing a second sidebar.
 *
 * `rootClass` (`kaneo-root` / `nimbus-root`) gives the slot the app's scoped design tokens and
 * utilities. Until the app has resolved its first route, a skeleton stands in; once it has, an
 * empty slot just hides (a page that has no sidebar, like the Files setup screen).
 */
export function HostedAppSidebar({
  rootClass,
  setSlot,
  useReady,
}: {
  rootClass: string;
  setSlot: (element: HTMLElement | null) => void;
  useReady: () => boolean;
}) {
  const ready = useReady();
  const register = React.useCallback(
    (element: HTMLDivElement | null) => setSlot(element),
    [setSlot],
  );

  return (
    <Sidebar
      collapsible="none"
      className="hidden flex-1 md:flex bg-background border-r border-border/40 select-none"
    >
      <div
        ref={register}
        className={`${rootClass} flex min-h-0 flex-1 flex-col empty:hidden [&:not(:empty)+div]:hidden`}
      />
      {ready ? null : <TasksSidebarSkeleton />}
    </Sidebar>
  );
}
