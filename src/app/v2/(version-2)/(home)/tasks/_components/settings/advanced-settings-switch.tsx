import { useTranslation } from "react-i18next";
import { PreferenceSwitchRow } from "@tasks/_components/settings/preferences/preference-switch-row";
import { useUserPreferencesStore } from "@tasks/_store/user-preferences";

export function AdvancedSettingsSwitch() {
  const { t } = useTranslation();
  const advancedSettings = useUserPreferencesStore(
    (state) => state.advancedSettings,
  );
  const setAdvancedSettings = useUserPreferencesStore(
    (state) => state.setAdvancedSettings,
  );

  return (
    <PreferenceSwitchRow
      title={t("settings:advancedSettings")}
      description={t("settings:advancedSettingsDescription")}
      checked={advancedSettings}
      onCheckedChange={setAdvancedSettings}
    />
  );
}
