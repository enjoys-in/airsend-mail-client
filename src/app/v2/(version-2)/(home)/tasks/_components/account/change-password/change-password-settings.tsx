import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChangePasswordDialog } from "@tasks/_components/account/change-password/change-password-dialog";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Button } from "@tasks/_components/ui/button";
import useListAccounts from "@tasks/_hooks/queries/use-list-accounts";

export function ChangePasswordSettings() {
  const { t } = useTranslation();
  const { data: accounts, isLoading, isError } = useListAccounts();
  const [open, setOpen] = useState(false);
  const hasPassword =
    accounts?.some((account) => account.providerId === "credential") ?? false;

  return (
    <SettingsSection title={t("settings:securityPage.sectionTitle")}>
      <SettingsCard>
        {isLoading ? (
          <SettingsRow
            icon={<Lock />}
            title={t("settings:securityPage.passwordTitle")}
          >
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin text-muted-foreground"
            />
          </SettingsRow>
        ) : isError ? (
          <SettingsRow
            icon={<Lock />}
            title={t("settings:securityPage.passwordTitle")}
            description={
              <span className="text-destructive">
                {t("common:error.messages.unknown")}
              </span>
            }
          />
        ) : hasPassword ? (
          <SettingsRow
            icon={<Lock />}
            title={t("settings:securityPage.passwordTitle")}
            description={t("settings:securityPage.passwordHint")}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
            >
              {t("settings:securityPage.changePassword")}
            </Button>
          </SettingsRow>
        ) : (
          <SettingsRow
            icon={<Lock />}
            title={t("settings:securityPage.noPassword.title")}
            description={t("settings:securityPage.noPassword.description")}
          />
        )}
      </SettingsCard>
      {hasPassword ? (
        <ChangePasswordDialog open={open} onOpenChange={setOpen} />
      ) : null}
    </SettingsSection>
  );
}
