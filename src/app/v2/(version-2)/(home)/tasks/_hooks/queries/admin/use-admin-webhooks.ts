import { useQuery } from "@tanstack/react-query";
import useAuth from "@tasks/_components/providers/auth-provider/hooks/use-auth";
import { getAdminWebhooks } from "@tasks/_fetchers/admin/get-admin-webhooks";
export const ADMIN_WEBHOOKS_QUERY_KEY = ["admin", "webhooks"] as const;
export default function useAdminWebhooks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...ADMIN_WEBHOOKS_QUERY_KEY, user?.id],
    queryFn: getAdminWebhooks,
    enabled: Boolean(user?.id),
  });
}
