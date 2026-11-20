import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHeaderSlot } from "@/components/common/header-slot";
import { useIsMobile } from "@tasks/_hooks/use-mobile";

/**
 * Renders a page header's content in the AirSend top bar (desktop) instead of a second bar under
 * it; `fallback` is the original in-page header, used on mobile or outside the AirSend shell.
 *
 * `.tasks-root` scopes Kaneo's tokens and utilities to the hosted content, and
 * `data-kaneo-header` drives the CSS that hides Kaneo's sidebar toggle and the divider after it
 * (the AirSend bar has its own toggle).
 */
export function HostedHeader({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const hostSlot = useHeaderSlot();
  const isMobile = useIsMobile();

  if (hostSlot && !isMobile) {
    return createPortal(
      <div
        className="tasks-root flex min-w-0 flex-1 items-center"
        data-kaneo-header=""
        style={{ background: "transparent" }}
      >
        {children}
      </div>,
      hostSlot,
    );
  }
  return <>{fallback}</>;
}
