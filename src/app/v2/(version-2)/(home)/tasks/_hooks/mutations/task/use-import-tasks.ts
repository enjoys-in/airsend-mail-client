import { useMutation, useQueryClient } from "@tanstack/react-query";
import importTasks, { type TaskToImport } from "@tasks/_fetchers/task/import-tasks";

import { invalidateMyWork } from "@tasks/_lib/invalidate-my-work";

const useImportTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      tasks,
    }: {
      projectId: string;
      tasks: TaskToImport[];
    }) => importTasks(projectId, tasks),
    onSuccess: () => {
      invalidateMyWork(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export default useImportTasks;
