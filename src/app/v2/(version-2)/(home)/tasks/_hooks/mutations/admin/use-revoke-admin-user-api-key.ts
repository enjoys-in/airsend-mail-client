import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_AUDIT_LOG_QUERY_KEY } from "@tasks/_hooks/queries/admin/use-admin-audit-log";
import { revokeAdminUserApiKey } from "@tasks/_fetchers/admin/revoke-admin-user-api-key";
import { adminUserApiKeysQueryKey } from "@tasks/_hooks/queries/admin/use-admin-user-api-keys";

function useRevokeAdminUserApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAdminUserApiKey,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ADMIN_AUDIT_LOG_QUERY_KEY,
        refetchType: "all",
      }),
    onSettled: (_data, _error, { userId }) =>
      queryClient.invalidateQueries({
        queryKey: adminUserApiKeysQueryKey(userId),
      }),
  });
}

export default useRevokeAdminUserApiKey;
