import type { RefObject } from "react";

// Kaneo's stylesheet is scoped to `.tasks-root` (see scripts/build-tasks-css.mjs), so popups must
// not be portaled to <body>, where none of its tokens or utilities apply. `[[...slug]]/page.tsx`
// renders a `.tasks-root` host element and registers it here; every Portal below passes this ref
// as its `container`. While the host isn't mounted yet, Base UI falls back to <body>.
export const kaneoPortalContainer: RefObject<HTMLElement | null> = {
  current: null,
};
