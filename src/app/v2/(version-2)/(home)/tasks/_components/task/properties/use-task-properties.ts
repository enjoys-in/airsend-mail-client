import { useGetColumns } from "@tasks/_hooks/queries/column/use-get-columns";
import useGetLabelsByTask from "@tasks/_hooks/queries/label/use-get-labels-by-task";
import useGetProject from "@tasks/_hooks/queries/project/use-get-project";
import useGetProjects from "@tasks/_hooks/queries/project/use-get-projects";
import useGetTask from "@tasks/_hooks/queries/task/use-get-task";
import { useGetActiveWorkspaceUsers } from "@tasks/_hooks/queries/workspace-users/use-get-active-workspace-users";
import { getDueDateStatus, isTaskCompleted } from "@tasks/_lib/due-date-status";
import { getStatusDisplayLabel } from "@tasks/_lib/i18n/domain";

export function useTaskProperties(
  taskId: string,
  projectId: string,
  workspaceId: string,
) {
  const { data: task } = useGetTask(taskId);
  const { data: project } = useGetProject({ id: projectId, workspaceId });
  const { data: columns = [] } = useGetColumns(projectId);
  const { data: workspaceUsers } = useGetActiveWorkspaceUsers(workspaceId);
  const { data: labels = [] } = useGetLabelsByTask(taskId);
  const { data: workspaceProjects = [] } = useGetProjects({ workspaceId });

  const statusColumn = columns.find(
    (column) => column.slug === task?.status || column.id === task?.status,
  );

  return {
    task,
    project,
    labels,
    status: {
      label: getStatusDisplayLabel(task?.status ?? "", statusColumn?.name),
      isFinal: statusColumn?.isFinal ?? false,
      icon: statusColumn?.icon,
    },
    assignee: workspaceUsers?.members?.find(
      (member) => member.userId === task?.userId,
    ),
    dueStatus: getDueDateStatus(
      task?.dueDate ?? null,
      isTaskCompleted(task?.status ?? "", columns),
    ),
    canMoveTask:
      Boolean(task) &&
      workspaceProjects.some((project) => project.id !== task?.projectId),
  };
}
