"use client";

import { HostedAppSidebar } from "./hosted-app-sidebar";
import {
  setTasksSidebarSlot,
  useTasksSidebarReady,
} from "../(home)/tasks/_lib/sidebar-slot";

/** Secondary panel for /v2/tasks: Kaneo's sidebar renders into it (see hosted-app-sidebar.tsx). */
export function TasksSidebar() {
  return (
    <HostedAppSidebar
      rootClass="kaneo-root"
      setSlot={setTasksSidebarSlot}
      useReady={useTasksSidebarReady}
    />
  );
}

export default TasksSidebar;
