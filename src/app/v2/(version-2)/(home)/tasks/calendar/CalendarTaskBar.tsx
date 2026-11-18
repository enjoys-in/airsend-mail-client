"use client";

import React from "react";
import { type TaskItem } from "../_lib/tasks-types";
import { cn } from "@/lib/utils";

interface CalendarTaskBarProps {
  task: TaskItem;
  onSelect: () => void;
}

export function CalendarTaskBar({ task, onSelect }: CalendarTaskBarProps) {
  const isDone = task.status === "done";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-[11px] truncate transition-colors",
        isDone
          ? "bg-muted/40 text-muted-foreground line-through"
          : "bg-primary/10 text-foreground hover:bg-primary/20"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full shrink-0",
          task.priority === "urgent" && "bg-red-500",
          task.priority === "high" && "bg-orange-500",
          task.priority === "medium" && "bg-amber-500",
          task.priority === "low" && "bg-blue-500",
          task.priority === "none" && "bg-muted-foreground"
        )}
      />
      <span className="truncate">{task.title}</span>
    </button>
  );
}
