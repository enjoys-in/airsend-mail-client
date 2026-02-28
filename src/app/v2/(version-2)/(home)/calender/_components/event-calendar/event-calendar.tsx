"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useCalendarContext } from "./calendar-context";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import {
  addHoursToDate,
  AgendaDaysToShow,
  AgendaView,
  CalendarDndProvider,
  CalendarEvent,
  CalendarView,
  DayView,
  EventDialog,
  EventGap,
  EventHeight,
  MonthView,
  WeekCellsHeight,
  WeekView,
} from ".";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { ScrollToHour } from "./constants";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
  initialView?: CalendarView;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
}: EventCalendarProps) {
  const { currentDate, setCurrentDate } = useCalendarContext();
  const [view, setView] = useState<CalendarView>(initialView);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  // Auto-scroll to business hours when switching to week/day view
  useEffect(() => {
    if ((view === "week" || view === "day") && scrollRef.current) {
      // Small delay to let the DOM render the time grid
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = ScrollToHour * WeekCellsHeight;
        }
      });
    }
  }, [view]);

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month");
          break;
        case "w":
          setView("week");
          break;
        case "d":
          setView("day");
          break;
        case "a":
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEventDialogOpen]);

  const handlePrevious = useCallback(() => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, -1));
    else if (view === "agenda") setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
  }, [view, currentDate, setCurrentDate]);

  const handleNext = useCallback(() => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, 1));
    else if (view === "agenda") setCurrentDate(addDays(currentDate, AgendaDaysToShow));
  }, [view, currentDate, setCurrentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, []);

  const handleEventCreate = useCallback((startTime: Date) => {
    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        startTime.setMinutes(minutes - remainder);
      } else {
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: startTime,
      end: addHoursToDate(startTime, 1),
      allDay: false,
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  }, []);

  const handleEventSave = useCallback((event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event);
      toast(`Event "${event.title}" updated`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    } else {
      onEventAdd?.(event);
      toast(`Event "${event.title}" added`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    }
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  }, [onEventAdd, onEventUpdate]);

  const handleEventDelete = useCallback((eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId);
    onEventDelete?.(eventId);
    setIsEventDialogOpen(false);
    setSelectedEvent(null);

    if (deletedEvent) {
      toast(`Event "${deletedEvent.title}" deleted`, {
        description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
        position: "bottom-left",
      });
    }
  }, [events, onEventDelete]);

  const handleEventUpdate = useCallback((updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent);
    toast(`Event "${updatedEvent.title}" moved`, {
      description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
      position: "bottom-left",
    });
  }, [onEventUpdate]);

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} – ${format(end, "MMM yyyy")}`;
      }
    } else if (view === "day") {
      return format(currentDate, "EEE, MMM d, yyyy");
    } else if (view === "agenda") {
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} – ${format(end, "MMM yyyy")}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  }, [currentDate, view]);

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        {/* ── Fixed header ── */}
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2",
            "border-b border-border/40 bg-background/95 backdrop-blur-sm",
            className,
          )}
        >
          <div className="flex items-center justify-between w-full px-4">
            {/* Left: title */}
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium truncate">
                {viewTitle}
              </h2>
            </div>

            {/* Right: nav + view tabs + actions */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                  onClick={handlePrevious}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                  onClick={handleNext}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                onClick={handleToday}
              >
                Today
              </Button>

              <Separator orientation="vertical" className="mx-1 h-4 bg-border/40" />

              {/* View switcher tabs — active view is highlighted */}
              <div className="hidden sm:flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
                {(["day", "week", "month"] as CalendarView[]).map(
                  (v) => (
                    <Button
                      key={v}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2.5 text-xs font-medium capitalize transition-all duration-150",
                        view === v
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setView(v)}
                    >
                      {v}
                    </Button>
                  ),
                )}
              </div>

              {/* Mobile-only dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                    >
                      <span className="capitalize">{view}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-32">
                    <DropdownMenuItem onClick={() => setView("day")}>
                      Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView("week")}>
                      Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView("month")}>
                      Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEventDialogOpen(true);
                }}
                aria-label="New Event"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* ── Scrollable content area ── */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  );
}
