"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { type TaskItem } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TasksCalendarView() {
  const { filteredTasks, setSelectedTask, setIsCreateOpen } = useTasks();
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const { daysInMonth, startDayIndex } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startDayIndex: firstDay.getDay(),
    };
  }, [year, month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<number, TaskItem[]>();
    for (const t of filteredTasks) {
      if (!t.dueDate) continue;
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(t);
      }
    }
    return map;
  }, [filteredTasks, year, month]);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="flex h-full flex-col p-4 md:p-6 overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            {monthName} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={goToday} className="h-7 text-xs">
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="size-8">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="size-8">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 border-b border-border/50 text-center text-xs font-semibold text-muted-foreground pb-2 shrink-0">
        {DAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 grid-rows-5 gap-px bg-border/40 flex-1 rounded-xl overflow-hidden border border-border/40 mt-2">
        {Array.from({ length: startDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-muted/10 p-2 min-h-20" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && today.getDate() === day;
          const dayTasks = tasksByDay.get(day) || [];

          return (
            <div
              key={day}
              className={cn(
                "group relative bg-card p-2 min-h-20 flex flex-col justify-between hover:bg-muted/30 transition-colors overflow-hidden",
                isToday && "bg-primary/5 ring-1 ring-primary/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "size-5 flex items-center justify-center rounded-full text-xs font-medium",
                    isToday ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                  )}
                >
                  {day}
                </span>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground size-5 flex items-center justify-center rounded transition-opacity"
                  title="Add task"
                >
                  <Plus className="size-3" />
                </button>
              </div>

              {/* Task Chips */}
              <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-20">
                {dayTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-left text-[11px] truncate transition-colors",
                      t.status === "done"
                        ? "bg-muted/40 text-muted-foreground line-through"
                        : "bg-primary/10 text-foreground hover:bg-primary/20"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        t.priority === "urgent" && "bg-red-500",
                        t.priority === "high" && "bg-orange-500",
                        t.priority === "medium" && "bg-amber-500",
                        t.priority === "low" && "bg-blue-500",
                        t.priority === "none" && "bg-muted-foreground"
                      )}
                    />
                    <span className="truncate">{t.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
