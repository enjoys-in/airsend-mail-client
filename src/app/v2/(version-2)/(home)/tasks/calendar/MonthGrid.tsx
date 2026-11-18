"use client";

import React, { useMemo } from "react";
import { format, isSameMonth, isToday, isWeekend } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarTaskBar, type CalendarTask } from "./CalendarTaskBar";
import { DayOverflowPopover } from "./DayOverflowPopover";
import { packWeekLanes } from "./month-grid-model";

interface MonthGridProps {
  weeks: Date[][];
  tasks: CalendarTask[];
  visibleMonth: Date;
  maxLanes?: number;
  projectSlug?: string;
  onOpenTask: (taskId: string) => void;
}

export function MonthGrid({
  weeks,
  tasks,
  visibleMonth,
  maxLanes = 3,
  projectSlug,
  onOpenTask,
}: MonthGridProps) {
  const weekdayTemplate = weeks[0] ?? [];
  const layouts = useMemo(
    () => weeks.map((week) => packWeekLanes(week, tasks, maxLanes)),
    [weeks, tasks, maxLanes]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto select-none">
      <div className="sticky top-0 z-20 grid grid-cols-7 border-b border-border bg-background/95 backdrop-blur">
        {weekdayTemplate.map((day) => (
          <div
            key={`weekday-${day.toISOString()}`}
            className="border-r border-border/50 px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {format(day, "EEE")}
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border/60">
        {weeks.map((week, weekIndex) => {
          const { segments, hiddenCountByDay, tasksByDay } = layouts[weekIndex];

          return (
            <div
              key={`week-${week[0].toISOString()}`}
              className="relative grid min-h-24 flex-1 grid-cols-7 divide-x divide-border/50"
              style={{
                gridTemplateRows: `auto repeat(${maxLanes}, min-content) auto`,
              }}
            >
              {week.map((day, dayIndex) => (
                <div
                  key={`cell-bg-${day.toISOString()}`}
                  style={{ gridColumn: dayIndex + 1, gridRow: "1 / -1" }}
                  className={cn(
                    "min-w-0 transition-colors pointer-events-none",
                    isWeekend(day) && "bg-muted/15"
                  )}
                />
              ))}

              {week.map((day, dayIndex) => {
                const today = isToday(day);
                const currentMonth = isSameMonth(day, visibleMonth);
                return (
                  <div
                    key={`number-${day.toISOString()}`}
                    style={{ gridColumn: dayIndex + 1, gridRow: 1 }}
                    className="z-10 flex justify-end px-1.5 py-1"
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[11px] font-medium",
                        !currentMonth && "text-muted-foreground/40",
                        currentMonth && !today && "text-muted-foreground",
                        today && "bg-primary text-primary-foreground font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}

              {segments.map((segment) => (
                <CalendarTaskBar
                  key={`bar-${segment.task.id}-${segment.columnStart}`}
                  segment={segment}
                  projectSlug={projectSlug}
                  onOpenTask={onOpenTask}
                />
              ))}

              {week.map((day, dayIndex) =>
                hiddenCountByDay[dayIndex] > 0 ? (
                  <div
                    key={`overflow-${day.toISOString()}`}
                    style={{ gridColumn: dayIndex + 1, gridRow: maxLanes + 2 }}
                    className="z-10 min-w-0 p-0.5"
                  >
                    <DayOverflowPopover
                      day={day}
                      tasks={tasksByDay[dayIndex]}
                      hiddenCount={hiddenCountByDay[dayIndex]}
                      projectSlug={projectSlug}
                      onOpenTask={onOpenTask}
                    />
                  </div>
                ) : null
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default MonthGrid;
