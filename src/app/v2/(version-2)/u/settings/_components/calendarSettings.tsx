"use client";

import { memo, useState, useEffect, useCallback } from "react";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import { SettingsPageHeader, SaveSettingsBar } from "./shared";
import CalendarGeneral from "./calendar/calendar-general";
import ConnectedCalendars from "./calendar/connected-calendars";
import { toast } from "sonner";
import { useUserConfigStore } from "@/store/settings/user-config";

/* ---- defaults (used before API data arrives) ---- */
const DEFAULT_CALENDAR: ICalenderConfig = {
  enable_calender: false,
  calender_sync_interval: 15,
  notifications: true,
  sharing: false,
  config: [],
};

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

  /* ---- reset ---- */
  const handleReset = useCallback(() => {
    if (settings?.calender_config) {
      setLocal(settings.calender_config);
    } else {
      setLocal(DEFAULT_CALENDAR);
    }
    setDirty(false);
  }, [settings?.calender_config]);

  /* ---- persist & re-hydrate (called after app password created) ---- */
  const handleSaveAndHydrate = useCallback(async (config: ICalenderConfig) => {
    await save("calender_config", config);
    // Re-hydrate user-config store so sidebar/feature flags update immediately
    if (settings) {
      useUserConfigStore.getState().hydrate({ ...settings, calender_config: config });
    }
    setDirty(false);
  }, [save, settings]);

  /* ---- sync config array from CalDev calendars to backend ---- */
  const handleConfigSync = useCallback(
    (configArray: ICalenderConfig["config"]) => {
      setLocal((prev) => {
        const next = { ...prev, config: configArray };
        // Fire-and-forget save to IDB → auto-syncs to backend via dexie-observable
        save("calender_config", next);
        if (settings) {
          useUserConfigStore.getState().hydrate({ ...settings, calender_config: next });
        }
        return next;
      });
    },
    [save, settings],
  );

  /* ---- persist ---- */
  const handleSave = async () => {
    await save("calender_config", local);
    useUserConfigStore.getState().hydrate({ ...settings, calender_config: local });
    setDirty(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <SettingsPageHeader
          title="Calendar"
          description="Manage calendar preferences and connected external calendars."
        />

        <CalendarGeneral local={local} onChange={handleChange} onSave={handleSaveAndHydrate} />

        <ConnectedCalendars
          disabled={!local.enable_calender}
          onConfigSync={handleConfigSync}
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
