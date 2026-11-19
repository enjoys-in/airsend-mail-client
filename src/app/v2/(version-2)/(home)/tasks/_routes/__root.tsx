import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { InstanceNameSync } from "@tasks/_components/instance-name/instance-name-sync";
import { ToastProvider } from "@tasks/_components/ui/toast";
import { setTasksSidebarReady } from "@tasks/_lib/sidebar-slot";
import type { User } from "@tasks/_types/user";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: User | null | undefined;
}>()({
  component: RootComponent,
});

function RootComponent() {
  // Tell the AirSend sidebar panel the first route has resolved, so its skeleton can go away (an
  // empty panel afterwards means "this page has no sidebar"). Reset when the app unmounts.
  const idle = useRouterState({ select: (s) => s.status === "idle" });
  useEffect(() => {
    if (idle) setTasksSidebarReady(true);
  }, [idle]);
  useEffect(() => () => setTasksSidebarReady(false), []);

  return (
    <ToastProvider position="bottom-right">
      <InstanceNameSync />
      <div className="flex h-svh w-full flex-row overflow-x-hidden overflow-y-hidden bg-background scrollbar-thin scrollbar-thumb-border scrollbar-track-muted">
        <Outlet />
      </div>
    </ToastProvider>
  );
}

export default RootComponent;
