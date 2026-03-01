"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { RiCheckLine, RiAddLine, RiMoreLine, RiPencilLine, RiDeleteBinLine, RiPaletteLine } from "@remixicon/react";
import { useCalendarContext } from "./event-calendar/calendar-context";
import { useCalDevStore } from "../_lib/caldev-store";
import { hexToEventColor } from "../_lib/caldev-types";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarCalendar from "./sidebar-calendar";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import SubscriptionsPanel from "./subscriptions-panel";

// Default color palette for creating calendars
const CALENDAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#F97316", "#F43F5E", "#10B981",
  "#EF4444", "#EC4899", "#6366F1", "#14B8A6", "#F59E0B",
];

export function CalenderSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isColorVisible, toggleColorVisibility } = useCalendarContext();

  // CalDev store
  const calendars = useCalDevStore((s) => s.calendars);
  const addCalendar = useCalDevStore((s) => s.addCalendar);
  const editCalendar = useCalDevStore((s) => s.editCalendar);
  const removeCalendar = useCalDevStore((s) => s.removeCalendar);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<string | null>(null);
  const [calName, setCalName] = useState("");
  const [calColor, setCalColor] = useState(CALENDAR_COLORS[0]);
  const [calDesc, setCalDesc] = useState("");

  const openCreateDialog = () => {
    setEditingCalendar(null);
    setCalName("");
    setCalColor(CALENDAR_COLORS[Math.floor(Math.random() * CALENDAR_COLORS.length)]);
    setCalDesc("");
    setDialogOpen(true);
  };

  const openEditDialog = (cal: typeof calendars[0]) => {
    setEditingCalendar(cal.id);
    setCalName(cal.name);
    setCalColor(cal.color);
    setCalDesc(cal.description || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!calName.trim()) return;
    if (editingCalendar) {
      await editCalendar(editingCalendar, { name: calName, color: calColor, description: calDesc });
    } else {
      await addCalendar(calName, calColor, calDesc);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await removeCalendar(id);
  };

  return (
    <>
      <Sidebar
        variant="inset"
        {...props}
        className="dark scheme-only-dark max-lg:p-3 lg:pe-1"
      >
      
        <SidebarContent className="gap-0 mt-3 pt-3 border-t">
          <SidebarGroup className="px-1">
          </SidebarGroup>

          {/* My Calendars */}
          <SidebarGroup className="px-1 mt-3 pt-4 border-t">
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
                                <span className="text-[10px] text-muted-foreground/50 uppercase">read-only</span>
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
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <button className="size-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent transition-opacity">
                                    <RiMoreLine size={14} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-32 dark bg-sidebar">
                                  <DropdownMenuItem onClick={() => openEditDialog(cal)}>
                                    <RiPencilLine size={14} className="mr-2" /> Rename
                                  </DropdownMenuItem>
                                  {!cal.is_default && (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleDelete(cal.id)}
                                    >
                                      <RiDeleteBinLine size={14} className="mr-2" /> Delete
                                    </DropdownMenuItem>
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

          {/* External Subscriptions */}
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
    </>
  );
}
