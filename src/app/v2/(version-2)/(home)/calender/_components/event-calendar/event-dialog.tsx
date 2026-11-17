"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiAlignLeft,
  RiBookmarkLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiMapPinLine,
  RiRepeatLine,
  RiVideoOnLine,
} from "@remixicon/react";
import { format, isBefore, startOfDay } from "date-fns";

import type { CalendarEvent, EditScope, EventColor } from ".";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  StartHour,
  EndHour,
  DefaultStartHour,
  DefaultEndHour,
} from "./constants";
import { useCalDevStore } from "../../_lib/caldev-store";
import { joinLocation, splitLocation } from "@/lib/calendar/meeting-link";
import { EVENT_COLOR_HEX, type CalDevAttendee } from "../../_lib/caldev-types";
import {
  ChipInput,
  DateTimeRow,
  DayPreview,
  EventTypePanel,
  FieldRow,
  FormCard,
  GuestList,
  IconTile,
  MeetingLinkField,
  PillSelect,
  RepeatField,
  Segmented,
  bareInputClass,
  type PillOption,
  type PreviewEvent,
} from "./event-form";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  /** scope is set for occurrences of a recurring series */
  onDelete: (eventId: string, scope?: EditScope) => void;
}

const SCOPE_OPTIONS: PillOption[] = [
  { value: "occurrence", label: "This event" },
  { value: "series", label: "All events" },
];

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
  const [meetingLink, setMeetingLink] = useState("");
  const [color, setColor] = useState<EventColor>("blue");
  const [error, setError] = useState<string | null>(null);

  // New CalDev fields
  const [calendarId, setCalendarId] = useState("");
  const [attendees, setAttendees] = useState<CalDevAttendee[]>([]);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");
  const [newAttendeeName, setNewAttendeeName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [status, setEventStatus] = useState<"CONFIRMED" | "TENTATIVE" | "CANCELLED">("CONFIRMED");
  // Recurring occurrence: change only this occurrence or every occurrence
  const [editScope, setEditScope] = useState<EditScope>("occurrence");
  const isOccurrence = !!event?.seriesId;

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
      // a meeting link is stored inside location: "Room 42 · https://…"
      const loc = splitLocation(event.location);
      setLocation(loc.place);
      setMeetingLink(loc.link);
      setColor((event.color as EventColor) || "sky");
      setError(null);

      // CalDev fields — populated from raw event if editing
      const rawId = event.seriesId || event.id;
      const rawEvent = rawId
        ? useCalDevStore.getState().rawEvents.find((e) => e.id === rawId)
        : null;
      setEditScope("occurrence");
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
    setMeetingLink("");
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
      location: joinLocation(location, meetingLink),
      color,
      // CalDev metadata
      calendarId: calendarId || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
      categories: categories.length > 0 ? categories : undefined,
      recurrenceRule: recurrenceRule || undefined,
      status: status,
      // occurrence identity (recurring series)
      ...(event?.seriesId && {
        seriesId: event.seriesId,
        occurrenceKey: event.occurrenceKey,
        editScope,
      }),
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id, isOccurrence ? editScope : undefined);
    }
  };

  // ── UI-only wiring (same state as before, new controls) ─────────────────

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    if (isBefore(endDate, date)) setEndDate(date);
    setError(null);
  };

  // Drag / resize of the event in the day timeline -> same fields as the pickers
  const handleDraftChange = (start: Date, end: Date) => {
    const day = startOfDay(start);
    const hhmm = (d: Date) => {
      const m = Math.round((d.getTime() - day.getTime()) / 60000);
      return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    };
    setStartDate(day);
    setEndDate(day);
    setStartTime(hhmm(start));
    setEndTime(hhmm(end));
    setError(null);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    setError(null);
  };

  // "Series" is just a repeating event: it picks the weekly preset, "Event" clears it.
  const handleKindChange = (kind: "event" | "series") =>
    setRecurrenceRule(kind === "series" ? recurrenceRule || "FREQ=WEEKLY" : "");

  const calendarOptions = useMemo<PillOption[]>(
    () =>
      calendars
        .filter((c) => !c.is_readonly)
        .map((c) => ({ value: c.id, label: c.name, color: c.color })),
    [calendars],
  );

  // What the right-hand day timeline shows for the event being edited
  const previewColor =
    calendars.find((c) => c.id === calendarId)?.color ||
    EVENT_COLOR_HEX[color as keyof typeof EVENT_COLOR_HEX] ||
    "#3B82F6";
  const preview = useMemo<PreviewEvent>(() => {
    const at = (date: Date, time: string, edge: "start" | "end") => {
      const d = new Date(date);
      if (allDay) {
        if (edge === "start") d.setHours(0, 0, 0, 0);
        else d.setHours(23, 59, 59, 999);
      } else {
        const [h = 0, m = 0] = time.split(":").map(Number);
        d.setHours(h, m, 0, 0);
      }
      return d;
    };
    const start = at(startDate, startTime, "start");
    const end = at(endDate, endTime, "end");
    return {
      title: title.trim() || "New event",
      start,
      end: end < start ? start : end,
      allDay,
      color: previewColor,
    };
  }, [title, startDate, endDate, startTime, endTime, allDay, previewColor]);

  const isEditing = !!event?.id;

  const typePanel = (idPrefix: string) => (
    <EventTypePanel
      idPrefix={idPrefix}
      calendarOptions={calendarOptions}
      calendarId={calendarId}
      onCalendarChange={setCalendarId}
      status={status}
      onStatusChange={setEventStatus}
      color={color}
      onColorChange={setColor}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl"
      >
        {/* ── Header ── */}
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-border/60 px-5 py-4 text-left">
          <IconTile>
            <RiCalendarEventLine size={18} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold">
              {isEditing ? "Edit event" : "New event"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing ? "Update the details of this event" : "Add the details for your event"}
            </DialogDescription>
          </div>
          <Segmented
            ariaLabel="Event kind"
            value={recurrenceRule ? "series" : "event"}
            onChange={handleKindChange}
            options={[
              { value: "event", label: "Event", icon: <RiCalendarLine size={14} /> },
              { value: "series", label: "Series", icon: <RiRepeatLine size={14} /> },
            ]}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-muted-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <RiCloseLine size={18} />
          </Button>
        </DialogHeader>

        {/* ── Scope (recurring occurrences only) ── */}
        {isOccurrence && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Apply to</span>
              <PillSelect
                value={editScope}
                onChange={(v) => setEditScope(v as EditScope)}
                options={SCOPE_OPTIONS}
                ariaLabel="Apply changes to"
              />
            </div>
          </div>
        )}

        {/* ── Body: form | type + day timeline ── */}
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-0 space-y-4 overflow-y-auto p-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title"
              aria-label="Title"
              className="h-12 rounded-xl border-border/60 bg-background px-4 text-base shadow-none"
            />

            <DateTimeRow
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              allDay={allDay}
              timeOptions={timeOptions}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onAllDayChange={setAllDay}
            />

            <FormCard>
              <FieldRow icon={<RiMapPinLine size={16} />}>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a room or location"
                  aria-label="Location"
                  className={bareInputClass}
                />
              </FieldRow>
              <FieldRow icon={<RiVideoOnLine size={16} />}>
                <MeetingLinkField value={meetingLink} onChange={setMeetingLink} />
              </FieldRow>
              {recurrenceRule && (
                <FieldRow icon={<RiRepeatLine size={16} />}>
                  <RepeatField rule={recurrenceRule} onChange={setRecurrenceRule} startDate={startDate} />
                </FieldRow>
              )}
              <FieldRow icon={<RiBookmarkLine size={16} />}>
                <ChipInput
                  values={categories}
                  draft={newCategory}
                  onDraftChange={setNewCategory}
                  onAdd={handleAddCategory}
                  onRemove={handleRemoveCategory}
                  placeholder="Add categories"
                  ariaLabel="Add category"
                />
              </FieldRow>
            </FormCard>

            <GuestList
              guests={attendees}
              draft={newAttendeeEmail}
              onDraftChange={setNewAttendeeEmail}
              onAdd={handleAddAttendee}
              onRemove={handleRemoveAttendee}
            />

            <FormCard>
              <FieldRow icon={<RiAlignLeft size={16} />}>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Add a description or agenda"
                  aria-label="Description"
                  className="min-h-24 resize-y border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FieldRow>
            </FormCard>

            {/* type panel moves under the form on small screens */}
            <div className="md:hidden">{typePanel("mobile")}</div>
          </div>

          <aside className="hidden min-h-0 flex-col gap-4 border-l border-border/60 bg-muted/20 p-4 md:flex">
            {typePanel("side")}
            <DayPreview
              draft={preview}
              onDraftChange={handleDraftChange}
              excludeId={event?.seriesId || event?.id || undefined}
              className="min-h-[260px] flex-1"
            />
          </aside>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border/60 px-5 py-3 sm:justify-between sm:space-x-0">
          <div>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDelete}
                aria-label={
                  isOccurrence && editScope === "occurrence"
                    ? "Delete this occurrence"
                    : "Delete event"
                }
              >
                <RiDeleteBinLine size={16} aria-hidden="true" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" className="rounded-lg px-5" onClick={handleSave}>
              {isEditing ? "Save" : "Create event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
