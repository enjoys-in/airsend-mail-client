import { useTranslation } from "react-i18next";
import PageTitle from "@tasks/_components/page-title";
import useAuth from "@tasks/_components/providers/auth-provider/hooks/use-auth";
import { AutosaveNote } from "@tasks/_components/settings/autosave-note";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import { OwnershipSection } from "@tasks/_components/settings/workspace-general/ownership-section";
import { useWorkspaceAutosave } from "@tasks/_components/settings/workspace-general/use-workspace-autosave";
import { WorkspaceDangerZone } from "@tasks/_components/settings/workspace-general/workspace-danger-zone";
import { WorkspaceDetailsSection } from "@tasks/_components/settings/workspace-general/workspace-details-section";
import { getWorkspaceDescription } from "@tasks/_components/settings/workspace-general/workspace-form-values";
import useActiveWorkspace from "@tasks/_hooks/queries/workspace/use-active-workspace";
import useGetFullWorkspace from "@tasks/_hooks/queries/workspace/use-get-full-workspace";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";

export function WorkspaceGeneralPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const { data: fullWorkspace } = useGetFullWorkspace({
    workspaceId: workspace?.id,
  });
  const { canManageWorkspace, canDeleteWorkspace, isOwner } =
    useWorkspacePermission();
  const canEdit = canManageWorkspace();
  const canDelete = canDeleteWorkspace();
  const workspaceName = workspace?.name ?? "";
  const form = useWorkspaceAutosave({
    workspaceId: workspace?.id,
    name: workspace?.name,
    description: getWorkspaceDescription(workspace),
    canEdit,
  });

  return (
    <>
      <PageTitle title={t("settings:workspaceGeneral.pageTitle")} />
      <SettingsPage
        title={t("settings:workspaceGeneral.title")}
        description={
          workspaceName
            ? t("settings:workspaceGeneral.subtitle", { name: workspaceName })
            : undefined
        }
        actions={canEdit ? <AutosaveNote /> : undefined}
      >
        <WorkspaceDetailsSection form={form} canEdit={canEdit} />
        {isOwner ? (
          <OwnershipSection
            workspaceId={workspace?.id}
            workspaceName={workspaceName}
            members={fullWorkspace?.members ?? []}
            currentUserId={currentUser?.id}
          />
        ) : null}
        {canDelete ? (
          <WorkspaceDangerZone
            workspaceId={workspace?.id}
            workspaceName={workspaceName}
          />
        ) : null}
      </SettingsPage>
    </>
  );
}
