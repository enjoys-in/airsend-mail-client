import { BillingPortalRow } from "@tasks/_components/billing/billing-portal-row";
import { FoundingFreeRow } from "@tasks/_components/billing/founding-free-row";
import { SubscriptionPlanRow } from "@tasks/_components/billing/subscription-plan-row";
import { TrialStatusRow } from "@tasks/_components/billing/trial-status-row";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import type { GetBillingResponse } from "@tasks/_fetchers/billing/get-billing";

type CurrentPlanCardProps = {
  billing: GetBillingResponse;
  workspaceId: string | undefined;
  canManage: boolean;
  onChoosePlan: () => void;
};

export function CurrentPlanCard({
  billing,
  workspaceId,
  canManage,
  onChoosePlan,
}: CurrentPlanCardProps) {
  if (billing.foundingFree) {
    return (
      <SettingsCard>
        <FoundingFreeRow />
      </SettingsCard>
    );
  }

  if (billing.plan && billing.status) {
    return (
      <SettingsCard>
        <SubscriptionPlanRow billing={billing} />
        <BillingPortalRow
          workspaceId={workspaceId}
          hasCustomer={billing.hasCustomer}
          canManage={canManage}
        />
      </SettingsCard>
    );
  }

  return (
    <SettingsCard>
      <TrialStatusRow billing={billing} onChoosePlan={onChoosePlan} />
    </SettingsCard>
  );
}
