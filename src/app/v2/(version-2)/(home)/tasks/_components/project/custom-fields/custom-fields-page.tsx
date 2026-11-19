import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomFieldList } from "@tasks/_components/project/custom-fields/custom-field-list";
import { CustomFieldDialog } from "@tasks/_components/project/custom-fields/field-dialog/custom-field-dialog";
import type { CustomFieldDefinition } from "@tasks/_components/project/custom-fields/types";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Button } from "@tasks/_components/ui/button";
import useGetProject from "@tasks/_hooks/queries/project/use-get-project";
import useActiveWorkspace from "@tasks/_hooks/queries/workspace/use-active-workspace";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";

type CustomFieldsPageProps = {
  projectId: string;
};

type DialogState = {
  open: boolean;
  field: CustomFieldDefinition | null;
  key: number;
};

export function CustomFieldsPage({ projectId }: CustomFieldsPageProps) {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const { data: project } = useGetProject({
    id: projectId,
    workspaceId: workspace?.id ?? "",
  });
  const { canUpdateProjects } = useWorkspacePermission();
  const canEdit = canUpdateProjects();
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    field: null,
    key: 0,
  });
  const projectName = project?.name;

  const openDialog = (field: CustomFieldDefinition | null) =>
    setDialog((current) => ({ open: true, field, key: current.key + 1 }));

  return (
    <SettingsPage
      title={t("settings:projectCustomFields.title")}
      description={
        projectName
          ? t("settings:projectCustomFields.subtitle", { project: projectName })
          : t("settings:projectCustomFields.subtitleFallback")
      }
      actions={
        canEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openDialog(null)}
          >
            <Plus aria-hidden="true" />
            {t("settings:projectCustomFields.newField")}
          </Button>
        ) : undefined
      }
    >
      <SettingsSection
        title={t("settings:projectCustomFields.fieldsTitle")}
        description={t("settings:projectCustomFields.fieldsDescription")}
      >
        <CustomFieldList
          projectId={projectId}
          canEdit={canEdit}
          onCreate={() => openDialog(null)}
          onEdit={openDialog}
        />
      </SettingsSection>
      <CustomFieldDialog
        key={dialog.key}
        projectId={projectId}
        projectName={projectName}
        field={dialog.field}
        open={dialog.open}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
    </SettingsPage>
  );
}
