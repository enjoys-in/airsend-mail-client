"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import ThreadPanel from "./_components/ThreadPanel";
import SidePanel from "./_components/SidePanel";
import WorkspaceInit from "./_components/WorkspaceInit";
import ConfirmHost from "./_components/ConfirmHost";
import TeamsNavBar from "./_components/TeamsNavBar";
import WorkspaceErrorBoundary from "./_components/WorkspaceErrorBoundary";
import { WorkspaceHomeSkeleton } from "./_components/WorkspaceSkeletons";
import { MobileBottomActions } from "./_components/MobileBottomActions";
import { useChatStore } from "./_lib/chat-store";
import { useAppSelector } from "@/store/hooks";
import { Boxes, Loader2 } from "lucide-react";

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { sidePanelView, activeThreadMessageId } = useChatStore();
  const workspace = useAppSelector((s) => s.accounts?.currAccount?.workspace);
  const loading = useAppSelector((s) => s.accounts?.loading);
  const currAccount = useAppSelector((s) => s.accounts?.currAccount);

  const showThread = sidePanelView === "thread" && activeThreadMessageId;
  const showSidePanel = sidePanelView && sidePanelView !== "thread";

  // Check if current view is a full-screen live video call room
  const isLiveCallRoom =
    pathname.includes("/workspace/calls/meet-") ||
    pathname.includes("/workspace/calls/call-");

  // Wait for initial profile load before deciding
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100svh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user account is specifically disabled for workspace
  if (currAccount && currAccount.workspace === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100svh-3.5rem)] gap-3 text-muted-foreground">
        <Boxes className="h-10 w-10" />
        <p className="text-lg font-medium">Workspace not available</p>
        <p className="text-sm">Your account does not have an active workspace. Contact your domain admin to enable it.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden">
      {/* Workspace data initializer & WebSocket connection */}
      <WorkspaceInit />
      {/* Shared confirmation dialog (moderation, deletes) */}
      <ConfirmHost />

      {/* Main content column with Teams Navigation Bar */}
      <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* Render Teams Header Bar (except when full-screen call room is active) */}
        {!isLiveCallRoom && <TeamsNavBar />}

        {/* Route content with Error Boundary and Suspense Skeleton */}
        <WorkspaceErrorBoundary fallbackTitle="Workspace Section Unavailable">
          <Suspense fallback={<WorkspaceHomeSkeleton />}>
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              {children}
            </div>
          </Suspense>
        </WorkspaceErrorBoundary>

        {/* Mobile bottom quick actions */}
        <MobileBottomActions />
      </main>

      {/* Right panels (thread or side panel) — desktop only */}
      {!isLiveCallRoom && (
        <div className="hidden md:contents">
          {showThread && <ThreadPanel />}
          {showSidePanel && <SidePanel />}
        </div>
      )}
    </div>
  );
};

export default WorkspaceLayout;
