import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import RolesPanel from "@tasks/_components/admin/roles/roles-panel";
import PageTitle from "@tasks/_components/page-title";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/admin/roles",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("settings:adminRoles.title")} />
      <RolesPanel />
    </>
  );
}
