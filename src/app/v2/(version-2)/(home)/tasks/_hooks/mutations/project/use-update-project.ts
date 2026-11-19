import { useMutation } from "@tanstack/react-query";
import updateProject from "@tasks/_fetchers/project/update-project";

function useUpdateProject() {
  return useMutation({
    mutationFn: updateProject,
  });
}

export default useUpdateProject;
