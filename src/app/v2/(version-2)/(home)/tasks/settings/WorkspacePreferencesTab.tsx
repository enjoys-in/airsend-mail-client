"use client";

import React, { useState } from "react";
import { Sliders, CalendarDays, Bell, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function WorkspacePreferencesTab() {
  const [weekStart, setWeekStart] = useState("monday");
  const [defaultView, setDefaultView] = useState("board");
  const [emailNotify, setEmailNotify] = useState(true);
  const [pushNotify, setPushNotify] = useState(true);

  const handleSave = () => {
    toast.success("Preferences saved successfully");
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <h4 className="text-xs font-semibold text-foreground">Preferences</h4>
        <p className="text-[11px] text-muted-foreground">
          Customize your task viewing experience and notifications
        </p>
      </div>

      <div className="space-y-3">
        {/* Week Start */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <CalendarDays className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Week Starts On</div>
              <div className="text-[11px] text-muted-foreground">Choose first day of the week in calendar and timeline</div>
            </div>
          </div>
          <Select value={weekStart} onValueChange={(val) => { setWeekStart(val); handleSave(); }}>
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday" className="text-xs">Sunday</SelectItem>
              <SelectItem value="monday" className="text-xs">Monday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Default View */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Sliders className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Default Project View</div>
              <div className="text-[11px] text-muted-foreground">The initial view loaded when opening a project</div>
            </div>
          </div>
          <Select value={defaultView} onValueChange={(val) => { setDefaultView(val); handleSave(); }}>
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="board" className="text-xs">Board</SelectItem>
              <SelectItem value="list" className="text-xs">List</SelectItem>
              <SelectItem value="calendar" className="text-xs">Calendar</SelectItem>
              <SelectItem value="gantt" className="text-xs">Timeline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Bell className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Email Notifications</div>
              <div className="text-[11px] text-muted-foreground">Send email when a task is assigned to you</div>
            </div>
          </div>
          <Switch
            checked={emailNotify}
            onCheckedChange={(val) => { setEmailNotify(val); handleSave(); }}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Bell className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">In-App Notifications</div>
              <div className="text-[11px] text-muted-foreground">Show badges and toasts for task updates</div>
            </div>
          </div>
          <Switch
            checked={pushNotify}
            onCheckedChange={(val) => { setPushNotify(val); handleSave(); }}
          />
        </div>
      </div>
    </div>
  );
}
