"use client";

import { memo } from "react";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";
import {
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
} from "../shared";

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
}

function CalendarGeneral({ local, onChange }: CalendarGeneralProps) {
  return (
    <>
      <SettingsSection title="General">
        <SettingToggleRow
          label="Enable calendar"
          tooltip="Turn on/off the integrated calendar feature"
          checked={local.enable_calender}
          onCheckedChange={(v) => onChange("enable_calender", v)}
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
    </>
  );
}

export default memo(CalendarGeneral);
