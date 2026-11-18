"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CalendarTask } from "./CalendarTaskBar";
import { CalendarSubtasks } from "./calendar-subtasks";
import { getCalendarTaskStatusClass } from "./CalendarTaskBar";
import { cn } from "@/lib/utils";

interface DayOverflowPopoverProps {
  day: Date;
  tasks: CalendarTask[];
  hiddenCount: number;
  projectSlug?: string;
  onOpenTask: (taskId: string) => void;
}

export function DayOverflowPopover({
  day,
  tasks,
  hiddenCount,
  projectSlug,
  onOpenTask,
}: DayOverflowPopoverProps) {
  const [open, setOpen] = useState(false);

  const dayLabel = day.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleSelectTask = (taskId: string) => {
    setOpen(false);
    onOpenTask(taskId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Tasks for ${dayLabel}`}
          className="w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40 cursor-pointer"
        >
          +{hiddenCount} more
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 bg-popover border border-border/80 shadow-md">
        <div className="space-y-1.5">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {dayLabel}
          </p>
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => handleSelectTask(task.id)}
                className={cn(
                  "flex w-full min-w-0 flex-col items-start gap-0.5 rounded-md border p-1.5 text-left transition-colors cursor-pointer",
                  getCalendarTaskStatusClass(task.status)
                )}
              >
                {projectSlug && task.number != null && (
                  <span className="text-[10px] text-muted-foreground">
                    {projectSlug}-{task.number}
                  </span>
                )}
                <span className="w-full truncate text-xs font-medium">
                  {task.title}
                </span>
                <CalendarSubtasks subtasks={task.subtasks} />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
export default DayOverflowPopover;
