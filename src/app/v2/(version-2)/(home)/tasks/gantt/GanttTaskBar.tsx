"use client";

import React from "react";
import { type TaskItem } from "../_lib/tasks-types";
import { parseTaskDate, differenceInDays } from "./timeline";
import { cn } from "@/lib/utils";

interface GanttTaskBarProps {
  task: TaskItem;
  timelineStart: Date;
  dayWidth: number;
  onSelect: () => void;
}

export function GanttTaskBar({ task, timelineStart, dayWidth, onSelect }: GanttTaskBarProps) {
  const due = parseTaskDate(task.dueDate);
  const start = parseTaskDate(task.startDate) || due || new Date();

  const startOffset = Math.max(0, differenceInDays(start, timelineStart));
  const durationDays = due ? Math.max(1, differenceInDays(due, start) + 1) : 1;

  const left = startOffset * dayWidth;
  const width = Math.max(dayWidth - 4, durationDays * dayWidth - 4);

  const isDone = task.status === "done";

  return (
    <div
      onClick={onSelect}
      style={{ left: `${left}px`, width: `${width}px` }}
      className={cn(
        "absolute top-2 h-8 rounded-lg px-2.5 flex items-center justify-between text-xs font-medium cursor-pointer shadow-xs transition-all hover:scale-[1.01] hover:shadow-md select-none border",
        isDone
          ? "bg-muted/40 text-muted-foreground border-border/40 line-through"
          : task.priority === "urgent"
          ? "bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400"
          : task.priority === "high"
          ? "bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400"
          : "bg-primary/15 border-primary/30 text-primary"
      )}
      title={`${task.title} (${task.status})`}
    >
      <span className="truncate">{task.title}</span>
      <span className="text-[10px] opacity-75 font-mono ml-2 shrink-0">{task.ticketId}</span>
    </div>
  );
}
