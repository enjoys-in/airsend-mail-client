import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@tasks/_components/page-title";
import { AutosaveNote } from "@tasks/_components/settings/autosave-note";
import { ProjectDangerZone } from "@tasks/_components/settings/project-general/project-danger-zone";
import { ProjectDetailsSection } from "@tasks/_components/settings/project-general/project-details-section";
import { ProjectTasksSection } from "@tasks/_components/settings/project-general/project-tasks-section";
import { useProjectAutosave } from "@tasks/_components/settings/project-general/use-project-autosave";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import { useGetTasks } from "@tasks/_hooks/queries/task/use-get-tasks";
import useActiveWorkspace from "@tasks/_hooks/queries/workspace/use-active-workspace";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";
import useProjectStore from "@tasks/_store/project";

export function ProjectGeneralPage() {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const { projectId: rawProjectId } = useParams({ strict: false });
  const projectId = rawProjectId ?? "";
  const { data: fetchedProject } = useGetTasks(projectId);
  const { project, setProject } = useProjectStore();
  const isCurrentProject = project?.id === projectId;
  const { canUpdateProjects, canDeleteProjects } = useWorkspacePermission();
  const canEdit = canUpdateProjects();
  const canDelete = canDeleteProjects();
  const { form, flushPendingSave } = useProjectAutosave({
    project,
    workspaceId: workspace?.id,
    canEdit,
  });

  useEffect(() => {
    if (fetchedProject) {
      setProject(fetchedProject);
    }
  }, [fetchedProject, setProject]);

  return (
    <>
      <PageTitle title={t("settings:projectGeneral.pageTitle")} />
      <SettingsPage
        title={t("settings:projectGeneral.title")}
        description={
          isCurrentProject && project?.name
            ? t("settings:projectGeneral.subtitle", { name: project.name })
            : undefined
        }
        actions={canEdit ? <AutosaveNote /> : undefined}
      >
        <ProjectDetailsSection
          form={form}
          project={project}
          canEdit={canEdit}
        />
        {project ? (
          <ProjectTasksSection
            project={project}
            isCurrentProject={isCurrentProject}
            flushPendingSave={flushPendingSave}
          />
        ) : null}
        {canDelete ? (
          <ProjectDangerZone
            project={project}
            isCurrentProject={isCurrentProject}
            workspaceId={workspace?.id}
          />
        ) : null}
      </SettingsPage>
    </>
  );
}
