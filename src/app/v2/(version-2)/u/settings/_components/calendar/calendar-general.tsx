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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
} from "../shared";
import {
  ensureDefaultCalendar,
  createAppPassword,
  fetchCalendarConfigArray,
} from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-api";
import { useAppSelector } from "@/store/hooks";

const SYNC_INTERVAL_OPTIONS = [
  { value: "5", label: "Every 5 minutes" },
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "360", label: "Every 6 hours" },
  { value: "1440", label: "Every 24 hours" },
] as const;

interface CalendarGeneralProps {
  local: ICalenderConfig;
  onChange: <K extends keyof ICalenderConfig>(key: K, value: ICalenderConfig[K]) => void;
  onSave?: (config: ICalenderConfig) => Promise<void>;
}

function CalendarGeneral({ local, onChange, onSave }: CalendarGeneralProps) {
  const mid = useAppSelector((s) => s.accounts?.currAccount?.mid);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [calName, setCalName] = useState("");
  const [calColor, setCalColor] = useState("#3B82F6");
  const [nameError, setNameError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  const COLOR_OPTIONS = [
    "#3B82F6", "#0078D4", "#8B5CF6", "#6366F1", "#EC4899",
    "#F43F5E", "#EF4444", "#F97316", "#F59E0B", "#10B981", "#14B8A6",
  ];

  // App password dialog state
  const [showAppPasswordDialog, setShowAppPasswordDialog] = useState(false);
  const [appPassword, setAppPassword] = useState("");
  const [appPasswordLoading, setAppPasswordLoading] = useState(false);

  // Calendar is effectively enabled if flag is true OR there are configured calendars
  const hasConfiguredCalendars = Array.isArray(local.config) && local.config.length > 0;
  const isEffectivelyEnabled = local.enable_calender || hasConfiguredCalendars;
 
  const handleEnableToggle = useCallback(
    async (checked: boolean) => {
      if (checked && !hasConfiguredCalendars) {
        // First-time setup — show dialog
        setCalName("");
        setCalColor("#3B82F6");
        setNameError("");
        setShowSetupDialog(true);
      } else if (checked && hasConfiguredCalendars) {
        // Re-enabling existing calendar — immediately persist so it doesn't get overwritten
        const updated = { ...local, enable_calender: true };
        onChange("enable_calender", true);
        if (onSave) {
          await onSave(updated);
        }
      } else {
        // Disabling — immediately persist
        const updated = { ...local, enable_calender: false };
        onChange("enable_calender", false);
        if (onSave) {
          await onSave(updated);
        }
      }
    },
    [onChange, hasConfiguredCalendars, local, onSave],
  );

  const handleSetupConfirm = useCallback(async () => {
    if (!calName.trim()) {
      setNameError("Calendar name is required");
      return;
    }
    setNameError("");
    setSetupLoading(true);

    try {
      // Provision calendar via JMAP Calendar/set with user's chosen name & color
      const ok = await ensureDefaultCalendar(mid, { name: calName, color: calColor });
      if (!ok) {
        toast.error("Failed to create calendar. Please try again.");
        return;
      }

      // Enable the calendar
      onChange("enable_calender", true);

      setShowSetupDialog(false);

      // Show app password dialog
      setAppPassword("");
      setShowAppPasswordDialog(true);
    } catch (err) {
      console.error('[calendar-general] handleSetupConfirm error:', err);
      toast.error("Failed to create calendar.");
    } finally {
      setSetupLoading(false);
    }
  }, [calName, calColor, onChange, mid]);

  const handleSetupCancel = useCallback(() => {
    setShowSetupDialog(false);
  }, []);

  const handleAppPasswordSubmit = useCallback(async () => {
    if (!appPassword.trim()) return;
    setAppPasswordLoading(true);
    try {
      await createAppPassword("Calendar", appPassword, mid);

      // Fetch JMAP calendars and sync config array to backend
      const configArray = await fetchCalendarConfigArray(mid);
      // Ensure enable_calender is true when saving the new config
      const updatedLocal = { ...local, config: configArray, enable_calender: true };

      // Persist the updated calender_config (with calendar list) to IDB → auto-syncs to backend
      if (onSave) {
        await onSave(updatedLocal);
      }

      toast.success("Calendar enabled and app password created.");
      setShowAppPasswordDialog(false);
      setAppPassword("");
    } catch (err) {
      console.error('[calendar-general] handleAppPasswordSubmit error:', err);
      toast.error("Failed to create app password.");
    } finally {
      setAppPasswordLoading(false);
    }
  }, [appPassword, mid, local, onSave]);

  return (
    <>
      <SettingsSection title="General">
        <SettingToggleRow
          label="Enable calendar"
          tooltip="Turn on/off the integrated calendar feature"
          checked={isEffectivelyEnabled}
          onCheckedChange={handleEnableToggle}
        />
        <SettingToggleRow
          label="Calendar notifications"
          tooltip="Receive notifications for upcoming calendar events"
          checked={local.notifications}
          onCheckedChange={(v) => onChange("notifications", v)}
          disabled={!isEffectivelyEnabled}
        />
        <SettingToggleRow
          label="Calendar sharing"
          tooltip="Allow sharing your calendar with other users"
          checked={local.sharing}
          onCheckedChange={(v) => onChange("sharing", v)}
          disabled={!isEffectivelyEnabled}
        />
      </SettingsSection>

      <SettingsSection title="Synchronization">
        <SettingSelectRow
          label="Sync interval"
          tooltip="How often to sync calendar events with the server"
          value={String(local.calender_sync_interval)}
          onValueChange={(v) => onChange("calender_sync_interval", Number(v))}
          options={[...SYNC_INTERVAL_OPTIONS]}
          disabled={!isEffectivelyEnabled}
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
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      calColor === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setCalColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleSetupCancel} disabled={setupLoading}>Cancel</Button>
            <Button onClick={handleSetupConfirm} disabled={setupLoading}>
              {setupLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enable Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* App Password Dialog — non-dismissable, user must create a password */}
      <Dialog open={showAppPasswordDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} hideCloseButton>
          <DialogHeader>
            <DialogTitle>Create App Password</DialogTitle>
            <DialogDescription>
              An app password is required to complete your calendar setup. This password allows external calendar clients to sync with your calendar securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="app-password">App Password</Label>
              <Input
                id="app-password"
                type="password"
                placeholder="Enter a secure password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appPassword.trim() && handleAppPasswordSubmit()}
              />
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Use this password</strong> to connect your calendar with <strong>Apple Calendar</strong>, <strong>Microsoft Outlook</strong>, <strong>Thunderbird</strong>, or any CalDAV-compatible app. You'll need your email address and this app password to sign in.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAppPasswordSubmit}
              disabled={!appPassword.trim() || appPasswordLoading}
            >
              {appPasswordLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(CalendarGeneral);
