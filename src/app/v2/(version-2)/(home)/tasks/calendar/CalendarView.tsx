"use client";

import React, { useMemo, useState, useCallback } from "react";
import { addMonths, startOfMonth, subMonths, parseISO } from "date-fns";
import { useTasks } from "../_lib/tasks-context";
import { CalendarToolbar } from "./CalendarToolbar";
import { MonthGrid } from "./MonthGrid";
import { MonthAgenda } from "./MonthAgenda";
import { buildMonthWeeks } from "./month-grid-model";
import type { CalendarTask } from "./CalendarTaskBar";
import type { TaskItem } from "../_lib/tasks-types";

function parseDateSafe(val?: string | null): Date | null {
  if (!val) return null;
  const d = parseISO(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function CalendarView() {
  const { filteredTasks, currentProject, setSelectedTask } = useTasks();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

  const handlePreviousMonth = useCallback(() => {
    setVisibleMonth((current) => subMonths(current, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setVisibleMonth((current) => addMonths(current, 1));
  }, []);

  const handleToday = useCallback(() => {
    setVisibleMonth(startOfMonth(new Date()));
  }, []);

  const scheduledTasks = useMemo<CalendarTask[]>(() => {
    const list: CalendarTask[] = [];

    for (const t of filteredTasks) {
      const pStart = parseDateSafe(t.startDate) ?? parseDateSafe(t.dueDate);
      const pEnd = parseDateSafe(t.dueDate) ?? parseDateSafe(t.startDate);

      if (!pStart && !pEnd) continue;

      const scheduleStart = pStart && pEnd && pStart > pEnd ? pEnd : (pStart ?? new Date());
      const scheduleEnd = pStart && pEnd && pStart > pEnd ? pStart : (pEnd ?? scheduleStart);

      list.push({
        id: t.id,
        title: t.title,
        status: t.status,
        originalTask: t,
        scheduleStart,
        scheduleEnd,
        subtasks: t.subtasks?.map((s) => ({ id: s.id, title: s.title })),
      });
    }

    return list;
  }, [filteredTasks]);

  const weeks = useMemo(() => buildMonthWeeks(visibleMonth, 0), [visibleMonth]);

  const handleOpenTask = useCallback(
    (taskId: string) => {
      const task = scheduledTasks.find((t) => t.id === taskId);
      if (task?.originalTask) {
        setSelectedTask(task.originalTask);
      }
    },
    [scheduledTasks, setSelectedTask]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <CalendarToolbar
        visibleMonth={visibleMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {scheduledTasks.length === 0 ? (
        <div className="border-b border-border/80 px-4 py-3 text-center bg-muted/10">
          <p className="text-xs font-medium text-muted-foreground">
            No scheduled tasks with start or due dates for this project
          </p>
        </div>
      ) : null}

      <div className="hidden sm:flex flex-1 min-h-0 flex-col">
        <MonthGrid
          weeks={weeks}
          tasks={scheduledTasks}
          visibleMonth={visibleMonth}
          projectSlug={currentProject?.slug}
          onOpenTask={handleOpenTask}
        />
      </div>

      <div className="flex sm:hidden flex-1 min-h-0 flex-col">
        <MonthAgenda
          tasks={scheduledTasks}
          visibleMonth={visibleMonth}
          projectSlug={currentProject?.slug}
          onOpenTask={handleOpenTask}
        />
      </div>
    </div>
  );
}
export default CalendarView;
