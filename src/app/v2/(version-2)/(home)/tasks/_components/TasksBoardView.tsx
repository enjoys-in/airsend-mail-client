"use client";

import React from "react";
import { KanbanColumn } from "./KanbanColumn";
import { TasksEmptyState } from "./TasksEmptyState";
import { useTasks } from "../_lib/tasks-context";
import { type TaskColumn } from "../_lib/tasks-types";

const DEFAULT_COLUMNS: TaskColumn[] = [
  { id: "col-backlog", name: "Backlog", slug: "backlog", position: 0 },
  { id: "col-todo", name: "To Do", slug: "todo", position: 1 },
  { id: "col-in-progress", name: "In Progress", slug: "in-progress", position: 2 },
  { id: "col-done", name: "Done", slug: "done", position: 3, isFinal: true },
];

export function TasksBoardView() {
  const { columns, filteredTasks } = useTasks();

  const cols = columns.length > 0 ? columns : DEFAULT_COLUMNS;

  if (filteredTasks.length === 0 && cols.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <div className="flex flex-1 overflow-x-auto p-4 md:p-6 bg-background/50">
      <div className="flex items-start gap-4 h-full">
        {cols.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.slug);
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          );
        })}
      </div>
    </div>
  );
}
