import { useTranslation } from "react-i18next";
import { ExportTasksRow } from "@tasks/_components/project/tasks-import-export/export-tasks-row";
import { ImportTasksRow } from "@tasks/_components/project/tasks-import-export/import-tasks-row";
import { MoveProjectRow } from "@tasks/_components/settings/project-general/move-project-row";
import { useProjectMoveTargets } from "@tasks/_components/settings/project-general/use-project-move-targets";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsSection } from "@tasks/_components/settings/settings-section";
import type { ProjectWithTasks } from "@tasks/_types/project";

type ProjectTasksSectionProps = {
  project: ProjectWithTasks;
  isCurrentProject: boolean;
  flushPendingSave: () => Promise<boolean>;
};

export function ProjectTasksSection({
  project,
  isCurrentProject,
  flushPendingSave,
}: ProjectTasksSectionProps) {
  const { t } = useTranslation();
  const { moveTargets, moveTargetsFailed, canShowMove } = useProjectMoveTargets(
    project,
    isCurrentProject,
  );

  return (
    <SettingsSection title={t("settings:projectGeneral.tasksTitle")}>
      <SettingsCard>
        <ExportTasksRow project={project} />
        <ImportTasksRow project={project} />
        {canShowMove ? (
          <MoveProjectRow
            projectId={project.id}
            targets={moveTargets}
            targetsFailed={moveTargetsFailed}
            flushPendingSave={flushPendingSave}
          />
        ) : null}
      </SettingsCard>
    </SettingsSection>
  );
}
