"use client";

import React, { useMemo } from "react";
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns";

import {
  DraggableEvent,
  DroppableCell,
  EventItem,
  isMultiDayEvent,
  useCurrentTimeIndicator,
  WeekCellsHeight,
  type CalendarEvent,
} from ".";
import { StartHour, EndHour } from "./constants";
import { cn } from "@/lib/utils";

/** Fixed-width time gutter + 7 equal day columns (the gutter used to be as wide as a day). */
const WEEK_GRID =
  "grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] sm:grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate],
  );

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  // Get all-day events and multi-day events for the week
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Include explicitly marked all-day events or multi-day events
        return event.allDay || isMultiDayEvent(event);
      })
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return days.some(
          (day) =>
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd),
        );
      });
  }, [events, days]);

  // Process events for each day to calculate positions
  const processedDayEvents = useMemo(() => {
    const result = days.map((day) => {
      // Get events for this day that are not all-day events or multi-day events
      const dayEvents = events.filter((event) => {
        // Skip all-day events and multi-day events
        if (event.allDay || isMultiDayEvent(event)) return false;

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        // Check if event is on this day
        return (
          isSameDay(day, eventStart) ||
          isSameDay(day, eventEnd) ||
          (eventStart < day && eventEnd > day)
        );
      });

      // Sort events by start time and duration
      const sortedEvents = [...dayEvents].sort((a, b) => {
        const aStart = new Date(a.start);
        const bStart = new Date(b.start);
        const aEnd = new Date(a.end);
        const bEnd = new Date(b.end);

        // First sort by start time
        if (aStart < bStart) return -1;
        if (aStart > bStart) return 1;

        // If start times are equal, sort by duration (longer events first)
        const aDuration = differenceInMinutes(aEnd, aStart);
        const bDuration = differenceInMinutes(bEnd, bStart);
        return bDuration - aDuration;
      });

      // Calculate positions for each event
      const positionedEvents: PositionedEvent[] = [];
      const dayStart = startOfDay(day);

      // Track columns for overlapping events
      const columns: { event: CalendarEvent; end: Date }[][] = [];

      sortedEvents.forEach((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        // Adjust start and end times if they're outside this day
        const adjustedStart = isSameDay(day, eventStart)
          ? eventStart
          : dayStart;
        const adjustedEnd = isSameDay(day, eventEnd)
          ? eventEnd
          : addHours(dayStart, 24);

        // Calculate top position and height
        const startHour =
          getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
        const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

        // Adjust the top calculation to account for the new start time
        const top = (startHour - StartHour) * WeekCellsHeight;
        const height = (endHour - startHour) * WeekCellsHeight;

        // Find a column for this event
        let columnIndex = 0;
        let placed = false;

        while (!placed) {
          const col = columns[columnIndex] || [];
          if (col.length === 0) {
            columns[columnIndex] = col;
            placed = true;
          } else {
            const overlaps = col.some((c) =>
              areIntervalsOverlapping(
                { start: adjustedStart, end: adjustedEnd },
                {
                  start: new Date(c.event.start),
                  end: new Date(c.event.end),
                },
              ),
            );
            if (!overlaps) {
              placed = true;
            } else {
              columnIndex++;
            }
          }
        }

        // Ensure column is initialized before pushing
        const currentColumn = columns[columnIndex] || [];
        columns[columnIndex] = currentColumn;
        currentColumn.push({ event, end: adjustedEnd });

        // Calculate width and left position based on number of columns
        const width = columnIndex === 0 ? 1 : 0.9;
        const left = columnIndex === 0 ? 0 : columnIndex * 0.1;

        positionedEvents.push({
          event,
          top,
          height,
          left,
          width,
          zIndex: 10 + columnIndex, // Higher columns get higher z-index
        });
      });

      return positionedEvents;
    });

    return result;
  }, [days, events]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const showAllDaySection = allDayEvents.length > 0;
  const { currentTimePosition, currentTimeVisible, currentTime } = useCurrentTimeIndicator(
    currentDate,
    "week",
  );

  return (
    <div data-slot="week-view" className="flex h-full flex-col">
      <div className={cn(WEEK_GRID, "bg-background/80 border-border/40 sticky top-0 z-30 border-b backdrop-blur-xl")}>
        <div className="text-muted-foreground/60 border-border/40 flex items-end justify-end border-r pe-2 pb-2 text-[10px] sm:pe-3">
          <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="group flex flex-col items-center gap-0.5 py-1.5"
            data-today={isToday(day) || undefined}
          >
            <span className="text-muted-foreground/70 group-data-[today]:text-primary text-[10px] font-medium uppercase tracking-wide sm:text-[11px]">
              {format(day, "EEE")}
            </span>
            <span className="text-foreground/90 group-data-[today]:bg-primary group-data-[today]:text-primary-foreground flex size-7 items-center justify-center rounded-full text-sm font-medium tabular-nums">
              {format(day, "d")}
            </span>
          </div>
        ))}
      </div>

      {showAllDaySection && (
        <div className="border-border/40 bg-muted/50 border-b">
          <div className={WEEK_GRID}>
            <div className="border-border/40 relative border-r">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                All day
              </span>
            </div>
            {days.map((day, dayIndex) => {
              const dayAllDayEvents = allDayEvents.filter((event) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return (
                  isSameDay(day, eventStart) ||
                  (day > eventStart && day < eventEnd) ||
                  isSameDay(day, eventEnd)
                );
              });

              return (
                <div
                  key={day.toString()}
                  className="border-border/40 relative border-r p-1 last:border-r-0"
                  data-today={isToday(day) || undefined}
                >
                  {dayAllDayEvents.map((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const isFirstDay = isSameDay(day, eventStart);
                    const isLastDay = isSameDay(day, eventEnd);

                    // Check if this is the first day in the current week view
                    const isFirstVisibleDay =
                      dayIndex === 0 && isBefore(eventStart, weekStart);
                    const shouldShowTitle = isFirstDay || isFirstVisibleDay;

                    return (
                      <EventItem
                        key={`spanning-${event.id}`}
                        onClick={(e) => handleEventClick(event, e)}
                        event={event}
                        view="month"
                        isFirstDay={isFirstDay}
                        isLastDay={isLastDay}
                      >
                        {/* Show title if it's the first day of the event or the first visible day in the week */}
                        <div
                          className={cn(
                            "truncate",
                            !shouldShowTitle && "invisible",
                          )}
                          aria-hidden={!shouldShowTitle}
                        >
                          {event.title}
                        </div>
                      </EventItem>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={cn(WEEK_GRID, "flex-1")}>
        <div className="border-border/40 relative border-r grid auto-cols-fr">
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/40 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
            >
              {/* 12 AM sits on the top edge: keep it inside the row so the header can't cover it */}
              <span
                className={cn(
                  "bg-background text-muted-foreground/70 absolute left-0 flex h-6 w-full items-center justify-end pe-2 text-[10px] tabular-nums sm:pe-3 sm:text-[11px]",
                  index === 0 ? "top-0" : "-top-3",
                )}
              >
                {format(hour, "h a")}
              </span>
            </div>
          ))}
          {/* Current time label in the gutter */}
          {currentTimeVisible && currentTime && (
            <div
              className="pointer-events-none absolute right-1 z-30 -translate-y-1/2"
              style={{ top: `${currentTimePosition}%` }}
            >
              <span className="rounded bg-red-500 px-1 py-0.5 text-[10px] font-semibold leading-none tabular-nums text-white shadow-sm">
                {format(currentTime, "h:mm a")}
              </span>
            </div>
          )}
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={day.toString()}
            className="border-border/40 relative border-r last:border-r-0 grid auto-cols-fr"
            data-today={isToday(day) || undefined}
          >
            {/* Positioned events */}
            {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
              <div
                key={positionedEvent.event.id}
                className="absolute z-10 px-0.5"
                style={{
                  top: `${positionedEvent.top}px`,
                  height: `${positionedEvent.height}px`,
                  left: `${positionedEvent.left * 100}%`,
                  width: `${positionedEvent.width * 100}%`,
                  zIndex: positionedEvent.zIndex,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-full w-full">
                  <DraggableEvent
                    event={positionedEvent.event}
                    view="week"
                    onClick={(e) => handleEventClick(positionedEvent.event, e)}
                    showTime
                    height={positionedEvent.height}
                  />
                </div>
              </div>
            ))}

            {/* Current time indicator - dotted across the whole week, solid on today */}
            {currentTimeVisible && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                {isToday(day) ? (
                  <div className="relative flex items-center">
                    <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-background"></div>
                    <div className="h-[2px] w-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"></div>
                  </div>
                ) : (
                  <div className="w-full border-t-2 border-dotted border-red-500/50"></div>
                )}
              </div>
            )}
            {hours.map((hour) => {
              const hourValue = getHours(hour);
              return (
                <div
                  key={hour.toString()}
                  className="border-border/40 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
                >
                  {/* Quarter-hour intervals */}
                  {[0, 1, 2, 3].map((quarter) => {
                    const quarterHourTime = hourValue + quarter * 0.25;
                    return (
                      <DroppableCell
                        key={`${hour.toString()}-${quarter}`}
                        id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                        date={day}
                        time={quarterHourTime}
                        className={cn(
                          "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                          quarter === 0 && "top-0",
                          quarter === 1 &&
                            "top-[calc(var(--week-cells-height)/4)]",
                          quarter === 2 &&
                            "top-[calc(var(--week-cells-height)/4*2)]",
                          quarter === 3 &&
                            "top-[calc(var(--week-cells-height)/4*3)]",
                        )}
                        onClick={() => {
                          const startTime = new Date(day);
                          startTime.setHours(hourValue);
                          startTime.setMinutes(quarter * 15);
                          onEventCreate(startTime);
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
