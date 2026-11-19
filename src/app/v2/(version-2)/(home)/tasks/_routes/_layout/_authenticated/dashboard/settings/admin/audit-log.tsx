import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import AuditLogPanel from "@tasks/_components/admin/audit-log/audit-log-panel";
import PageTitle from "@tasks/_components/page-title";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/admin/audit-log",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("settings:adminAuditLog.title")} />
      <AuditLogPanel />
    </>
  );
}
