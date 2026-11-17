"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { RiAddLine, RiCalendarLine } from "@remixicon/react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { pickerNavClassNames } from "../../picker-classnames";
import { PillSelect, type PillOption } from "./pill-select";
import { pillClass } from "./primitives";

/** Date shown as a pill; opens a month picker. */
export function DatePill({
  value,
  onChange,
  disabledBefore,
  ariaLabel,
}: {
  value: Date;
  onChange: (date: Date) => void;
  disabledBefore?: Date;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={ariaLabel} className={pillClass}>
          <RiCalendarLine size={14} className="text-muted-foreground" aria-hidden="true" />
          {format(value, "d MMM yyyy")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          classNames={pickerNavClassNames}
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(date);
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface DateTimeRowProps {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  allDay: boolean;
  timeOptions: PillOption[];
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onAllDayChange: (allDay: boolean) => void;
}

/**
 * `[date] [09:00] – [10:00] [end date]   All day ◯   GMT+5:30`
 * The end date pill appears for all-day / multi-day events, or on demand.
 */
export function DateTimeRow({
  startDate,
  endDate,
  startTime,
  endTime,
  allDay,
  timeOptions,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onAllDayChange,
}: DateTimeRowProps) {
  const [endDateRequested, setEndDateRequested] = useState(false);
  const showEndDate = allDay || endDateRequested || !isSameDay(startDate, endDate);
  const timeContent = "max-h-64";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <DatePill value={startDate} onChange={onStartDateChange} ariaLabel="Start date" />
        {!allDay && (
          <PillSelect
            value={startTime}
            onChange={onStartTimeChange}
            options={timeOptions}
            ariaLabel="Start time"
            chevron={false}
            contentClassName={timeContent}
          />
        )}
        <span className="text-muted-foreground" aria-hidden="true">–</span>
        {!allDay && (
          <PillSelect
            value={endTime}
            onChange={onEndTimeChange}
            options={timeOptions}
            ariaLabel="End time"
            chevron={false}
            contentClassName={timeContent}
          />
        )}
        {showEndDate ? (
          <DatePill
            value={endDate}
            onChange={onEndDateChange}
            disabledBefore={startDate}
            ariaLabel="End date"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEndDateRequested(true)}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <RiAddLine size={14} aria-hidden="true" />
            End date
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
          <Switch checked={allDay} onCheckedChange={onAllDayChange} aria-label="All day" />
          All day
        </label>
        <span className="text-muted-foreground">
          Timezone <span className="font-medium text-primary">{format(new Date(), "O")}</span>
        </span>
      </div>
    </div>
  );
}
