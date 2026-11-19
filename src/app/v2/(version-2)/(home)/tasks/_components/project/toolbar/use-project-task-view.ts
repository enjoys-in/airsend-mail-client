import { useMemo, useState } from "react";
import { useFilterSubjects } from "@tasks/_components/project/task-filters/use-filter-subjects";
import { useTaskFilterOptions } from "@tasks/_components/project/task-filters/use-task-filter-options";
import { useDescriptionMatches } from "@tasks/_hooks/queries/task/use-description-matches";
import type { BoardFilters } from "@tasks/_hooks/use-task-filters";
import { useTaskFiltersWithLabelsSupport } from "@tasks/_hooks/use-task-filters-with-labels-support";
import type { ProjectWithTasks } from "@tasks/_types/project";
import { scopeTasks } from "./scope-tasks";

const NO_IGNORED_FILTERS: ReadonlyArray<keyof BoardFilters> = [];
const BACKLOG_IGNORED_FILTERS: ReadonlyArray<keyof BoardFilters> = ["status"];

export type TaskViewScope = "board" | "backlog" | "schedule";

export type ProjectTaskView = ReturnType<typeof useProjectTaskView>;

export function useProjectTaskView({
  project,
  projectId,
  workspaceId,
  scope,
}: {
  project: ProjectWithTasks | null | undefined;
  projectId: string;
  workspaceId: string;
  scope: TaskViewScope;
}) {
  const ignore =
    scope === "backlog" ? BACKLOG_IGNORED_FILTERS : NO_IGNORED_FILTERS;
  const [search, setSearch] = useState("");
  const descriptionSearch = useDescriptionMatches(projectId, project, search);
  const filters = useTaskFiltersWithLabelsSupport(
    project,
    projectId,
    search,
    descriptionSearch.ids,
    ignore,
  );
  const options = useTaskFilterOptions(projectId, workspaceId);
  const tasks = useMemo(
    () =>
      scopeTasks(project, scope).filter(
        (task) => filters.includeSubtasks || !task.isSubtask,
      ),
    [project, scope, filters.includeSubtasks],
  );
  const subjects = useFilterSubjects({
    controls: filters,
    options,
    columns: project?.columns,
    tasks,
    showStatus: scope !== "backlog",
  });

  return { search, setSearch, descriptionSearch, filters, subjects };
}
