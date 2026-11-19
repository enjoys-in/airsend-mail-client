import { useQuery, useQueryClient } from "@tanstack/react-query";
import getProject from "@tasks/_fetchers/project/get-project";
import type getProjects from "@tasks/_fetchers/project/get-projects";

function useGetProject({
  id,
  workspaceId,
}: {
  id: string;
  workspaceId: string;
}) {
  const queryClient = useQueryClient();

  return useQuery({
    queryFn: () => getProject({ id, workspaceId }),
    queryKey: ["projects", workspaceId, id],
    enabled: !!id,
    placeholderData: () =>
      queryClient
        .getQueryData<Awaited<ReturnType<typeof getProjects>>>([
          "projects",
          workspaceId,
        ])
        ?.find((project) => project.id === id),
  });
}

export default useGetProject;
