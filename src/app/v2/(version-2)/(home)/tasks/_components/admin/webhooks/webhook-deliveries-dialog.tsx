import { getWebhookErrorLabel } from "./get-webhook-error-label";
import { useTranslation } from "react-i18next";
import { DirectoryErrorRow } from "@tasks/_components/admin/directory/directory-error-row";
import { getAuditActionLabel } from "@tasks/_components/admin/audit-log/get-audit-action-label";
import { Button } from "@tasks/_components/ui/button";
import { Badge } from "@tasks/_components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@tasks/_components/ui/dialog";
import useAdminWebhookDeliveries from "@tasks/_hooks/queries/admin/use-admin-webhook-deliveries";
import { SettingsRowsSkeleton } from "@tasks/_components/settings/settings-rows-skeleton";

export function WebhookDeliveriesDialog({
  webhookId,
  onClose,
}: {
  webhookId: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useAdminWebhookDeliveries(
    webhookId,
    true,
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPopup className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("settings:adminWebhooks.deliveries")}</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          {isLoading ? <SettingsRowsSkeleton rows={3} /> : null}
          {isError ? (
            <DirectoryErrorRow
              message={t("settings:adminWebhooks.loadError")}
              retryLabel={t("settings:adminUsers.retry")}
              onRetry={() => refetch()}
            />
          ) : null}
          {data?.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("settings:adminWebhooks.noDeliveries")}
            </p>
          ) : null}
          <ul className="divide-y divide-border">
            {data?.map((delivery) => (
              <li
                key={delivery.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">
                    {getAuditActionLabel(delivery.action, t)}
                  </p>
                  <time
                    dateTime={delivery.createdAt}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(delivery.createdAt).toLocaleString(i18n.language)}
                  </time>
                  <p className="text-xs text-muted-foreground">
                    {t("settings:adminWebhooks.attempts", {
                      count: delivery.attempts,
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      delivery.state === "succeeded"
                        ? "success"
                        : delivery.state === "failed"
                          ? "error"
                          : "secondary"
                    }
                  >
                    {delivery.state === "succeeded"
                      ? t("settings:adminWebhooks.succeeded")
                      : delivery.state === "failed"
                        ? t("settings:adminWebhooks.failed")
                        : t("settings:adminWebhooks.pending")}
                  </Badge>
                  {delivery.statusCode ? (
                    <span className="font-mono text-xs">
                      {t("settings:adminWebhooks.httpStatus", {
                        status: delivery.statusCode,
                      })}
                    </span>
                  ) : null}
                  {delivery.errorCode ? (
                    <span className="text-xs text-muted-foreground">
                      {getWebhookErrorLabel(delivery.errorCode, t)}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            {t("common:actions.close")}
          </DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
