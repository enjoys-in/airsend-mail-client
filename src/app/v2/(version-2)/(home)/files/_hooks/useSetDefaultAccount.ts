import { serviceFetch } from "@/app/v2/(version-2)/(home)/files/_lib/service-unavailable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import env from "@/app/v2/(version-2)/(home)/files/_packages/env/client";
import { SESSION_QUERY_KEY } from "@/app/v2/(version-2)/(home)/files/_lib/session";

/** PUT /api/account/:id/default - makes a storage account the organization's default (owners and admins only). */
export function useSetDefaultAccount() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (tableAccountId: string) => {
			const response = await serviceFetch(`${env.VITE_BACKEND_URL}/api/account/${encodeURIComponent(tableAccountId)}/default`, {
				method: "PUT",
				credentials: "include",
			});
			if (!response.ok) {
				const data = (await response.json().catch(() => null)) as { message?: string } | null;
				throw new Error(data?.message || "Failed to change the default storage");
			}
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["accounts"] }),
				queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY }),
			]);
		},
	});
}
