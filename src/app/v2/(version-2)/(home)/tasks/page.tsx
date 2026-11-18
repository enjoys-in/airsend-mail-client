"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { TasksProvider, useTasks } from "./_lib/tasks-context";
import { TasksHeader } from "./_components/TasksHeader";
import { TasksBoardView } from "./_components/TasksBoardView";
import { TasksListView } from "./_components/TasksListView";
import { TasksMyTasksView } from "./_components/TasksMyTasksView";
import { TasksCalendarView } from "./_components/TasksCalendarView";
import { TaskDetailDialog } from "./_components/TaskDetailDialog";
import { TaskCreateDialog } from "./_components/TaskCreateDialog";
import { ProjectCreateDialog } from "./_components/ProjectCreateDialog";
import { TasksSettingsDialog } from "./_components/TasksSettingsDialog";

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
        <TasksBoardView />
      ) : viewMode === "list" ? (
        <TasksListView />
      ) : viewMode === "my-tasks" ? (
        <TasksMyTasksView />
      ) : (
        <TasksCalendarView />
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
