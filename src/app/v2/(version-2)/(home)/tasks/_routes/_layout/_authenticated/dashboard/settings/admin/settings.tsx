import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import InstanceSettingsPanel from "@tasks/_components/admin/settings/instance-settings-panel";
import PageTitle from "@tasks/_components/page-title";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/admin/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("settings:adminSettings.title")} />
      <InstanceSettingsPanel />
    </>
  );
}
