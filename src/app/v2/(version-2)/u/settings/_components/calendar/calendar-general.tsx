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
import { Loader2, Calendar, Bell, Share2, RefreshCw, KeyRound, Sparkles } from "lucide-react";
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
        // Re-enabling existing calendar — immediately persist
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
      const ok = await ensureDefaultCalendar(mid, { name: calName, color: calColor });
      if (!ok) {
        toast.error("Failed to create calendar. Please try again.");
        return;
      }

      onChange("enable_calender", true);
      setShowSetupDialog(false);

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
      const configArray = await fetchCalendarConfigArray(mid);
      const updatedLocal = { ...local, config: configArray, enable_calender: true };

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
      <SettingsSection
        title="Calendar Features"
        description="Core scheduling, event notifications, and sharing settings"
        icon={<Calendar className="size-4" />}
      >
        <SettingToggleRow
          label="Enable CalDAV Calendar"
          description="Activate integrated calendars, event scheduling, and Apple/Outlook sync"
          tooltip="Turn on/off the integrated calendar feature"
          checked={isEffectivelyEnabled}
          onCheckedChange={handleEnableToggle}
        />
        <SettingToggleRow
          label="Event notifications & reminders"
          description="Receive in-app and audio reminders for approaching calendar appointments"
          tooltip="Receive notifications for upcoming calendar events"
          icon={<Bell className="size-4 text-primary" />}
          checked={local.notifications}
          onCheckedChange={(v) => onChange("notifications", v)}
          disabled={!isEffectivelyEnabled}
        />
        <SettingToggleRow
          label="Calendar availability sharing"
          description="Allow teammates and external contacts to view your public free/busy schedule"
          tooltip="Allow sharing your calendar with other users"
          icon={<Share2 className="size-4 text-primary" />}
          checked={local.sharing}
          onCheckedChange={(v) => onChange("sharing", v)}
          disabled={!isEffectivelyEnabled}
        />
      </SettingsSection>

      <SettingsSection
        title="Server Synchronization"
        description="Frequency of background CalDAV sync loops"
        icon={<RefreshCw className="size-4" />}
      >
        <SettingSelectRow
          label="Background sync interval"
          description="How often events are synced between your local cache and the CalDAV server"
          tooltip="How often to sync calendar events with the server"
          value={String(local.calender_sync_interval)}
          onValueChange={(v) => onChange("calender_sync_interval", Number(v))}
          options={[...SYNC_INTERVAL_OPTIONS]}
          disabled={!isEffectivelyEnabled}
          triggerClassName="sm:w-[190px]"
        />
      </SettingsSection>

      {/* Setup dialog shown when user enables calendar */}
      <Dialog open={showSetupDialog} onOpenChange={(v) => { if (!v) handleSetupCancel(); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Set up your calendar</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Provide a name and custom accent color for your primary personal calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="setup-cal-name" className="text-xs sm:text-sm font-medium">Calendar name</Label>
              <Input
                id="setup-cal-name"
                placeholder="e.g. My Schedule, Work Calendar"
                value={calName}
                onChange={(e) => { setCalName(e.target.value); setNameError(""); }}
                className="h-9 text-xs sm:text-sm rounded-xl"
              />
              {nameError && <p className="text-destructive text-xs">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Accent Color</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`size-7 rounded-full border-2 transition-all ${
                      calColor === c ? "border-foreground scale-110 shadow-xs" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setCalColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleSetupCancel} disabled={setupLoading} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSetupConfirm} disabled={setupLoading} className="rounded-xl px-4">
              {setupLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enable Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* App Password Dialog */}
      <Dialog open={showAppPasswordDialog} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md rounded-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideCloseButton
        >
          <DialogHeader>
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <KeyRound className="size-5" />
            </div>
            <DialogTitle>Create App Password</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              An application password is required for CalDAV sync with external apps like Apple Calendar, Outlook, or Thunderbird.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="app-password" className="text-xs sm:text-sm font-medium">App Password</Label>
              <Input
                id="app-password"
                type="password"
                placeholder="Enter a secure sync password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && appPassword.trim() && handleAppPasswordSubmit()}
                className="h-9 text-xs sm:text-sm rounded-xl"
              />
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
              <p className="text-xs text-foreground leading-relaxed">
                Use your email address along with this app password when connecting Apple Calendar or Thunderbird.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAppPasswordSubmit}
              disabled={!appPassword.trim() || appPasswordLoading}
              className="rounded-xl w-full sm:w-auto px-5"
            >
              {appPasswordLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Password & Finish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(CalendarGeneral);
