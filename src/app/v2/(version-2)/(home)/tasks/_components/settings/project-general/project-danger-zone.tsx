import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@tasks/_components/settings/confirm-dialog";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsRow } from "@tasks/_components/settings/settings-row";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import { Button } from "@tasks/_components/ui/button";
import useDeleteProject from "@tasks/_hooks/mutations/project/use-delete-project";
import { toast } from "@tasks/_lib/toast";
import type { ProjectWithTasks } from "@tasks/_types/project";

type ProjectDangerZoneProps = {
  project: ProjectWithTasks | undefined;
  isCurrentProject: boolean;
  workspaceId: string | undefined;
};

export function ProjectDangerZone({
  project,
  isCurrentProject,
  workspaceId,
}: ProjectDangerZoneProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteProject, isPending } = useDeleteProject();
  const name = project?.name ?? "";

  const handleDelete = async () => {
    if (!isCurrentProject || !project?.id) return;

    try {
      await deleteProject({ id: project.id });
      toast.success(t("settings:projectGeneral.toastDeleted"), {
        icon: Trash2Icon,
      });
      setOpen(false);

      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      navigate({
        to: "/dashboard/workspace/$workspaceId",
        params: { workspaceId: workspaceId || "" },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("settings:projectGeneral.toastDeleteError"),
      );
    }
  };

  return (
    <SettingsSection title={t("settings:projectGeneral.dangerZone")}>
      <SettingsCard tone="danger">
        <SettingsRow
          stack
          title={t("settings:projectGeneral.deleteProject")}
          description={t("settings:projectGeneral.deleteProjectDescription", {
            name,
          })}
        >
          <Button
            type="button"
            variant="destructive-outline"
            size="sm"
            disabled={!project || !isCurrentProject}
            onClick={() => setOpen(true)}
          >
            {t("settings:projectGeneral.deleteProject")}
          </Button>
        </SettingsRow>
      </SettingsCard>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("settings:projectGeneral.deleteModalTitle")}
        description={t("settings:projectGeneral.deleteModalDescription", {
          name,
        })}
        confirmLabel={t("settings:projectGeneral.deleteModalConfirm")}
        pendingLabel={t("common:actions.deleting")}
        pending={isPending}
        onConfirm={handleDelete}
      />
    </SettingsSection>
  );
}
