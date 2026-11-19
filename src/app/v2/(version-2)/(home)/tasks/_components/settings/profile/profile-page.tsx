import { useTranslation } from "react-i18next";
import PageTitle from "@tasks/_components/page-title";
import useAuth from "@tasks/_components/providers/auth-provider/hooks/use-auth";
import { AutosaveNote } from "@tasks/_components/settings/autosave-note";
import { DeleteAccountSection } from "@tasks/_components/settings/profile/delete-account-section";
import { ProfileDetailsSection } from "@tasks/_components/settings/profile/profile-details-section";
import { useProfileNameAutosave } from "@tasks/_components/settings/profile/use-profile-name-autosave";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import useManagedProfileFields from "@tasks/_hooks/queries/user/use-managed-profile-fields";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, refetchUser } = useAuth();
  const form = useProfileNameAutosave({ name: user?.name, refetchUser });
  const managedFields = useManagedProfileFields();

  return (
    <>
      <PageTitle title={t("settings:informationPage.pageTitle")} />
      <SettingsPage
        title={t("settings:informationPage.title")}
        description={t("settings:informationPage.subtitle")}
        actions={<AutosaveNote />}
      >
        <ProfileDetailsSection
          form={form}
          user={user ?? undefined}
          refetchUser={refetchUser}
          managedFields={managedFields}
        />
        <DeleteAccountSection email={user?.email} />
      </SettingsPage>
    </>
  );
}
