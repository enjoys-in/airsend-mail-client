import { useGetActiveWorkspaceUser } from "@tasks/_hooks/queries/workspace-users/use-active-workspace-user";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";

export function useCanImport() {
  const { canManageSettings, canCreateProjects, isCheckingPermissions } =
    useWorkspacePermission();
  const { isPending: isMemberPending } = useGetActiveWorkspaceUser();

  return {
    canImport: canManageSettings() && canCreateProjects(),
    isCheckingPermissions: isCheckingPermissions || isMemberPending,
  };
}
