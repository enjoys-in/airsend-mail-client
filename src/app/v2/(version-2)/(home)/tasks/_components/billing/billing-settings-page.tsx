import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { CheckoutSuccessCallout } from "@tasks/_components/billing/checkout-success-callout";
import { CurrentPlanCard } from "@tasks/_components/billing/current-plan-card";
import { PlanPicker } from "@tasks/_components/billing/plan-picker";
import PageTitle from "@tasks/_components/page-title";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Spinner } from "@tasks/_components/ui/spinner";
import { useGetBilling } from "@tasks/_hooks/queries/billing/use-get-billing";
import { useTrackSubscription } from "@tasks/_hooks/use-track-subscription";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";

type BillingSettingsPageProps = {
  checkout: string | undefined;
  onDismissCheckout: () => void;
};

export function BillingSettingsPage({
  checkout,
  onDismissCheckout,
}: BillingSettingsPageProps) {
  const { t } = useTranslation();
  const { workspace, isAdmin } = useWorkspacePermission();
  const workspaceId = workspace?.id;
  const { data: billing, isLoading } = useGetBilling(workspaceId);
  const planPickerRef = useRef<HTMLDivElement>(null);
  useTrackSubscription(checkout, billing?.seats);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!billing?.billingEnabled) {
    return (
      <>
        <PageTitle title={t("settings:billing.pageTitle")} />
        <SettingsPage
          title={t("settings:billing.pageTitle")}
          description={t("settings:billing.disabled")}
        />
      </>
    );
  }

  const showPlanPicker =
    !billing.foundingFree && !(billing.plan && billing.status);

  const scrollToPlanPicker = () => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    planPickerRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <PageTitle title={t("settings:billing.pageTitle")} />
      <SettingsPage
        title={t("settings:billing.pageTitle")}
        description={
          workspace?.name
            ? t("settings:billing.subtitle", { workspace: workspace.name })
            : undefined
        }
      >
        {checkout === "success" ? (
          <CheckoutSuccessCallout onDismiss={onDismissCheckout} />
        ) : null}

        <SettingsSection title={t("settings:billing.currentPlan.title")}>
          <CurrentPlanCard
            billing={billing}
            workspaceId={workspaceId}
            canManage={isAdmin}
            onChoosePlan={scrollToPlanPicker}
          />
        </SettingsSection>

        {showPlanPicker ? (
          <div ref={planPickerRef} className="scroll-mt-6">
            <SettingsSection
              title={t("settings:billing.choosePlan.title")}
              description={t("settings:billing.choosePlan.subtitle")}
            >
              <PlanPicker workspaceId={workspaceId} canManage={isAdmin} />
            </SettingsSection>
          </div>
        ) : null}
      </SettingsPage>
    </>
  );
}
