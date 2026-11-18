"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { type TaskColumn, type TaskItem, type TaskStatus } from "../_lib/tasks-types";
import { TaskCard } from "./TaskCard";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: TaskColumn;
  tasks: TaskItem[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { handleMoveTaskStatus, setIsCreateOpen, setCreateDefaultStatus } = useTasks();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      void handleMoveTaskStatus(taskId, column.slug as TaskStatus);
    }
  };

  const handleQuickAdd = () => {
    setCreateDefaultStatus(column.slug as TaskStatus);
    setIsCreateOpen(true);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex w-72 sm:w-80 shrink-0 flex-col rounded-2xl border bg-muted/20 transition-colors duration-150",
        isDragOver ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : "border-border/60"
      )}
    >
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary/80" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {column.name}
          </h3>
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleQuickAdd}
          className="size-6 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5 overflow-y-auto max-h-[calc(100svh-12rem)] min-h-[14rem]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-10 text-center">
            <p className="text-xs text-muted-foreground/70">No tasks in this column</p>
            <Button
              variant="link"
              size="sm"
              onClick={handleQuickAdd}
              className="text-xs text-primary gap-1 mt-1 p-0 h-auto font-medium"
            >
              <Plus className="size-3" />
              Add task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
