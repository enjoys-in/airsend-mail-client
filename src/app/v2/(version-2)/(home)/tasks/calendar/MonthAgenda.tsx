"use client";

import React, { useMemo, useRef, useLayoutEffect } from "react";
import { format, isBefore, isToday, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { buildMonthAgenda } from "./month-agenda-model";
import {
  type CalendarTask,
  getCalendarTaskStatusClass,
} from "./CalendarTaskBar";
import { CalendarSubtasks } from "./calendar-subtasks";

interface MonthAgendaProps {
  tasks: CalendarTask[];
  visibleMonth: Date;
  projectSlug?: string;
  onOpenTask: (taskId: string) => void;
}

export function MonthAgenda({
  tasks,
  visibleMonth,
  projectSlug,
  onOpenTask,
}: MonthAgendaProps) {
  const agenda = useMemo(
    () => buildMonthAgenda(visibleMonth, tasks),
    [visibleMonth, tasks]
  );

  const today = startOfToday();
  const anchorIndex = agenda.findIndex(({ day }) => !isBefore(day, today));
  const listRef = useRef<HTMLOListElement>(null);
  const anchorRef = useRef<HTMLLIElement>(null);

  useLayoutEffect(() => {
    if (listRef.current && anchorRef.current) {
      listRef.current.scrollTop = anchorRef.current.offsetTop;
    }
  }, [visibleMonth]);

  if (agenda.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">No tasks scheduled for this month</p>
      </div>
    );
  }

  return (
    <ol ref={listRef} className="relative min-h-0 flex-1 overflow-y-auto divide-y divide-border/60">
      {agenda.map(({ day, tasks: dayTasks }, index) => {
        const isCurrentDay = isToday(day);
        return (
          <li
            key={day.toISOString()}
            ref={index === anchorIndex ? anchorRef : undefined}
            className="p-3"
          >
            <div
              className={cn(
                "sticky top-0 z-10 flex items-baseline gap-2 bg-background/95 py-1 text-xs font-medium text-muted-foreground backdrop-blur",
                isCurrentDay && "text-foreground font-semibold"
              )}
            >
              <span className="text-sm font-bold tabular-nums">
                {format(day, "d")}
              </span>
              <span>{isCurrentDay ? "Today" : format(day, "EEEE")}</span>
            </div>

            <ul className="mt-2 flex flex-col gap-1.5">
              {dayTasks.map((task) => {
                const taskKey =
                  projectSlug && task.number != null
                    ? `${projectSlug}-${task.number}`
                    : undefined;
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => onOpenTask(task.id)}
                      className={cn(
                        "flex w-full flex-col justify-center gap-0.5 rounded-md border p-2 text-left transition-colors cursor-pointer",
                        getCalendarTaskStatusClass(task.status)
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {taskKey && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {taskKey}
                          </span>
                        )}
                        <span className="text-xs font-medium truncate flex-1">
                          {task.title}
                        </span>
                      </div>
                      <CalendarSubtasks subtasks={task.subtasks} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
export default MonthAgenda;
