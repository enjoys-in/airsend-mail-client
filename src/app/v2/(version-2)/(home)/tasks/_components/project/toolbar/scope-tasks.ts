import type { ProjectWithTasks } from "@tasks/_types/project";
import type Task from "@tasks/_types/task";

export function scopeTasks(
  project: ProjectWithTasks | null | undefined,
  scope: "board" | "backlog" | "schedule",
): Task[] {
  if (!project) return [];
  const boardTasks = project.columns.flatMap((column) => column.tasks);
  if (scope === "board") return boardTasks;
  if (scope === "backlog") {
    return [...(project.plannedTasks ?? []), ...(project.archivedTasks ?? [])];
  }
  return [...boardTasks, ...(project.plannedTasks ?? [])];
}
