import { useMutation } from "@tanstack/react-query";
import { authClient } from "@tasks/_lib/auth-client";

type DeleteWorkspaceRequest = {
  workspaceId: string;
};

function useDeleteWorkspace() {
  return useMutation({
    mutationFn: async ({ workspaceId }: DeleteWorkspaceRequest) => {
      const { data, error } = await authClient.organization.delete({
        organizationId: workspaceId,
      });

      if (error) {
        throw new Error(error.message || "Failed to delete workspace");
      }

      return data;
    },
  });
}

export default useDeleteWorkspace;
