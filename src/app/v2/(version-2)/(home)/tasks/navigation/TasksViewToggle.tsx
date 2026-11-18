"use client";

import React from "react";
import { LayoutGrid, List, CheckSquare, Calendar as CalendarIcon, GitCommitHorizontal } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { type TasksViewMode } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";

export function TasksViewToggle() {
  const { viewMode, setViewMode } = useTasks();

  const options: Array<{ mode: TasksViewMode; label: string; icon: React.ReactNode }> = [
    { mode: "board", label: "Board", icon: <LayoutGrid className="size-3.5" /> },
    { mode: "list", label: "List", icon: <List className="size-3.5" /> },
    { mode: "my-tasks", label: "My Tasks", icon: <CheckSquare className="size-3.5" /> },
    { mode: "calendar", label: "Calendar", icon: <CalendarIcon className="size-3.5" /> },
    { mode: "gantt", label: "Timeline", icon: <GitCommitHorizontal className="size-3.5" /> },
  ];

  return (
    <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
      {options.map((opt) => (
        <Button
          key={opt.mode}
          variant={viewMode === opt.mode ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode(opt.mode)}
          className="h-7 px-2 text-xs gap-1 shadow-none"
          title={`${opt.label} View`}
        >
          {opt.icon}
          <span className="hidden lg:inline">{opt.label}</span>
        </Button>
      ))}
    </div>
  );
}
