import { cn } from "@tasks/_lib/cn";
import { useTasksSidebarSlot } from "@tasks/_lib/sidebar-slot";
import { useUserPreferencesStore } from "@tasks/_store/user-preferences";

export function ShellFrame() {
  const sidebarOpen = useUserPreferencesStore(
    (state) => state.sidebarDefaultOpen,
  );

  // With the AirSend sidebar hosting Kaneo's sidebar, there is no Kaneo column to reserve.
  const inHostSidebar = useTasksSidebarSlot() !== null;

  return (
    <div aria-hidden="true" className="flex h-svh w-full bg-sidebar">
      {sidebarOpen && !inHostSidebar ? (
        <div className="hidden w-60 shrink-0 md:block" />
      ) : null}
      <div
        className={cn(
          "m-2 flex-1 rounded-xl border border-border/80 bg-background shadow-sm/5",
          sidebarOpen && !inHostSidebar && "md:ms-0",
        )}
      />
    </div>
  );
}
