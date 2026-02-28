"use client";

import React from "react";
import ThreadPanel from "./_components/ThreadPanel";
import SidePanel from "./_components/SidePanel";
import WorkspaceInit from "./_components/WorkspaceInit";
import { MobileBottomActions } from "./_components/MobileBottomActions";
import { useChatStore } from "./_lib/chat-store";

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  const { sidePanelView, activeThreadMessageId } = useChatStore();

  const showThread = sidePanelView === "thread" && activeThreadMessageId;
  const showSidePanel = sidePanelView && sidePanelView !== "thread";

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