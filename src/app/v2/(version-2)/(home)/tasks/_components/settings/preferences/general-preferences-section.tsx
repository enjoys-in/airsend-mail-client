import { useTranslation } from "react-i18next";
import { DefaultViewRow } from "@tasks/_components/settings/preferences/default-view-row";
import { LanguageRow } from "@tasks/_components/settings/preferences/language-row";
import { PreferenceSwitchRow } from "@tasks/_components/settings/preferences/preference-switch-row";
import { PriorityIconsRow } from "@tasks/_components/settings/preferences/priority-icons-row";
import { WeekStartRow } from "@tasks/_components/settings/preferences/week-start-row";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { useUserPreferencesStore } from "@tasks/_store/user-preferences";

export function GeneralPreferencesSection() {
  const { t } = useTranslation();
  const showProjectBackgrounds = useUserPreferencesStore(
    (state) => state.showProjectBackgrounds,
  );
  const setShowProjectBackgrounds = useUserPreferencesStore(
    (state) => state.setShowProjectBackgrounds,
  );
  const sidebarDefaultOpen = useUserPreferencesStore(
    (state) => state.sidebarDefaultOpen,
  );
  const setSidebarDefaultOpen = useUserPreferencesStore(
    (state) => state.setSidebarDefaultOpen,
  );

  return (
    <SettingsSection title={t("settings:preferencesPage.appearanceTitle")}>
      <SettingsCard>
        <LanguageRow />
        <WeekStartRow />
        <DefaultViewRow />
        <PriorityIconsRow />
        <PreferenceSwitchRow
          title={t("settings:preferencesPage.projectBackgrounds")}
          description={t(
            "settings:preferencesPage.projectBackgroundsDescription",
          )}
          checked={showProjectBackgrounds}
          onCheckedChange={setShowProjectBackgrounds}
        />
        <PreferenceSwitchRow
          title={t("settings:preferencesPage.sidebarDefault")}
          description={t("settings:preferencesPage.sidebarDefaultDescription")}
          checked={sidebarDefaultOpen}
          onCheckedChange={setSidebarDefaultOpen}
        />
      </SettingsCard>
    </SettingsSection>
  );
}
