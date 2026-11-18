"use client";

import { memo, useState, useEffect, useCallback } from "react";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";
import { useSettingsPersist } from "@/hooks/use-settings-persist";
import { SettingsPageHeader, SaveSettingsBar } from "./shared";
import CalendarGeneral from "./calendar/calendar-general";
import ConnectedCalendars from "./calendar/connected-calendars";
import { useUserConfigStore } from "@/store/settings/user-config";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ---- defaults (used before API data arrives) ---- */
const DEFAULT_CALENDAR: ICalenderConfig = {
  enable_calender: false,
  calender_sync_interval: 15,
  notifications: true,
  sharing: false,
  config: [],
};

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

  /* ---- field-level updater ---- */
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

  /* ---- persist & re-hydrate ---- */
  const handleSaveAndHydrate = useCallback(async (config: ICalenderConfig) => {
    await save("calender_config", config);
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
    if (settings) {
      useUserConfigStore.getState().hydrate({ ...settings, calender_config: local });
    }
    setDirty(false);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Calendar"
        description="Configure CalDAV server synchronization, reminders, sharing, and subscribed external calendar feeds."
        icon={<Calendar className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Scheduling</Badge>}
      />

      <div className="space-y-6">
        <CalendarGeneral local={local} onChange={handleChange} onSave={handleSaveAndHydrate} />

        <ConnectedCalendars
          disabled={!local.enable_calender}
          onConfigSync={handleConfigSync}
        />
      </div>

      <SaveSettingsBar
        onSave={handleSave}
        onReset={handleReset}
        show={dirty}
        isSaving={isSaving}
      />
    </div>
  );
}

export default memo(CalendarSettings);
