import { useQuery } from "@tanstack/react-query";
import getActiveWorkspaceUsers from "@tasks/_fetchers/workspace-user/get-active-workspace-users";

export function useGetActiveWorkspaceUsers(workspaceId: string) {
  return useQuery({
    queryKey: ["active-workspace-users", workspaceId],
    queryFn: () => getActiveWorkspaceUsers({ workspaceId }),
    enabled: !!workspaceId,
  });
}
