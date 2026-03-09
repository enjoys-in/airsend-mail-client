"use client";

import { memo, useState, useCallback } from "react";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
} from "../shared";

const CALDEV_BASE_URL =
  (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__?.CALDEV_URL) || process.env.CALDEV_URL || "http://localhost:8443";

const SYNC_INTERVAL_OPTIONS = [
  { value: "5", label: "Every 5 minutes" },
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "360", label: "Every 6 hours" },
  { value: "1440", label: "Every 24 hours" },
] as const;

type CalendarEntry = ICalenderConfig["config"][number];

interface CalendarGeneralProps {
  local: ICalenderConfig;
  onChange: <K extends keyof ICalenderConfig>(key: K, value: ICalenderConfig[K]) => void;
  onAddCalendar?: (entry: CalendarEntry) => void;
}

function CalendarGeneral({ local, onChange, onAddCalendar }: CalendarGeneralProps) {
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [calName, setCalName] = useState("");
  const [calUrl, setCalUrl] = useState(CALDEV_BASE_URL);
  const [nameError, setNameError] = useState("");

  const handleEnableToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Opening — pre-fill defaults
        setCalName("");
        setCalUrl(CALDEV_BASE_URL);
        setNameError("");
        setShowSetupDialog(true);
      } else {
        onChange("enable_calender", false);
      }
    },
    [onChange],
  );

  const handleSetupConfirm = useCallback(() => {
    if (!calName.trim()) {
      setNameError("Calendar name is required");
      return;
    }
    setNameError("");

    // Enable the calendar
    onChange("enable_calender", true);

    // Auto-add the calendar entry if handler is provided
    if (onAddCalendar) {
      const entry: CalendarEntry = {
        calendar_id: crypto.randomUUID(),
        calendar_name: calName.trim(),
        calender_url: calUrl.trim() || CALDEV_BASE_URL,
        sync_status: "pending",
        last_synced_at: null,
        sync_error: null,
      };
      onAddCalendar(entry);
    }

    setShowSetupDialog(false);
  }, [calName, calUrl, onChange, onAddCalendar]);

  const handleSetupCancel = useCallback(() => {
    setShowSetupDialog(false);
  }, []);

  return (
    <>
      <SettingsSection title="General">
        <SettingToggleRow
          label="Enable calendar"
          tooltip="Turn on/off the integrated calendar feature"
          checked={local.enable_calender}
          onCheckedChange={handleEnableToggle}
        />
        <SettingToggleRow
          label="Calendar notifications"
          tooltip="Receive notifications for upcoming calendar events"
          checked={local.notifications}
          onCheckedChange={(v) => onChange("notifications", v)}
          disabled={!local.enable_calender}
        />
        <SettingToggleRow
          label="Calendar sharing"
          tooltip="Allow sharing your calendar with other users"
          checked={local.sharing}
          onCheckedChange={(v) => onChange("sharing", v)}
          disabled={!local.enable_calender}
        />
      </SettingsSection>

      <SettingsSection title="Synchronization">
        <SettingSelectRow
          label="Sync interval"
          tooltip="How often to sync calendar events with the server"
          value={String(local.calender_sync_interval)}
          onValueChange={(v) => onChange("calender_sync_interval", Number(v))}
          options={[...SYNC_INTERVAL_OPTIONS]}
          disabled={!local.enable_calender}
        />
      </SettingsSection>

      {/* Setup dialog shown when user enables calendar */}
      <Dialog open={showSetupDialog} onOpenChange={(v) => { if (!v) handleSetupCancel(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up your calendar</DialogTitle>
            <DialogDescription>
              Provide a name for your calendar. The URL is pre-filled with the default CalDAV server.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="setup-cal-name">Calendar name</Label>
              <Input
                id="setup-cal-name"
                placeholder="My Calendar"
                value={calName}
                onChange={(e) => { setCalName(e.target.value); setNameError(""); }}
              />
              {nameError && <p className="text-destructive text-xs">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-cal-url">Calendar URL</Label>
              <Input
                id="setup-cal-url"
                placeholder={CALDEV_BASE_URL}
                value={calUrl}
                onChange={(e) => setCalUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Default: {CALDEV_BASE_URL}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleSetupCancel}>Cancel</Button>
            <Button onClick={handleSetupConfirm}>Enable Calendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(CalendarGeneral);
