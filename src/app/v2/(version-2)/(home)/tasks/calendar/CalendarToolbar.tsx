"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarToolbarProps {
  visibleMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarToolbar({
  visibleMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarToolbarProps) {
  const monthName = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between border-b border-border/80 px-4 py-2.5 shrink-0 bg-background/50">
      <div className="flex items-center gap-2.5">
        <CalendarIcon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground tracking-tight">
          {monthName}
        </h2>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-7 px-2.5 text-xs font-medium"
        >
          Today
        </Button>
        <div className="flex items-center gap-0.5 border border-border/60 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="size-6 rounded hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="size-6 rounded hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
export default CalendarToolbar;
