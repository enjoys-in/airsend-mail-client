"use client";

import { HostedAppSidebar } from "./hosted-app-sidebar";
import {
  setFilesSidebarSlot,
  useFilesSidebarReady,
} from "../(home)/files/_lib/sidebar-slot";

/** Secondary panel for /v2/files: Nimbus's sidebar renders into it (see hosted-app-sidebar.tsx). */
export function FilesSidebarPanel() {
  return (
    <HostedAppSidebar
      rootClass="nimbus-root"
      setSlot={setFilesSidebarSlot}
      useReady={useFilesSidebarReady}
    />
  );
}

export default FilesSidebarPanel;
