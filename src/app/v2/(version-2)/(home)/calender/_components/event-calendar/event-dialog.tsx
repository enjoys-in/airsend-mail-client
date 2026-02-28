"use client";

import { useEffect, useMemo, useState } from "react";
import { RiCalendarLine, RiDeleteBinLine, RiAddLine, RiCloseLine, RiMapPinLine, RiRepeatLine, RiGroupLine, RiBookmarkLine } from "@remixicon/react";
import { format, isBefore } from "date-fns";

import type { CalendarEvent, EventColor } from ".";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  StartHour,
  EndHour,
  DefaultStartHour,
  DefaultEndHour,
} from "./constants";
import { useCalDevStore } from "../../_lib/caldev-store";
import type { CalDevAttendee } from "../../_lib/caldev-types";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("blue");
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // New CalDev fields
  const [calendarId, setCalendarId] = useState("");
  const [attendees, setAttendees] = useState<CalDevAttendee[]>([]);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");
  const [newAttendeeName, setNewAttendeeName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [status, setEventStatus] = useState<"CONFIRMED" | "TENTATIVE" | "CANCELLED">("CONFIRMED");

  // CalDev store – calendars list
  const calendars = useCalDevStore((s) => s.calendars);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start);
      setEndDate(end);
      setStartTime(formatTimeForInput(start));
      setEndTime(formatTimeForInput(end));
      setAllDay(event.allDay || false);
      setLocation(event.location || "");
      setColor((event.color as EventColor) || "sky");
      setError(null);

      // CalDev fields — populated from raw event if editing
      const rawEvent = event.id
        ? useCalDevStore.getState().rawEvents.find((e) => e.id === event.id)
        : null;
      if (rawEvent) {
        setCalendarId(rawEvent.calendar_id || "");
        setAttendees(rawEvent.attendees || []);
        setCategories(rawEvent.categories || []);
        setRecurrenceRule(rawEvent.recurrence_rule || "");
        setEventStatus(rawEvent.status || "CONFIRMED");
      } else {
        // New event defaults
        const defaultCal = calendars.find((c) => c.is_default) || calendars[0];
        setCalendarId(defaultCal?.id || "");
        setAttendees([]);
        setCategories([]);
        setRecurrenceRule("");
        setEventStatus("CONFIRMED");
      }
    } else {
      resetForm();
    }
  }, [event, calendars]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime(`${DefaultStartHour}:00`);
    setEndTime(`${DefaultEndHour}:00`);
    setAllDay(false);
    setLocation("");
    setColor("blue");
    setError(null);
    setCalendarId(calendars.find((c) => c.is_default)?.id || calendars[0]?.id || "");
    setAttendees([]);
    setNewAttendeeEmail("");
    setNewAttendeeName("");
    setCategories([]);
    setNewCategory("");
    setRecurrenceRule("");
    setEventStatus("CONFIRMED");
  };

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = Math.floor(date.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        const value = `${formattedHour}:${formattedMinute}`;
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute);
        const label = format(date, "h:mm a");
        options.push({ value, label });
      }
    }
    return options;
  }, []); // Empty dependency array ensures this only runs once

  // Attendee helpers
  const handleAddAttendee = () => {
    if (!newAttendeeEmail.trim()) return;
    if (attendees.some((a) => a.email === newAttendeeEmail.trim())) return;
    setAttendees([
      ...attendees,
      {
        email: newAttendeeEmail.trim(),
        display_name: newAttendeeName.trim() || newAttendeeEmail.trim(),
        role: "REQ-PARTICIPANT",
        status: "NEEDS-ACTION",
        rsvp: true,
        type: "INDIVIDUAL",
      },
    ]);
    setNewAttendeeEmail("");
    setNewAttendeeName("");
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a.email !== email));
  };

  // Category helpers
  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (!cat || categories.includes(cat)) return;
    setCategories([...categories, cat]);
    setNewCategory("");
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleSave = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime
        .split(":")
        .map(Number);
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(
          `Selected time must be between ${StartHour}:00 and ${EndHour}:00`,
        );
        return;
      }

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date");
      return;
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)";

    // Pass ALL data (including CalDev metadata) via onSave.
    // big-calendar handles the single API call — no direct store writes here.
    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
      // CalDev metadata
      calendarId: calendarId || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      categories: categories.length > 0 ? categories : undefined,
      recurrenceRule: recurrenceRule || undefined,
      status: status,
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  // Updated color options to match types.ts
  const colorOptions: Array<{
    value: EventColor;
    label: string;
    bgClass: string;
    borderClass: string;
  }> = [
    {
      value: "blue",
      label: "Blue",
      bgClass: "bg-blue-400 data-[state=checked]:bg-blue-400",
      borderClass: "border-blue-400 data-[state=checked]:border-blue-400",
    },
    {
      value: "violet",
      label: "Violet",
      bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
      borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
    },
    {
      value: "rose",
      label: "Rose",
      bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
      borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
    },
    {
      value: "emerald",
      label: "Emerald",
      bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
      borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
    },
    {
      value: "orange",
      label: "Orange",
      bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
      borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription className="sr-only">
            {event?.id
              ? "Edit the details of this event"
              : "Add a new event to your calendar"}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* ── 2-column Outlook-style layout ── */}
        <div className="grid sm:grid-cols-[1fr_220px] gap-6 py-4">
          {/* Left column — primary fields */}
          <div className="grid gap-4">
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title"
                className="text-base h-10"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 *:not-first:mt-1.5">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant={"outline"}
                      className={cn(
                        "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "truncate text-sm",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </span>
                      <RiCalendarLine
                        size={16}
                        className="text-muted-foreground/80 shrink-0"
                        aria-hidden="true"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      defaultMonth={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          if (isBefore(endDate, date)) {
                            setEndDate(date);
                          }
                          setError(null);
                          setStartDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {!allDay && (
                <div className="min-w-28 *:not-first:mt-1.5">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 *:not-first:mt-1.5">
                <Label htmlFor="end-date">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant={"outline"}
                      className={cn(
                        "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "truncate text-sm",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </span>
                      <RiCalendarLine
                        size={16}
                        className="text-muted-foreground/80 shrink-0"
                        aria-hidden="true"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      defaultMonth={endDate}
                      disabled={{ before: startDate }}
                      onSelect={(date) => {
                        if (date) {
                          setEndDate(date);
                          setError(null);
                          setEndDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {!allDay && (
                <div className="min-w-28 *:not-first:mt-1.5">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="all-day"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked === true)}
              />
              <Label htmlFor="all-day" className="text-sm">All day</Label>
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="location" className="flex items-center gap-1.5">
                <RiMapPinLine size={14} className="text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
              />
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add details"
              />
            </div>
          </div>

          {/* Right column — metadata */}
          <div className="grid gap-4 content-start sm:border-l sm:pl-6 border-border/40">
            {/* Calendar picker */}
            {calendars.length > 0 && (
              <div className="*:not-first:mt-1.5">
                <Label htmlFor="calendar-select" className="text-xs text-muted-foreground uppercase tracking-wide">Calendar</Label>
                <Select value={calendarId} onValueChange={setCalendarId}>
                  <SelectTrigger id="calendar-select" className="h-8 text-sm">
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars
                      .filter((c) => !c.is_readonly)
                      .map((cal) => (
                        <SelectItem key={cal.id} value={cal.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: cal.color }}
                            />
                            {cal.name}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Event status */}
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="event-status" className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
              <Select value={status} onValueChange={(v) => setEventStatus(v as typeof status)}>
                <SelectTrigger id="event-status" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="TENTATIVE">Tentative</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color / etiquette */}
            <fieldset className="space-y-2">
              <legend className="text-xs text-muted-foreground uppercase tracking-wide">
                Color
              </legend>
              <RadioGroup
                className="flex gap-1.5"
                defaultValue={colorOptions[0]?.value}
                value={color}
                onValueChange={(value: EventColor) => setColor(value)}
              >
                {colorOptions.map((colorOption) => (
                  <RadioGroupItem
                    key={colorOption.value}
                    id={`color-${colorOption.value}`}
                    value={colorOption.value}
                    aria-label={colorOption.label}
                    className={cn(
                      "size-5 shadow-none",
                      colorOption.bgClass,
                      colorOption.borderClass,
                    )}
                  />
                ))}
              </RadioGroup>
            </fieldset>

            {/* Recurrence */}
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="recurrence-select" className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <RiRepeatLine size={12} />
                Repeat
              </Label>
              <Select value={recurrenceRule || "none"} onValueChange={(v) => setRecurrenceRule(v === "none" ? "" : v)}>
                <SelectTrigger id="recurrence-select" className="h-8 text-sm">
                  <SelectValue placeholder="Does not repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="FREQ=DAILY">Every day</SelectItem>
                  <SelectItem value="FREQ=WEEKLY">Every week</SelectItem>
                  <SelectItem value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Weekdays</SelectItem>
                  <SelectItem value="FREQ=MONTHLY">Every month</SelectItem>
                  <SelectItem value="FREQ=YEARLY">Every year</SelectItem>
                </SelectContent>
              </Select>
              {recurrenceRule && !["FREQ=DAILY", "FREQ=WEEKLY", "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", "FREQ=MONTHLY", "FREQ=YEARLY"].includes(recurrenceRule) && (
                <div className="mt-2">
                  <Input
                    value={recurrenceRule}
                    onChange={(e) => setRecurrenceRule(e.target.value)}
                    placeholder="FREQ=WEEKLY;BYDAY=MO"
                    className="font-mono text-xs h-8"
                  />
                </div>
              )}
            </div>

            {/* Attendees — compact */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <RiGroupLine size={12} />
                Attendees {attendees.length > 0 && `(${attendees.length})`}
              </Label>
              {attendees.map((a) => (
                <div
                  key={a.email}
                  className="flex items-center justify-between gap-1 text-xs rounded-md border px-2 py-1"
                >
                  <div className="min-w-0 truncate">{a.display_name}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 shrink-0"
                    onClick={() => handleRemoveAttendee(a.email)}
                  >
                    <RiCloseLine size={12} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-1">
                <Input
                  placeholder="Email"
                  value={newAttendeeEmail}
                  onChange={(e) => setNewAttendeeEmail(e.target.value)}
                  className="h-7 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAttendee())}
                />
                <Button variant="outline" size="icon" className="size-7 shrink-0" onClick={handleAddAttendee}>
                  <RiAddLine size={12} />
                </Button>
              </div>
            </div>

            {/* Categories — compact */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <RiBookmarkLine size={12} />
                Categories
              </Label>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1 text-[10px]">
                    {cat}
                    <button onClick={() => handleRemoveCategory(cat)} className="ml-0.5 hover:text-destructive">
                      <RiCloseLine size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  placeholder="Add category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-7 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                />
                <Button variant="outline" size="icon" className="size-7 shrink-0" onClick={handleAddCategory}>
                  <RiAddLine size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              size="icon"
              onClick={handleDelete}
              aria-label="Delete event"
            >
              <RiDeleteBinLine size={16} aria-hidden="true" />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
