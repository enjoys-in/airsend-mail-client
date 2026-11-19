import { useQuery } from "@tanstack/react-query";
import useAuth from "@tasks/_components/providers/auth-provider/hooks/use-auth";
import { getAdminRoles } from "@tasks/_fetchers/admin/get-admin-roles";

export type { AdminRole } from "@tasks/_fetchers/admin/role-types";

export const ADMIN_ROLES_QUERY_KEY = ["admin", "roles"] as const;

/** Custom instance roles; built-in admin and user are not included. */
function useAdminRoles({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return useQuery({
    queryKey: [...ADMIN_ROLES_QUERY_KEY, userId],
    queryFn: getAdminRoles,
    enabled: enabled && userId !== "",
  });
}

export default useAdminRoles;
