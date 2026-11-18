"use client";

import React, { Suspense } from "react";
import { TasksProvider, useTasks } from "./_lib/tasks-context";
import { TasksHeader } from "./_components/TasksHeader";
import { TasksBoardView } from "./_components/TasksBoardView";
import { TasksListView } from "./_components/TasksListView";
import { Spinner } from "@/components/common/spinner";

function TasksMainContent() {
  const { viewMode, isLoading } = useTasks();

  return (
    <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden bg-background">
      <TasksHeader />
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : viewMode === "board" ? (
        <TasksBoardView />
      ) : (
        <TasksListView />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <TasksProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <TasksMainContent />
      </Suspense>
    </TasksProvider>
  );
}
