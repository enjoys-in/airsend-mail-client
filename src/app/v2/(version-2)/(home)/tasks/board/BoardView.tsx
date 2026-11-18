"use client";

import React from "react";
import { useTasks } from "../_lib/tasks-context";
import { KanbanColumn } from "./KanbanColumn";
import { TasksEmptyState } from "../navigation/TasksEmptyState";

export function BoardView() {
  const { columns, filteredTasks, currentProject } = useTasks();

  if (!currentProject) {
    return (
      <TasksEmptyState
        title="No project selected"
        description="Select or create a project from the sidebar to view tasks."
      />
    );
  }

  return (
    <div className="flex flex-1 gap-4 p-4 overflow-x-auto overflow-y-hidden">
      {columns.map((col) => {
        const colTasks = filteredTasks.filter(
          (t) => t.status === col.slug || t.statusName === col.name
        );
        return <KanbanColumn key={col.id} column={col} tasks={colTasks} />;
      })}
    </div>
  );
}
