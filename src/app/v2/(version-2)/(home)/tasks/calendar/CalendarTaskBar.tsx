"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { PackableTask, WeekSegment } from "./month-grid-model";
import { CalendarSubtasks } from "./calendar-subtasks";
import type { TaskItem } from "../_lib/tasks-types";

export type CalendarTask = PackableTask & {
  title: string;
  number?: number | null;
  status: string;
  subtasks?: readonly { id: string; title: string }[];
  originalTask?: TaskItem;
};

const STATUS_CLASSES: Record<string, string> = {
  "to-do": "border-slate-500/35 bg-slate-500/15 hover:border-slate-500/50 hover:bg-slate-500/20 text-slate-200",
  todo: "border-slate-500/35 bg-slate-500/15 hover:border-slate-500/50 hover:bg-slate-500/20 text-slate-200",
  "in-progress": "border-blue-500/35 bg-blue-500/15 hover:border-blue-500/50 hover:bg-blue-500/20 text-blue-200",
  in_progress: "border-blue-500/35 bg-blue-500/15 hover:border-blue-500/50 hover:bg-blue-500/20 text-blue-200",
  "in-review": "border-amber-500/40 bg-amber-500/15 hover:border-amber-500/55 hover:bg-amber-500/20 text-amber-200",
  in_review: "border-amber-500/40 bg-amber-500/15 hover:border-amber-500/55 hover:bg-amber-500/20 text-amber-200",
  done: "border-emerald-500/35 bg-emerald-500/15 hover:border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-200 line-through opacity-80",
};

export function getCalendarTaskStatusClass(status: string): string {
  return (
    STATUS_CLASSES[status] ??
    "border-primary/25 bg-primary/12 hover:border-primary/40 hover:bg-primary/18 text-foreground"
  );
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface CalendarTaskBarProps {
  segment: WeekSegment<CalendarTask>;
  projectSlug?: string;
  onOpenTask: (taskId: string) => void;
}

export function CalendarTaskBar({
  segment,
  projectSlug,
  onOpenTask,
}: CalendarTaskBarProps) {
  const { task, lane, columnStart, columnEnd, continuesBefore, continuesAfter } = segment;

  const taskKey = projectSlug && task.number != null ? `${projectSlug}-${task.number}` : undefined;
  const range = `${formatDateShort(task.scheduleStart)} – ${formatDateShort(task.scheduleEnd)}`;

  return (
    <button
      type="button"
      style={{
        gridColumn: `${columnStart} / ${columnEnd}`,
        gridRow: lane + 2,
      }}
      title={taskKey ? `${taskKey} · ${task.title} · ${range}` : `${task.title} · ${range}`}
      aria-label={`${task.title} (${range})`}
      data-task-status={task.status}
      onClick={() => onOpenTask(task.id)}
      className={cn(
        "z-10 mb-0.5 flex h-6 min-w-0 items-center overflow-hidden border px-1.5 text-left text-[11px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary sm:h-5 cursor-pointer",
        task.subtasks?.length && "h-auto flex-col items-start gap-1 py-1 sm:h-auto",
        getCalendarTaskStatusClass(task.status),
        continuesBefore ? "rounded-l-none border-l-0" : "ml-0.5 rounded-l-md",
        continuesAfter ? "rounded-r-none border-r-0" : "mr-0.5 rounded-r-md"
      )}
    >
      <span className="w-full truncate">{task.title}</span>
      <CalendarSubtasks subtasks={task.subtasks} />
    </button>
  );
}
export default CalendarTaskBar;
