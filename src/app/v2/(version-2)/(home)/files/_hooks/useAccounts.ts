import type { ApiResponse, LimitedAccessAccount } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { useQuery } from "@tanstack/react-query";
import { isServiceUnavailable } from "@/app/v2/(version-2)/(home)/files/_lib/service-unavailable";
import { protectedClient } from "@/app/v2/(version-2)/(home)/files/_utils/client";

const fetchAccounts = async (): Promise<LimitedAccessAccount[]> => {
	const response = await protectedClient.api.account.$get();

	if (!response.ok) {
		const data = (await response.json()) as unknown as ApiResponse;
		throw new Error(data.message || "Failed to fetch accounts");
	}

	const accountsData = await response.json();
	return accountsData.map(account => ({
		...account,
		createdAt: new Date(account.createdAt),
		updatedAt: new Date(account.updatedAt),
	}));
};

export function useAccounts() {
	return useQuery({
		queryKey: ["accounts"],
		queryFn: fetchAccounts,
		retry: (failureCount, error) => {
			// Don't retry on 401 (unauthorized) errors, nor while the backend is down
			if (error.message.includes("401") || isServiceUnavailable(error)) return false;
			return failureCount < 3; // Retry up to 3 times for other errors
		},
	});
}
