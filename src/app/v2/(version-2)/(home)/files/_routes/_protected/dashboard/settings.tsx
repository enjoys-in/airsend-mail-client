import { type ApiResponse, type DriveProvider } from "@nimbus/_packages/shared";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useUserInfoProvider } from "@nimbus/_components/providers/user-info-provider";
import { ConnectAccountDialog } from "@nimbus/_components/dialogs/connect-account-dialog";
import { useSetDefaultAccount } from "@nimbus/_hooks/useSetDefaultAccount";
import { useUnlinkAccount } from "@nimbus/_hooks/useUnlinkAccount";
import { useOrganization } from "@nimbus/_lib/session";
import { protectedClient } from "@nimbus/_utils/client";

import { OrganizationSection } from "@nimbus/_components/settings/organization-section";
import { OrgStorageSection } from "@nimbus/_components/settings/org-storage-section";
import { ProfileSection } from "@nimbus/_components/settings/profile-section";
import { SettingsHeader } from "@nimbus/_components/settings/header";

export const Route = createFileRoute("/_protected/dashboard/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user, accounts, refreshAccounts } = useUserInfoProvider();
	const { organization, canManageStorage } = useOrganization();
	const { unlinkAccount } = useUnlinkAccount();
	const setDefault = useSetDefaultAccount();
	const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
	const [isConnectOpen, setIsConnectOpen] = useState(false);

	const handleDisconnectAccount = async (provider: DriveProvider, accountId: string, tableAccountId: string) => {
		const toastErrorMessage = `Failed to remove the storage account. Account ID: ${accountId}`;

		try {
			const response = await unlinkAccount(provider, accountId, tableAccountId);
			if (response?.error) {
				throw new Error(response.error.message || toastErrorMessage);
			}
			if (response) {
				await refreshAccounts();
				toast.success(`Storage removed`);
			}
		} catch (error) {
			console.error(`Failed to remove storage`, error);
			toast.error(error instanceof Error && error.message ? error.message : toastErrorMessage);
		}
	};

	const handleSetDefaultAccount = async (tableAccountId: string) => {
		setIsSettingDefault(tableAccountId);
		try {
			await setDefault.mutateAsync(tableAccountId);
			toast.success(`Default storage changed`);
		} catch (error) {
			console.error("Failed to change the default storage:", error);
			toast.error(error instanceof Error && error.message ? error.message : "Failed to change the default storage");
		} finally {
			setIsSettingDefault(null);
		}
	};

	const handleUpdateAccount = async (
		provider: DriveProvider,
		accountId: string,
		tableAccountId: string,
		nickname: string
	) => {
		const toastErrorMessage = `Failed to update storage. Account ID: ${accountId}`;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.account.$put({
				json: {
					id: tableAccountId,
					nickname,
				},
			});
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`Storage updated`);
		} catch (error) {
			console.error("Failed to update storage:", error);
			toast.error(toastErrorMessage);
		}
	};

	return (
		<div className="flex flex-1 flex-col">
			<SettingsHeader />
			<div className="container mx-auto w-200 flex-1 space-y-6 p-6">
				<ProfileSection name={user?.name || ""} email={user?.email || ""} previewUrl={user?.image || null} />

				<OrganizationSection organization={organization} />

				<OrgStorageSection
					accounts={accounts}
					canManage={canManageStorage}
					isSettingDefault={isSettingDefault}
					onDisconnect={handleDisconnectAccount}
					onAddAccount={() => setIsConnectOpen(true)}
					onSetDefault={handleSetDefaultAccount}
					onUpdateAccount={handleUpdateAccount}
				/>
			</div>

			{canManageStorage && <ConnectAccountDialog open={isConnectOpen} onOpenChange={setIsConnectOpen} />}
		</div>
	);
}
