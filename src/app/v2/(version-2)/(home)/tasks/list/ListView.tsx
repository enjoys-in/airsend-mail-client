"use client";

import React from "react";
import { TaskListItem } from "./TaskListItem";
import { TasksEmptyState } from "../navigation/TasksEmptyState";
import { useTasks } from "../_lib/tasks-context";

export function ListView() {
  const { filteredTasks, columns } = useTasks();

  if (filteredTasks.length === 0) {
    return <TasksEmptyState />;
  }

  const hasColumns = columns.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background/50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
        {hasColumns ? (
          columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.slug);
            if (colTasks.length === 0) return null;

            return (
              <div key={col.id} className="border-b border-border/40 last:border-b-0">
                <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 border-b border-border/30">
                  <div className="size-2 rounded-full bg-primary/70" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.name}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <div className="divide-y divide-border/20">
                  {colTasks.map((task) => (
                    <TaskListItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="divide-y divide-border/20">
            {filteredTasks.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
