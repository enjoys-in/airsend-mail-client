import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ChangePasswordSettings } from "@tasks/_components/account/change-password/change-password-settings";
import { ActiveSessionsSettings } from "@tasks/_components/account/sessions/active-sessions-settings";
import PageTitle from "@tasks/_components/page-title";
import { SettingsPage } from "@tasks/_components/settings/settings-page";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/account/security",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("settings:securityPage.pageTitle")} />
      <SettingsPage
        title={t("settings:securityPage.title")}
        description={t("settings:securityPage.subtitle")}
      >
        <ChangePasswordSettings />
        <ActiveSessionsSettings />
      </SettingsPage>
    </>
  );
}
