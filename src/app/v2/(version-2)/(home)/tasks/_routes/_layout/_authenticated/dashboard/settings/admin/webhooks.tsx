import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import WebhooksPanel from "@tasks/_components/admin/webhooks/webhooks-panel";
import PageTitle from "@tasks/_components/page-title";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/admin/webhooks",
)({ component: RouteComponent });
function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("settings:adminWebhooks.title")} />
      <WebhooksPanel />
    </>
  );
}
