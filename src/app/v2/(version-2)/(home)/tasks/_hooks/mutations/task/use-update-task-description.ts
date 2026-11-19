import {
  getBoardCacheVersion,
  markBoardCacheChanged,
} from "@tasks/_lib/board-cache-version";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateTaskDescription from "@tasks/_fetchers/task/update-task-description";
import type Task from "@tasks/_types/task";
import { updateBoardTaskCache } from "@tasks/_lib/update-board-task-cache";

export function useUpdateTaskDescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => updateTaskDescription(task.id, task),
    onMutate: (task: Task) => {
      markBoardCacheChanged(queryClient, task.projectId, task.id);
      return {
        version: getBoardCacheVersion(queryClient, task.projectId, task.id),
      };
    },
    onSuccess: (updated, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.id],
      });
      updateBoardTaskCache(
        queryClient,
        variables.projectId,
        variables.id,
        {
          description: updated.description,
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
