import {
  getBoardCacheVersion,
  markBoardCacheChanged,
} from "@tasks/_lib/board-cache-version";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateMyWork } from "@tasks/_lib/invalidate-my-work";
import updateTaskTitle from "@tasks/_fetchers/task/update-task-title";
import type Task from "@tasks/_types/task";
import { updateBoardTaskCache } from "@tasks/_lib/update-board-task-cache";

export function useUpdateTaskTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => updateTaskTitle(task.id, task),
    onMutate: (task: Task) => {
      markBoardCacheChanged(queryClient, task.projectId, task.id);
      return {
        version: getBoardCacheVersion(queryClient, task.projectId, task.id),
      };
    },
    onSuccess: (updated, variables, context) => {
      invalidateMyWork(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["task", variables.id],
      });
      updateBoardTaskCache(
        queryClient,
        variables.projectId,
        variables.id,
        {
          title: updated.title,
        },
        context?.version,
      );
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activities", variables.id],
      });
    },
  });
}
