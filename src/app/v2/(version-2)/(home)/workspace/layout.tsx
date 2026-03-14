"use client";

import React from "react";
import ThreadPanel from "./_components/ThreadPanel";
import SidePanel from "./_components/SidePanel";
import WorkspaceInit from "./_components/WorkspaceInit";
import { MobileBottomActions } from "./_components/MobileBottomActions";
import { useChatStore } from "./_lib/chat-store";
import { useAppSelector } from "@/store/hooks";
import { Boxes, Loader2 } from "lucide-react";

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidePanelView, activeThreadMessageId } = useChatStore();
  const workspace = useAppSelector((s) => s.accounts?.currAccount?.workspace);
  const loading = useAppSelector((s) => s.accounts?.loading);
  const currAccount = useAppSelector((s) => s.accounts?.currAccount);

  const showThread = sidePanelView === "thread" && activeThreadMessageId;
  const showSidePanel = sidePanelView && sidePanelView !== "thread";

  // Wait for profile to load before deciding — prevents server/client mismatch
  if (loading || !currAccount) {
    return (
      <div className="flex items-center justify-center h-[calc(100svh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
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
      {/* Workspace data initializer */}
      <WorkspaceInit />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
        {/* Mobile bottom actions (thread, activity, tasks, members, search) */}
        <MobileBottomActions />
      </main>

      {/* Right panels (thread or side panel) — desktop only */}
      <div className="hidden md:contents">
        {showThread && <ThreadPanel />}
        {showSidePanel && <SidePanel />}
      </div>
    </div>
  );
};

export default WorkspaceLayout;