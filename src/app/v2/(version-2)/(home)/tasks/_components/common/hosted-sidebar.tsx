import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@tasks/_hooks/use-mobile";
import { useTasksSidebarSlot } from "@tasks/_lib/sidebar-slot";

/**
 * The AirSend sidebar panel to render Kaneo's sidebar into, or null when Kaneo should draw its
 * own (mobile drawer, or no AirSend panel on the page).
 */
export function useHostedSidebarSlot() {
  const slot = useTasksSidebarSlot();
  const isMobile = useIsMobile();
  return isMobile ? null : slot;
}

/**
 * Renders sidebar sections into the AirSend sidebar. A portal keeps Kaneo's React context
 * (router, query client, i18n). The wrapper carries the attributes Kaneo's `Sidebar` would have
 * put on its own root, because the menu components style themselves from them.
 */
export function HostedSidebar({
  slot,
  children,
}: {
  slot: HTMLElement;
  children: ReactNode;
}) {
  return createPortal(
    <div
      className="group flex h-full min-h-0 w-full flex-col text-sidebar-foreground"
      data-collapsible=""
      data-side="left"
      data-slot="sidebar"
      data-state="expanded"
      data-variant="inset"
    >
      {children}
    </div>,
    slot,
  );
}
