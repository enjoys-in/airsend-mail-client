"use client";

import { memo, useState, useEffect, useCallback } from "react";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import { SettingsPageHeader, SaveSettingsBar } from "./shared";
import CalendarGeneral from "./calendar/calendar-general";
import ConnectedCalendars from "./calendar/connected-calendars";
import { toast } from "sonner";

/* ---- defaults (used before API data arrives) ---- */
const DEFAULT_CALENDAR: ICalenderConfig = {
  enable_calender: false,
  calender_sync_interval: 15,
  notifications: true,
  sharing: false,
  config: [],
};

type CalendarEntry = ICalenderConfig["config"][number];

/* ------------------------------------------------------------------ */
function CalendarSettings({ email }: { email: string }) {
  const { settings, save, isSaving } = useSettingsPersist(email);

  const [local, setLocal] = useState<ICalenderConfig>(DEFAULT_CALENDAR);
  const [dirty, setDirty] = useState(false);

  /* ---- hydrate from store once ---- */
  useEffect(() => {
    if (settings?.calender_config) {
      setLocal(settings.calender_config);
    }
  }, [settings?.calender_config]);

  /* ---- field-level updater (memoised — passed to children) ---- */
  const handleChange = useCallback(
    <K extends keyof ICalenderConfig>(key: K, value: ICalenderConfig[K]) => {
      setLocal((prev) => ({ ...prev, [key]: value }));
      setDirty(true);
    },
    [],
  );

  /* ---- calendar list mutations ---- */
  const handleAddCalendar = useCallback((entry: CalendarEntry) => {
    setLocal((prev) => ({ ...prev, config: [...prev.config, entry] }));
    setDirty(true);
  }, []);

  const handleRemoveCalendar = useCallback((calendarId: string) => {
    setLocal((prev) => ({
      ...prev,
      config: prev.config.filter((c) => c.calendar_id !== calendarId),
    }));
    setDirty(true);
  }, []);

  /* ---- reset ---- */
  const handleReset = useCallback(() => {
    if (settings?.calender_config) {
      setLocal(settings.calender_config);
    } else {
      setLocal(DEFAULT_CALENDAR);
    }
    setDirty(false);
  }, [settings?.calender_config]);

  /* ---- persist ---- */
  const handleSave = async () => {
    if (local.enable_calender) {
      // Must have at least one calendar when enabled
      if (!local.config || local.config.length === 0) {
        return toast.error("Please add at least one calendar before saving.");
      }
      // Validate every calendar has a name and URL
      const invalid = local.config.find((c) => !c.calendar_name?.trim() || !c.calender_url?.trim());
      if (invalid) {
        return toast.error("Each calendar must have a name and URL.");
      }
    }
    await save("calender_config", local);
    setDirty(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <SettingsPageHeader
          title="Calendar"
          description="Manage calendar preferences and connected external calendars."
        />

        <CalendarGeneral local={local} onChange={handleChange} onAddCalendar={handleAddCalendar} />

        <ConnectedCalendars
          calendars={local.config}
          disabled={!local.enable_calender}
          onAdd={handleAddCalendar}
          onRemove={handleRemoveCalendar}
        />

        <SaveSettingsBar
          onSave={handleSave}
          onReset={handleReset}
          show={dirty}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

export default memo(CalendarSettings);
