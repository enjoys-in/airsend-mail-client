import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "@tasks/_components/page-title";
import { LabelsSettings } from "@tasks/_components/settings/labels/labels-settings";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/workspace/labels",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("settings:workspaceLabels.pageTitle")} />
      <LabelsSettings />
    </>
  );
}
