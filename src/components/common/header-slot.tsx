"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// The AirSend top bar (v2 `HeaderV2`) has a slot between its sidebar toggle and its right-hand
// actions. A module that has a breadcrumb (Files, Tasks) portals it into the slot so the page
// does not need a second bar underneath; modules without one leave the slot empty and the bar
// keeps its mail search.
//
// The bar registers its slot element here. Everything is client side: with no slot (server,
// mobile layout, pages outside the v2 shell) consumers fall back to their own in-page header.

let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();

export function setHeaderSlot(element: HTMLElement | null) {
  if (slot === element) return;
  slot = element;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The top-bar slot element, or null when there is none to render into. */
export function useHeaderSlot() {
  return useSyncExternalStore(
    subscribe,
    () => slot,
    () => null,
  );
}

/**
 * Renders `children` in the AirSend top bar, or `fallback` (the module's own header) when the
 * bar isn't there or is hidden (the mobile layout keeps the bar mounted but not displayed).
 */
export function HeaderContent({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const target = useHeaderSlot();
  const isMobile = useIsMobile();
  if (target && !isMobile) return createPortal(children, target);
  return <>{fallback}</>;
}
