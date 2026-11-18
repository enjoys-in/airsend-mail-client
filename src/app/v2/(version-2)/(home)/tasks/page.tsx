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
import { TaskDetailDialog } from "./task/TaskDetailDialog";
import { TaskCreateDialog } from "./task/TaskCreateDialog";
import { ProjectCreateDialog } from "./project/ProjectCreateDialog";
import { TasksSettingsDialog } from "./settings/TasksSettingsDialog";

function TasksMainContent() {
  const { viewMode, isLoading } = useTasks();

  return (
    <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden bg-background">
      <TasksHeader />
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "board" ? (
        <BoardView />
      ) : viewMode === "list" ? (
        <ListView />
      ) : viewMode === "my-tasks" ? (
        <MyTasksView />
      ) : viewMode === "calendar" ? (
        <CalendarView />
      ) : (
        <GanttView />
      )}

      <TaskDetailDialog />
      <TaskCreateDialog />
      <ProjectCreateDialog />
      <TasksSettingsDialog />
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
