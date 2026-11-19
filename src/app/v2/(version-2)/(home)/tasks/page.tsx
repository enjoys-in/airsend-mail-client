"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { TasksProvider, useTasks } from "./_lib/tasks-context";
import { TasksHeader } from "./navigation/TasksHeader";
import { BoardView } from "./board/BoardView";
import { ListView } from "./list/ListView";
import { MyTasksView } from "./my-tasks/MyTasksView";
import { CalendarView } from "./calendar/CalendarView";
import { GanttView } from "./gantt/GanttView";
import { HomeView } from "./home/HomeView";
import { InboxView } from "./inbox/InboxView";
import { MembersView } from "./members/MembersView";
import { TaskDetailDialog } from "./task/TaskDetailDialog";
import { TaskCreateDialog } from "./task/TaskCreateDialog";
import { ProjectCreateDialog } from "./project/ProjectCreateDialog";
import { SettingsShell } from "./settings/SettingsShell";

function TasksMainContent() {
  const { viewMode, isLoading } = useTasks();

  if (viewMode === "settings") {
    return (
      <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden bg-background">
        <SettingsShell />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden bg-background">
      {["board", "list", "calendar", "gantt", "my-tasks"].includes(viewMode) && <TasksHeader />}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "home" ? (
        <HomeView />
      ) : viewMode === "inbox" ? (
        <InboxView />
      ) : viewMode === "members" ? (
        <MembersView />
      ) : viewMode === "my-tasks" ? (
        <MyTasksView />
      ) : viewMode === "list" ? (
        <ListView />
      ) : viewMode === "calendar" ? (
        <CalendarView />
      ) : viewMode === "gantt" ? (
        <GanttView />
      ) : (
        <BoardView />
      )}

      <TaskDetailDialog />
      <TaskCreateDialog />
      <ProjectCreateDialog />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TasksProvider>
        <TasksMainContent />
      </TasksProvider>
    </Suspense>
  );
}
