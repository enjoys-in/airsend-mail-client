import { TaskShortcuts } from "@tasks/_components/task/task-shortcuts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TaskLayout from "@tasks/_components/common/task-layout";
import PageTitle from "@tasks/_components/page-title";
import TaskDeleteDialog from "@tasks/_components/task/task-delete-dialog";
import TaskDetailsContent from "@tasks/_components/task/task-details-content";
import { TaskHeaderActions } from "@tasks/_components/task/header/task-header-actions";
import { PropertiesRail } from "@tasks/_components/task/properties/properties-rail";
import { PropertyChips } from "@tasks/_components/task/properties/property-chips";
import {
  TaskDetailsSkeleton,
  TaskPropertiesRailSkeleton,
} from "@tasks/_components/task/task-page-skeleton";
import { AlertDialogCreateHandle } from "@tasks/_components/ui/alert-dialog";
import { Button } from "@tasks/_components/ui/button";
import useGetActivitiesByTaskId from "@tasks/_hooks/queries/activity/use-get-activities-by-task-id";
import useGetProject from "@tasks/_hooks/queries/project/use-get-project";
import useGetTask from "@tasks/_hooks/queries/task/use-get-task";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/task/$taskId_",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId, workspaceId, taskId } = Route.useParams();
  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
  } = useGetTask(taskId);
  const { data: project, isLoading: isProjectLoading } = useGetProject({
    id: projectId,
    workspaceId,
  });
  const { isLoading: isActivitiesLoading } = useGetActivitiesByTaskId(taskId);
  const [isShikiReady, setIsShikiReady] = useState(false);
  const [deleteHandle] = useState(() => AlertDialogCreateHandle());
  useEffect(() => {
    let mounted = true;

    void import("@tasks/_lib/shiki-highlighter")
      .then(({ getSharedShikiHighlighter }) => getSharedShikiHighlighter())
      .then(() => {
        if (!mounted) return;
        setIsShikiReady(true);
      })
      .catch((err) => {
        console.error("Failed to initialize Shiki highlighter:", err);
        if (!mounted) return;
        // Render the task view without syntax highlighting rather than
        // leaving the page stuck in a permanent loading state.
        setIsShikiReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isLoading =
    isTaskLoading || isProjectLoading || isActivitiesLoading || !isShikiReady;

  const handleDeleted = () => {
    navigate({
      to: "/dashboard/workspace/$workspaceId/project/$projectId/board",
      params: { workspaceId, projectId },
      replace: true,
    });
  };

  return (
    <TaskLayout
      taskId={taskId}
      projectId={projectId}
      workspaceId={workspaceId}
      headerActions={
        !isLoading && task ? (
          <TaskHeaderActions
            taskId={taskId}
            projectId={projectId}
            workspaceId={workspaceId}
            deleteHandle={deleteHandle}
          />
        ) : null
      }
      rail={
        isLoading ? (
          <TaskPropertiesRailSkeleton />
        ) : isTaskError || !task ? null : (
          <PropertiesRail
            key={taskId}
            taskId={taskId}
            projectId={projectId}
            workspaceId={workspaceId}
            className="w-80 shrink-0"
          />
        )
      }
    >
      <PageTitle
        title={
          isLoading
            ? t("tasks:common.loadingTask")
            : isTaskError || !task
              ? t("tasks:common.taskNotFound")
              : project
                ? `${project.slug}-${task.number} ${task.title}`
                : undefined
        }
      />
      {!isLoading && task && (
        <TaskShortcuts
          taskId={taskId}
          projectId={projectId}
          workspaceId={workspaceId}
        />
      )}
      {!isLoading && task && (
        <TaskDeleteDialog
          handle={deleteHandle}
          taskId={taskId}
          onDeleted={handleDeleted}
        />
      )}
      {isLoading ? (
        <TaskDetailsSkeleton />
      ) : isTaskError || !task ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">
            {t("tasks:common.taskNotFound")}
          </h1>
          <p className="text-muted-foreground max-w-md">
            {t("tasks:common.taskNotFoundDescription", {
              defaultValue:
                "The task you are looking for does not exist or has been deleted.",
            })}
          </p>
          <Button
            variant="outline"
            onClick={() =>
              navigate({
                to: "/dashboard/workspace/$workspaceId/project/$projectId/board",
                params: { workspaceId, projectId },
              })
            }
          >
            {t("navigation:sidebar.backToBoard", {
              defaultValue: "Back to board",
            })}
          </Button>
        </div>
      ) : (
        <TaskDetailsContent
          key={taskId}
          taskId={taskId}
          projectId={projectId}
          workspaceId={workspaceId}
          variant="page"
          className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16 sm:px-6 xl:pt-12 xl:pb-20"
          properties={
            <PropertyChips
              taskId={taskId}
              projectId={projectId}
              workspaceId={workspaceId}
              className="pb-5 lg:hidden"
            />
          }
        />
      )}
    </TaskLayout>
  );
}
