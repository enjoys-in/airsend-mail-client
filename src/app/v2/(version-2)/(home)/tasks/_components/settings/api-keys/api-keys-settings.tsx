import { KeyRoundIcon, LockIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiKeyCreatedDialog } from "@tasks/_components/settings/api-keys/api-key-created-dialog";
import type { ApiKeyItem } from "@tasks/_components/settings/api-keys/api-key-item";
import { ApiKeyRow } from "@tasks/_components/settings/api-keys/api-key-row";
import { CreateApiKeyDialog } from "@tasks/_components/settings/api-keys/create-api-key-dialog";
import { DeleteApiKeyDialog } from "@tasks/_components/settings/api-keys/delete-api-key-dialog";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsEmpty } from "@tasks/_components/settings/settings-empty";
import { SettingsNote } from "@tasks/_components/settings/settings-note";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import { SettingsRowsSkeleton } from "@tasks/_components/settings/settings-rows-skeleton";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Button } from "@tasks/_components/ui/button";
import useGetApiKeys from "@tasks/_hooks/queries/use-get-api-keys";

export function ApiKeysSettings() {
  const { t } = useTranslation();
  const apiKeysQuery = useGetApiKeys();
  const apiKeys = apiKeysQuery.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState<ApiKeyItem | null>(null);

  const openDeleteDialog = (apiKey: ApiKeyItem) => {
    setDeletingKey(apiKey);
    setDeleteOpen(true);
  };

  const newKeyButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setCreateOpen(true)}
    >
      <PlusIcon aria-hidden="true" />
      {t("settings:developerPage.newKey")}
    </Button>
  );

  const renderKeys = () => {
    if (apiKeysQuery.isPending) {
      return <SettingsRowsSkeleton rows={2} withDescription />;
    }
    if (apiKeysQuery.isError) {
      return (
        <p
          role="alert"
          className="px-4 py-3.5 text-destructive-foreground text-sm"
        >
          {t("settings:developerPage.loadError")}
        </p>
      );
    }
    if (apiKeys.length === 0) {
      return (
        <SettingsEmpty
          icon={<KeyRoundIcon />}
          title={t("settings:developerPage.emptyTitle")}
          description={t("settings:developerPage.emptyDescription")}
          action={newKeyButton}
        />
      );
    }
    return apiKeys.map((apiKey) => (
      <ApiKeyRow key={apiKey.id} apiKey={apiKey} onDelete={openDeleteDialog} />
    ));
  };

  return (
    <>
      <SettingsPage
        title={t("settings:developerPage.title")}
        description={t("settings:developerPage.subtitle")}
        actions={newKeyButton}
      >
        <SettingsSection title={t("settings:developerPage.keysTitle")}>
          <SettingsCard>{renderKeys()}</SettingsCard>
          <SettingsNote icon={LockIcon}>
            {t("settings:developerPage.keysNote")}
          </SettingsNote>
        </SettingsSection>
      </SettingsPage>

      <CreateApiKeyDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(data) => setCreatedKey(data.key)}
      />
      {createdKey ? (
        <ApiKeyCreatedDialog
          apiKey={createdKey}
          open
          onClose={() => setCreatedKey(null)}
        />
      ) : null}
      <DeleteApiKeyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        apiKey={deletingKey}
      />
    </>
  );
}
