import { useDefaultAccountProvider } from "@nimbus/_components/providers/default-account-provider";
import type { ApiResponse, DriveProvider } from "@nimbus/_packages/shared";
import env from "@nimbus/_packages/env/client";
import { toast } from "sonner";

export const useUnlinkAccount = () => {
	const { defaultAccountId, defaultProviderId } = useDefaultAccountProvider();

	/** Removes a connected storage account. `tableAccountId` is the account row id (`LimitedAccessAccount.id`). */
	const unlinkAccount = async (provider: DriveProvider, accountId: string, tableAccountId: string) => {
		if (defaultAccountId === accountId && provider === defaultProviderId) {
			toast.error("Cannot disconnect the default account. Set another account as default first.");
			return;
		}
		const response = await fetch(`${env.VITE_BACKEND_URL}/api/account/${encodeURIComponent(tableAccountId)}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!response.ok) {
			const data = (await response.json().catch(() => ({}))) as Partial<ApiResponse>;
			return { error: { message: data.message || "Failed to disconnect account" } };
		}
		return { error: null };
	};

	return { unlinkAccount };
};
