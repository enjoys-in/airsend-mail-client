"use client";

import React, { useMemo } from "react";
import { useTasks } from "../_lib/tasks-context";
import { buildTimelineWindow, differenceInDays } from "./timeline";
import { GanttTaskBar } from "./GanttTaskBar";
import { TasksEmptyState } from "../navigation/TasksEmptyState";
import { cn } from "@/lib/utils";

const DAY_WIDTH = 48;

export function GanttView() {
  const { filteredTasks, setSelectedTask } = useTasks();

  const { days, startDate } = useMemo(
    () => buildTimelineWindow(filteredTasks),
    [filteredTasks]
  );

  const today = useMemo(() => new Date(), []);
  const todayOffset = differenceInDays(today, startDate);

  if (filteredTasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex flex-1 overflow-x-auto overflow-y-auto">
        {/* Left fixed tasks list */}
        <div className="w-56 shrink-0 border-r border-border/50 bg-card z-10 sticky left-0 shadow-xs">
          <div className="h-12 border-b border-border/40 px-3 flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20">
            Task
          </div>
          <div className="divide-y divide-border/20">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="h-12 px-3 flex items-center justify-between text-xs hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <span className="truncate font-medium text-foreground">{t.title}</span>
                <span className="font-mono text-[10px] text-muted-foreground ml-2 shrink-0">
                  {t.ticketId}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right timeline grid */}
        <div className="flex flex-col relative" style={{ width: `${days.length * DAY_WIDTH}px` }}>
          {/* Header row with days */}
          <div className="h-12 border-b border-border/40 flex sticky top-0 bg-background/95 backdrop-blur z-5">
            {days.map((d, idx) => {
              const isToday =
                d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear();

              return (
                <div
                  key={idx}
                  style={{ width: `${DAY_WIDTH}px` }}
                  className={cn(
                    "flex flex-col items-center justify-center border-r border-border/30 text-center shrink-0",
                    isToday && "bg-primary/5 font-semibold text-primary"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                  <span className={cn("text-xs", isToday ? "text-primary font-bold" : "text-foreground")}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Today indicator vertical line */}
          {todayOffset >= 0 && todayOffset < days.length && (
            <div
              style={{ left: `${todayOffset * DAY_WIDTH + DAY_WIDTH / 2}px` }}
              className="absolute top-12 bottom-0 w-px bg-primary z-2 pointer-events-none"
            />
          )}

          {/* Task Timeline Rows */}
          <div className="divide-y divide-border/20">
            {filteredTasks.map((t) => (
              <div key={t.id} className="h-12 relative flex items-center">
                {/* Background grid vertical lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {days.map((_, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${DAY_WIDTH}px` }}
                      className="border-r border-border/20 shrink-0 h-full"
                    />
                  ))}
                </div>

                <GanttTaskBar
                  task={t}
                  timelineStart={startDate}
                  dayWidth={DAY_WIDTH}
                  onSelect={() => setSelectedTask(t)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
