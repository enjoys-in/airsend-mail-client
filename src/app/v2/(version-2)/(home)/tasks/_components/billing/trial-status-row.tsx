import { Sparkles, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { StatusBadge } from "@tasks/_components/settings/status-badge";
import { Button } from "@tasks/_components/ui/button";
import type { GetBillingResponse } from "@tasks/_fetchers/billing/get-billing";
import { getTrialState } from "@tasks/_lib/billing";

type TrialStatusRowProps = {
  billing: GetBillingResponse;
  onChoosePlan?: () => void;
};

export function TrialStatusRow({ billing, onChoosePlan }: TrialStatusRowProps) {
  const { t } = useTranslation();
  const trial = getTrialState(billing);
  const expired = trial.kind === "expired";

  return (
    <SettingsRow
      icon={expired ? <TriangleAlert /> : <Sparkles />}
      iconClassName={
        expired
          ? "border-warning/30 bg-warning/10 text-warning-foreground"
          : undefined
      }
      title={
        expired
          ? t("settings:billing.trial.expiredTitle")
          : t("settings:billing.trial.activeTitle")
      }
      badge={
        expired ? (
          <StatusBadge tone="warning">
            {t("settings:billing.trialCard.ended")}
          </StatusBadge>
        ) : trial.kind === "active" ? (
          <StatusBadge tone="success">
            {t("settings:billing.trial.badgeDaysLeft", {
              count: trial.daysLeft,
            })}
          </StatusBadge>
        ) : null
      }
      description={
        expired
          ? t("settings:billing.trial.expiredDescription")
          : t("settings:billing.trial.noDate")
      }
    >
      {onChoosePlan ? (
        <Button type="button" size="sm" onClick={onChoosePlan}>
          {t("settings:billing.trialCard.choosePlan")}
        </Button>
      ) : null}
    </SettingsRow>
  );
}
