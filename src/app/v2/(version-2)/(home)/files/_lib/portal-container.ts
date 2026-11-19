// Nimbus's stylesheet is scoped to `.nimbus-root` (scripts/build-files-css.mjs), so Radix popups must
// not be portaled to <body>, where none of its tokens or utilities apply. `files/[[...slug]]/page.tsx`
// renders a `.nimbus-root` host element on <body> and registers it here; each Portal in `_components/ui`
// passes `nimbusPortalContainer.current` as its `container` (Radix falls back to <body> while it is null).
export const nimbusPortalContainer: { current: HTMLElement | null } = {
	current: null,
};
