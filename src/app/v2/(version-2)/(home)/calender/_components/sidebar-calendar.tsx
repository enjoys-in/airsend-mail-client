"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useCalendarContext } from "./event-calendar/calendar-context";
import { useCalDevStore } from "../_lib/caldev-store";
import { hexToEventColor, type CalDevEvent } from "../_lib/caldev-types";
import { Calendar } from "@/components/ui/calendar";
import type { DayContentProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiAddLine,
  RiMoreLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiPaletteLine,
  RiDownloadLine,
  RiUploadLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiMapPinLine,
} from "@remixicon/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import SubscriptionsPanel from "./subscriptions-panel";

// Default color palette for creating calendars
const CALENDAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#F97316", "#F43F5E", "#10B981",
  "#EF4444", "#EC4899", "#6366F1", "#14B8A6", "#F59E0B",
];

interface SidebarCalendarProps {
  className?: string;
}

export default function SidebarCalendar({ className }: SidebarCalendarProps) {
  const { currentDate, setCurrentDate, isColorVisible, toggleColorVisibility } =
    useCalendarContext();

  // Track the month to display in the calendar
  const [calendarMonth, setCalendarMonth] = useState<Date>(currentDate);

  // CalDev store
  const calendars = useCalDevStore((s) => s.calendars);
  const rawEvents = useCalDevStore((s) => s.rawEvents);
  const addCalendar = useCalDevStore((s) => s.addCalendar);
  const editCalendar = useCalDevStore((s) => s.editCalendar);
  const removeCalendar = useCalDevStore((s) => s.removeCalendar);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<string | null>(null);
  const [calName, setCalName] = useState("");
  const [calColor, setCalColor] = useState(CALENDAR_COLORS[0]);
  const [calDesc, setCalDesc] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Hidden file input for ICS import
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importTargetCalId, setImportTargetCalId] = useState<string>("");

  // Expanded upcoming event (for agenda)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Update the calendar month whenever currentDate changes
  useEffect(() => {
    setCalendarMonth(currentDate);
  }, [currentDate]);

  // ── Compute event-dot dates for the visible month ──
  const eventDotDates = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    // include a few days before/after for outside-days
    const rangeStart = new Date(year, month, -6);
    const rangeEnd = new Date(year, month + 1, 7);

    const dateMap = new Map<string, string[]>(); // "YYYY-MM-DD" → color hex[]

    for (const ev of rawEvents) {
      const start = new Date(ev.dtstart);
      const end = new Date(ev.dtend || ev.dtstart);
      if (end < rangeStart || start > rangeEnd) continue;

      // Find the calendar to get its color
      const cal = calendars.find((c) => c.id === ev.calendar_id);
      if (!cal) continue;
      const color = cal.color;

      // For multi-day events, place a dot on each day in range
      const cursor = new Date(Math.max(start.getTime(), rangeStart.getTime()));
      const limit = new Date(Math.min(end.getTime(), rangeEnd.getTime()));
      while (cursor <= limit) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        const existing = dateMap.get(key) || [];
        if (!existing.includes(color)) existing.push(color);
        dateMap.set(key, existing);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return dateMap;
  }, [rawEvents, calendars, calendarMonth]);

  // ── Upcoming meetings (max 3, today first, then nearest future day) ──
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get future/current events sorted by start time
    const future = rawEvents
      .filter((e) => {
        const end = new Date(e.dtend || e.dtstart);
        return end >= now && e.status !== "CANCELLED";
      })
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());

    // Try to fill from today first
    const todayEvts = future.filter((e) => {
      const s = new Date(e.dtstart);
      return s.getFullYear() === todayStart.getFullYear() &&
        s.getMonth() === todayStart.getMonth() &&
        s.getDate() === todayStart.getDate();
    });

    if (todayEvts.length >= 2) return todayEvts.slice(0, 3);

    // Not enough today — grab the next upcoming events across any day
    return future.slice(0, 3);
  }, [rawEvents]);

  // ── Custom DayContent with event dots ──
  const DayContentWithDots = useCallback(
    (props: DayContentProps) => {
      const d = props.date;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const colors = eventDotDates.get(key);
      return (
        <div className="relative flex flex-col items-center">
          <span>{d.getDate()}</span>
          {colors && colors.length > 0 && (
            <span className="flex gap-[2px] absolute -bottom-0.5">
              {colors.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  className="size-1 rounded-full"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
          )}
        </div>
      );
    },
    [eventDotDates],
  );

  const handleSelect = (date: Date | undefined) => {
    if (date) setCurrentDate(date);
  };

  const openCreateDialog = () => {
    setEditingCalendar(null);
    setCalName("");
    setCalColor(
      CALENDAR_COLORS[Math.floor(Math.random() * CALENDAR_COLORS.length)],
    );
    setCalDesc("");
    setDialogOpen(true);
  };

  const openEditDialog = (cal: (typeof calendars)[0]) => {
    setEditingCalendar(cal.id);
    setCalName(cal.name);
    setCalColor(cal.color);
    setCalDesc(cal.description || "");
    setDialogOpen(true);
  };

  const openColorPicker = (cal: (typeof calendars)[0]) => {
    setEditingCalendar(cal.id);
    setCalName(cal.name);
    setCalColor(cal.color);
    setCalDesc(cal.description || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!calName.trim()) return;
    if (editingCalendar) {
      await editCalendar(editingCalendar, {
        name: calName,
        color: calColor,
        description: calDesc,
      });
    } else {
      await addCalendar(calName, calColor, calDesc);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await removeCalendar(deleteTarget.id);
    setDeleteTarget(null);
  };

  // ── ICS Import ──
  const handleImportClick = (calId: string) => {
    setImportTargetCalId(calId);
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importTargetCalId) return;

    if (!file.name.endsWith(".ics") && !file.name.endsWith(".ical")) {
      toast.error("Please select a valid .ics file");
      return;
    }

    try {
      const text = await file.text();
      if (!text.includes("BEGIN:VCALENDAR")) {
        toast.error("Invalid ICS file");
        return;
      }
      // Import via CalDev API
      const { caldevInstance } = await import("@/lib/api/api.instance");
      await caldevInstance.post(`/api/calendars/${importTargetCalId}/import`, text, {
        headers: { "Content-Type": "text/calendar" },
      });
      toast.success(`Events imported into calendar`);
      // Refresh events
      const { lastFetchRange } = useCalDevStore.getState();
      if (lastFetchRange) {
        useCalDevStore.getState().fetchEvents(lastFetchRange.after, lastFetchRange.before, true);
      }
    } catch {
      toast.error("Failed to import ICS file");
    } finally {
      // Reset file input
      e.target.value = "";
      setImportTargetCalId("");
    }
  };

  // ── ICS Export ──
  const handleExport = async (calId: string, calName: string) => {
    try {
      const { caldevInstance } = await import("@/lib/api/api.instance");
      const { data } = await caldevInstance.get(`/api/calendars/${calId}/export`, {
        responseType: "blob",
      });
      const blob = new Blob([data], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${calName.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export calendar");
    }
  };

  return (
    <>
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className={cn("w-full flex justify-center", className)}>
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleSelect}
              month={calendarMonth}
              showOutsideDays
              onMonthChange={setCalendarMonth}
              components={{
                DayContent: DayContentWithDots,
              }}
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* ── My Calendars ── */}
          <SidebarGroup className="px-1">
            <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center justify-between">
              <span>Calendars</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={openCreateDialog}
              >
                <RiAddLine size={14} />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {calendars.map((cal) => {
                  const eventColor = hexToEventColor(cal.color);
                  return (
                    <SidebarMenuItem key={cal.id}>
                      <SidebarMenuButton
                        asChild
                        className="relative rounded-md [&>svg]:size-auto justify-between has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px]"
                      >
                        <span>
                          <span className="font-medium flex items-center justify-between gap-3">
                            <Checkbox
                              id={cal.id}
                              className="sr-only peer"
                              checked={isColorVisible(eventColor)}
                              onCheckedChange={() =>
                                toggleColorVisibility(eventColor)
                              }
                            />
                            <RiCheckLine
                              className="peer-not-data-[state=checked]:invisible"
                              size={16}
                              aria-hidden="true"
                            />
                            <label
                              htmlFor={cal.id}
                              className="peer-not-data-[state=checked]:line-through peer-not-data-[state=checked]:text-muted-foreground/65 after:absolute after:inset-0 flex items-center gap-2"
                            >
                              {cal.name}
                              {cal.is_readonly && (
                                <span className="text-[10px] text-muted-foreground/50 uppercase">
                                  read-only
                                </span>
                              )}
                            </label>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="size-1.5 rounded-full"
                              style={{ backgroundColor: cal.color }}
                            />
                            {!cal.is_readonly && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button className="size-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent transition-opacity">
                                    <RiMoreLine size={14} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="min-w-36"
                                >
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(cal)}
                                  >
                                    <RiPencilLine size={14} className="mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openColorPicker(cal)}
                                  >
                                    <RiPaletteLine size={14} className="mr-2" />
                                    Change color
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleImportClick(cal.id)}
                                  >
                                    <RiUploadLine size={14} className="mr-2" />
                                    Import ICS
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleExport(cal.id, cal.name)}
                                  >
                                    <RiDownloadLine size={14} className="mr-2" />
                                    Export ICS
                                  </DropdownMenuItem>
                                  {!cal.is_default && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() =>
                                          setDeleteTarget({ id: cal.id, name: cal.name })
                                        }
                                      >
                                        <RiDeleteBinLine
                                          size={14}
                                          className="mr-2"
                                        />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </span>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── External Subscriptions ── */}
          <SubscriptionsPanel />

          {/* ── Upcoming Meetings ── */}
          {upcomingEvents.length > 0 && (
            <SidebarGroup className="px-1">
              <SidebarGroupLabel className="uppercase text-muted-foreground/65 flex items-center gap-1.5">
                <RiCalendarEventLine size={14} />
                <span>Upcoming</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="flex flex-col gap-0 px-2">
                  {upcomingEvents.map((ev, idx) => {
                    const cal = calendars.find((c) => c.id === ev.calendar_id);
                    const start = new Date(ev.dtstart);
                    const end = ev.dtend ? new Date(ev.dtend) : null;
                    const isToday = (() => {
                      const now = new Date();
                      return start.getFullYear() === now.getFullYear() &&
                        start.getMonth() === now.getMonth() &&
                        start.getDate() === now.getDate();
                    })();
                    const isExpanded = expandedEventId === ev.id;

                    const timeFmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const timeLabel = ev.all_day
                      ? "All day"
                      : `${timeFmt(start)}${end ? ` – ${timeFmt(end)}` : ""}`;

                    const dateLabel = isToday
                      ? "Today"
                      : start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

                    // Gap to next event
                    const nextEv = upcomingEvents[idx + 1];
                    let gapLabel: string | null = null;
                    if (nextEv && end) {
                      const nextStart = new Date(nextEv.dtstart);
                      const gapMs = nextStart.getTime() - end.getTime();
                      if (gapMs > 0) {
                        const gapMin = Math.round(gapMs / 60000);
                        if (gapMin < 60) gapLabel = `${gapMin}m gap`;
                        else {
                          const h = Math.floor(gapMin / 60);
                          const m = gapMin % 60;
                          gapLabel = m > 0 ? `${h}h ${m}m gap` : `${h}h gap`;
                        }
                      }
                    }

                    return (
                      <div key={ev.id}>
                        <button
                          onClick={() => {
                            setExpandedEventId(isExpanded ? null : ev.id);
                            setCurrentDate(start);
                          }}
                          className={cn(
                            "w-full text-left rounded-lg border border-transparent p-2 transition-all hover:bg-sidebar-accent/60",
                            isExpanded && "bg-sidebar-accent/40 border-border",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="mt-1.5 size-2 shrink-0 rounded-full"
                              style={{ backgroundColor: cal?.color || "#6366F1" }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate text-sidebar-foreground">
                                {ev.summary || "Untitled event"}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <RiTimeLine size={11} className="shrink-0 text-muted-foreground/60" />
                                <span className="text-[11px] text-muted-foreground">
                                  {dateLabel} · {timeLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded agenda */}
                          {isExpanded && (
                            <div className="mt-2 ml-4 space-y-1.5 text-xs text-muted-foreground">
                              {ev.location && (
                                <div className="flex items-center gap-1.5">
                                  <RiMapPinLine size={12} className="shrink-0" />
                                  <span className="truncate">{ev.location}</span>
                                </div>
                              )}
                              {ev.description ? (
                                <p className="whitespace-pre-wrap line-clamp-4 leading-relaxed">
                                  {ev.description}
                                </p>
                              ) : (
                                <p className="italic text-muted-foreground/50">No description</p>
                              )}
                              {cal && (
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span
                                    className="size-1.5 rounded-full"
                                    style={{ backgroundColor: cal.color }}
                                  />
                                  <span className="text-[11px]">{cal.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Gap indicator between events */}
                        {gapLabel && (
                          <div className="flex items-center gap-2 px-4 py-0.5">
                            <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
                            <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">{gapLabel}</span>
                            <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>


      </Sidebar>

      {/* Create / Edit Calendar Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>
              {editingCalendar ? "Edit Calendar" : "New Calendar"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="cal-name">Name</Label>
              <Input
                id="cal-name"
                value={calName}
                onChange={(e) => setCalName(e.target.value)}
                placeholder="Work, Personal, etc."
              />
            </div>
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="cal-desc">Description</Label>
              <Input
                id="cal-desc"
                value={calDesc}
                onChange={(e) => setCalDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="*:not-first:mt-1.5">
              <Label>Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {CALENDAR_COLORS.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "size-7 rounded-full border-2 transition-all",
                      calColor === c
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setCalColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCalendar ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for ICS import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".ics,.ical"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              All events in this calendar will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
