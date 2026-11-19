import { useMutation } from "@tanstack/react-query";
import listImportSourceProjects, {
  type ListImportSourceProjectsRequest,
} from "@tasks/_fetchers/import/list-import-source-projects";

function useListImportSourceProjects() {
  return useMutation({
    mutationFn: (data: ListImportSourceProjectsRequest) =>
      listImportSourceProjects(data),
    gcTime: 0,
  });
}

export default useListImportSourceProjects;
