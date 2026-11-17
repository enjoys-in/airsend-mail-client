// ============================================================================
// Class names for the date pickers used by the calendar page.
//
// react-day-picker v9+ renders <nav> as a SIBLING of the month caption (inside
// `.rdp-months`), not inside it. The shared ui/calendar styles still position
// the arrows with `absolute left-1/right-1` for the old layout, so they were
// placed against the nearest positioned ancestor (the sidebar) — the previous
// arrow ended up off to the left and the next arrow floated over the grid.
// These overrides anchor the nav to the months container.
// ============================================================================

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const navButton = cn(
  buttonVariants({ variant: "ghost" }),
  "size-7 p-0 rounded-full text-muted-foreground hover:text-foreground",
);

/** Nav fix only — safe to combine with the shared Calendar's default look. */
export const pickerNavClassNames = {
  months: "relative flex flex-col sm:flex-row gap-4",
  month: "space-y-3",
  month_caption: "flex h-7 items-center justify-center",
  caption_label: "text-sm font-medium",
  nav: "absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between",
  button_previous: navButton,
  button_next: navButton,
  chevron: "size-4 fill-current",
};

/** Full-width mini calendar for the sidebar. */
export const sidebarPickerClassNames = {
  ...pickerNavClassNames,
  months: "relative flex w-full flex-col",
  month: "w-full space-y-3",
  month_caption: "flex h-7 items-center justify-center",
  caption_label: "text-sm font-semibold",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday:
    "flex-1 pb-1 text-center text-[0.7rem] font-medium uppercase text-muted-foreground/70",
  week: "mt-1 flex w-full",
  day: "flex flex-1 items-center justify-center p-0 text-sm",
  day_button:
    "relative flex size-8 items-center justify-center rounded-full text-[13px] font-normal text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
  today:
    "[&>button]:font-semibold [&>button]:text-primary [&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-primary/50",
  selected:
    "[&>button]:!bg-primary [&>button]:!text-primary-foreground [&>button]:!ring-0 [&>button]:font-semibold",
  outside: "[&>button]:text-muted-foreground/40",
  disabled: "opacity-50",
  hidden: "invisible",
};
