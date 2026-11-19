import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import AdminOverviewPanel from "@tasks/_components/admin/overview/admin-overview-panel";
import PageTitle from "@tasks/_components/page-title";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/admin/overview",
)({ component: RouteComponent });

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("settings:adminOverview.title")} />
      <AdminOverviewPanel />
    </>
  );
}
