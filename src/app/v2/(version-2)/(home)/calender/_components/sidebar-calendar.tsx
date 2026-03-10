"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useCalendarContext } from "./event-calendar/calendar-context";
import { useCalDevStore } from "../_lib/caldev-store";
import { hexToEventColor } from "../_lib/caldev-types";
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
              classNames={{
                day_button:
                  "transition-none! hover:not-in-data-selected:bg-sidebar-accent group-[.range-middle]:group-data-selected:bg-sidebar-accent text-sidebar-foreground",
                today: "*:after:transition-none",
                outside: "data-selected:bg-sidebar-accent/50",
              } as any}
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
