import { useQuery } from "@tanstack/react-query";
import { getPendingInvitations } from "@tasks/_fetchers/invitation/get-pending-invitations";
import { authClient } from "@tasks/_lib/auth-client";
import { isUnauthorizedError } from "@tasks/_lib/http-error";

export function usePendingInvitations() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["invitations", "pending", session?.user?.email],
    queryFn: getPendingInvitations,
    enabled: !!session?.user?.email,
    refetchInterval: (query) =>
      isUnauthorizedError(query.state.error) ? false : 60000,
  });
}
