import { useDefaultAccountProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/default-account-provider";
import type { ApiResponse, DriveProvider } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import env from "@/app/v2/(version-2)/(home)/files/_packages/env/client";
import { toast } from "sonner";

export const useUnlinkAccount = () => {
	const { defaultAccountId, defaultProviderId } = useDefaultAccountProvider();

	/** Removes one of the organization's storage accounts (owners and admins only). `tableAccountId` is the account row id (`LimitedAccessAccount.id`). */
	const unlinkAccount = async (provider: DriveProvider, accountId: string, tableAccountId: string) => {
		if (defaultAccountId === accountId && provider === defaultProviderId) {
			toast.error("Cannot remove the default storage. Make another storage the default first.");
			return;
		}
		const response = await fetch(`${env.VITE_BACKEND_URL}/api/account/${encodeURIComponent(tableAccountId)}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!response.ok) {
			const data = (await response.json().catch(() => ({}))) as Partial<ApiResponse>;
			return { error: { message: data.message || "Failed to remove the storage account" } };
		}
		return { error: null };
	};

	return { unlinkAccount };
};
