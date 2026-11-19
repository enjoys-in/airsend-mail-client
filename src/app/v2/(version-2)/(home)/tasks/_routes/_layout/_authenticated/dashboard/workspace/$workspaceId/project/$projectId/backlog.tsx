import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { produce } from "immer";
import { SquareKanbanIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import BacklogListView from "@tasks/_components/backlog-list-view";
import { BacklogToolbarActions } from "@tasks/_components/backlog-list-view/backlog-toolbar-actions";
import ProjectLayout from "@tasks/_components/common/project-layout";
import PageTitle from "@tasks/_components/page-title";
import { BoardLoadError } from "@tasks/_components/project/board-load-error";
import { TaskDisplayOptions } from "@tasks/_components/project/display/task-display-options";
import { ActiveFiltersBar } from "@tasks/_components/project/task-filters/active-filters-bar";
import { ProjectToolbar } from "@tasks/_components/project/toolbar/project-toolbar";
import { TaskCount } from "@tasks/_components/project/toolbar/task-count";
import { useProjectTaskView } from "@tasks/_components/project/toolbar/use-project-task-view";
import { ConfirmDialog } from "@tasks/_components/settings/confirm-dialog";
import CreateTaskModal from "@tasks/_components/shared/modals/create-task-modal";
import TaskDetailsSheet from "@tasks/_components/task/task-details-sheet";
import { useUpdateTask } from "@tasks/_hooks/mutations/task/use-update-task";
import { useGetTasks } from "@tasks/_hooks/queries/task/use-get-tasks";
import { useBoardSort } from "@tasks/_hooks/use-board-sort";
import { sortTasks } from "@tasks/_lib/sort-tasks";
import { countBacklogTasks } from "@tasks/_lib/task-filters/count-tasks";
import { toast } from "@tasks/_lib/toast";
import useProjectStore from "@tasks/_store/project";
import type { ProjectWithTasks } from "@tasks/_types/project";

type BacklogSearchParams = {
  taskId?: string;
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/backlog",
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): BacklogSearchParams => ({
    taskId: typeof search.taskId === "string" ? search.taskId : undefined,
  }),
});

function RouteComponent() {
  const { t } = useTranslation();
  const { projectId, workspaceId } = Route.useParams();
  const { taskId } = Route.useSearch();
  const navigate = useNavigate();
  const {
    data,
    isError: backlogError,
    isFetching: backlogFetching,
    refetch: retryBacklog,
  } = useGetTasks(projectId);
  const { project: storedProject, setProject } = useProjectStore();
  const project: ProjectWithTasks | undefined =
    storedProject?.id === projectId ? storedProject : data;
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMoveAllOpen, setIsMoveAllOpen] = useState(false);
  const [moveAllCount, setMoveAllCount] = useState(0);
  const { mutate: updateTask } = useUpdateTask();
  const { sort, setSort } = useBoardSort(projectId, "backlog");
  const view = useProjectTaskView({
    project,
    projectId,
    workspaceId,
    scope: "backlog",
  });
  const { filters } = view;

  const handleCloseTaskSheet = useCallback(() => {
    navigate({
      to: ".",
      search: {},
      replace: true,
    });
  }, [navigate]);

  useEffect(() => {
    if (data) {
      setProject(data);
    }
  }, [data, setProject]);

  const sortedProject = useMemo(() => {
    const filteredProject = filters.filteredProject;
    if (!filteredProject || sort.field === "position") return filteredProject;
    return {
      ...filteredProject,
      plannedTasks: sortTasks(filteredProject.plannedTasks || [], sort),
      archivedTasks: sortTasks(filteredProject.archivedTasks || [], sort),
    };
  }, [filters.filteredProject, sort]);

  const handleMoveAllPlannedToTodo = () => {
    if (!project) return;

    const plannedTasks = project.plannedTasks || [];

    if (plannedTasks.length === 0) {
      toast.info(t("tasks:backlog.noTasksToMove"));
      return;
    }

    setMoveAllCount(plannedTasks.length);
    setIsMoveAllOpen(true);
  };

  const confirmMoveAllPlannedToTodo = () => {
    setIsMoveAllOpen(false);
    if (!project) return;

    const plannedTasks = project.plannedTasks || [];

    for (const task of plannedTasks) {
      updateTask({
        ...task,
        status: "to-do",
      });
    }

    const updatedProject = produce(project, (draft) => {
      // "to-do" is a column slug, so it can only be matched against slug.
      const todoColumn = draft.columns?.find((col) => col.slug === "to-do");
      if (todoColumn && draft.plannedTasks) {
        todoColumn.tasks.push(
          ...draft.plannedTasks.map((task) => ({
            ...task,
            status: "to-do",
          })),
        );

        draft.plannedTasks = [];
      }
    });

    setProject(updatedProject);
    toast.success(
      t("tasks:backlog.moveAllSuccess", { count: plannedTasks.length }),
      { icon: SquareKanbanIcon },
    );
  };

  return (
    <ProjectLayout
      projectId={projectId}
      workspaceId={workspaceId}
      activeView="backlog"
      toolbar={
        <ProjectToolbar
          view={view}
          actions={
            <BacklogToolbarActions
              onPlan={() => setIsTaskModalOpen(true)}
              onMoveAll={handleMoveAllPlannedToTodo}
            />
          }
          display={
            <TaskDisplayOptions
              projectId={projectId}
              sort={sort}
              onSortChange={setSort}
              layout="rows"
            />
          }
        />
      }
      summary={
        <TaskCount
          shown={countBacklogTasks(filters.filteredProject)}
          total={countBacklogTasks(project)}
        />
      }
      filterBar={
        <ActiveFiltersBar
          subjects={view.subjects}
          onClear={filters.clearFilters}
          customFieldValues={filters.customFieldValues}
        />
      }
    >
      <PageTitle
        title={
          project
            ? t("tasks:backlog.pageTitle", { name: project.name })
            : undefined
        }
      />
      <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden bg-card h-full">
          {sortedProject ? (
            <BacklogListView
              key={projectId}
              project={sortedProject}
              disableDragDrop={sort.field !== "position"}
            />
          ) : backlogError ? (
            <BoardLoadError
              isRetrying={backlogFetching}
              onRetry={() => void retryBacklog()}
            />
          ) : (
            <div className="delayed-reveal flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-lg animate-pulse mx-auto" />
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-muted rounded animate-pulse mx-auto" />
                  <div className="w-64 h-3 bg-muted rounded animate-pulse mx-auto" />
                </div>
              </div>
            </div>
          )}
        </div>

        <CreateTaskModal
          open={isTaskModalOpen}
          projectId={projectId}
          onClose={() => setIsTaskModalOpen(false)}
          status="planned"
        />

        <ConfirmDialog
          open={isMoveAllOpen}
          onOpenChange={setIsMoveAllOpen}
          title={t("tasks:backlog.moveAllConfirm", { count: moveAllCount })}
          confirmLabel={t("tasks:backlog.moveAll")}
          destructive={false}
          onConfirm={confirmMoveAllPlannedToTodo}
        />

        <TaskDetailsSheet
          taskId={taskId}
          projectId={projectId}
          workspaceId={workspaceId}
          onClose={handleCloseTaskSheet}
        />
      </div>
    </ProjectLayout>
  );
}
