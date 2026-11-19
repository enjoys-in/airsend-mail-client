import { useMutation } from "@tanstack/react-query";
import deleteProject from "@tasks/_fetchers/project/delete-project";

function useDeleteProject() {
  return useMutation({
    mutationFn: deleteProject,
  });
}

export default useDeleteProject;
