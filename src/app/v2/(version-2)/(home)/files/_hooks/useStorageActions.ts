import type { ApiResponse, DriveProvider } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { useUserInfoProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/user-info-provider";
import { useSetDefaultAccount } from "@/app/v2/(version-2)/(home)/files/_hooks/useSetDefaultAccount";
import { useUnlinkAccount } from "@/app/v2/(version-2)/(home)/files/_hooks/useUnlinkAccount";
import { protectedClient } from "@/app/v2/(version-2)/(home)/files/_utils/client";
import { useState } from "react";
import { toast } from "sonner";

/**
 * What an owner or admin can do to the organization's storage accounts (the backend refuses everyone else): remove one, make
 * one the default, rename one. Each refreshes the list and reports the outcome in a toast.
 */
export function useStorageActions() {
	const { refreshAccounts } = useUserInfoProvider();
	const { unlinkAccount } = useUnlinkAccount();
	const setDefault = useSetDefaultAccount();
	const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

	const disconnect = async (provider: DriveProvider, accountId: string, tableAccountId: string) => {
		const fallback = `Failed to remove the storage account. Account ID: ${accountId}`;
		try {
			const response = await unlinkAccount(provider, accountId, tableAccountId);
			if (response?.error) throw new Error(response.error.message || fallback);
			if (response) {
				await refreshAccounts();
				toast.success("Storage removed");
			}
		} catch (error) {
			console.error("Failed to remove storage", error);
			toast.error(error instanceof Error && error.message ? error.message : fallback);
		}
	};

	const makeDefault = async (tableAccountId: string) => {
		setIsSettingDefault(tableAccountId);
		try {
			await setDefault.mutateAsync(tableAccountId);
			toast.success("Default storage changed");
		} catch (error) {
			console.error("Failed to change the default storage:", error);
			toast.error(error instanceof Error && error.message ? error.message : "Failed to change the default storage");
		} finally {
			setIsSettingDefault(null);
		}
	};

	const rename = async (_provider: DriveProvider, accountId: string, tableAccountId: string, nickname: string) => {
		const fallback = `Failed to update storage. Account ID: ${accountId}`;
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.account.$put({ json: { id: tableAccountId, nickname } });
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || fallback);
			}
			await refreshAccounts();
			toast.success("Storage updated");
		} catch (error) {
			console.error("Failed to update storage:", error);
			toast.error(fallback);
			// The row's own editor keeps its input open when this rejects.
			throw error;
		}
	};

	return { isSettingDefault, disconnect, makeDefault, rename };
}
