import { type ApiResponse, type DriveProvider } from "@nimbus/_packages/shared";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useDefaultAccountProvider } from "@nimbus/_components/providers/default-account-provider";
import { useUserInfoProvider } from "@nimbus/_components/providers/user-info-provider";
import { ConnectAccountDialog } from "@nimbus/_components/dialogs/connect-account-dialog";
import { useUnlinkAccount } from "@nimbus/_hooks/useUnlinkAccount";
import { protectedClient } from "@nimbus/_utils/client";

import { ConnectedAccountsSection } from "@nimbus/_components/settings/connected-accounts-section";
import { ProfileSection } from "@nimbus/_components/settings/profile-section";
import { SettingsHeader } from "@nimbus/_components/settings/header";

export const Route = createFileRoute("/_protected/dashboard/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user, accounts, refreshAccounts } = useUserInfoProvider();
	const { defaultAccountId } = useDefaultAccountProvider();
	const { unlinkAccount } = useUnlinkAccount();
	const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
	const [isConnectOpen, setIsConnectOpen] = useState(false);

	const handleDisconnectAccount = async (provider: DriveProvider, accountId: string, tableAccountId: string) => {
		const toastErrorMessage = `Failed to disconnect account. Account ID: ${accountId}`;

		try {
			const response = await unlinkAccount(provider, accountId, tableAccountId);
			if (response?.error) {
				throw new Error(response.error.message || toastErrorMessage);
			}
			if (response) {
				await refreshAccounts();
				toast.success(`Disconnected account`);
			}
		} catch (error) {
			console.error(`Failed to disconnect account`, error);
			toast.error(toastErrorMessage);
		}
	};

	const handleSetDefaultAccount = async (provider: DriveProvider, accountId: string) => {
		setIsSettingDefault(accountId);
		const toastErrorMessage = `Failed to set default account. Account ID: ${accountId}`;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.user.$put({
				json: {
					defaultProviderId: provider,
					defaultAccountId: accountId,
				},
			});
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`Account set as default`);
		} catch (error) {
			console.error("Failed to set default account:", error);
			toast.error(toastErrorMessage);
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
		const toastErrorMessage = `Failed to update account. Account ID: ${accountId}`;

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
			toast.success(`Account updated`);
		} catch (error) {
			console.error("Failed to update account:", error);
			toast.error(toastErrorMessage);
		}
	};

	return (
		<div className="flex flex-1 flex-col">
			<SettingsHeader />
			<div className="container mx-auto w-200 flex-1 space-y-6 p-6">
				<ProfileSection name={user?.name || ""} email={user?.email || ""} previewUrl={user?.image || null} />

				<ConnectedAccountsSection
					accounts={accounts}
					defaultAccountId={defaultAccountId}
					isSettingDefault={isSettingDefault}
					onDisconnect={handleDisconnectAccount}
					onAddAccount={() => setIsConnectOpen(true)}
					onSetDefault={handleSetDefaultAccount}
					onUpdateAccount={handleUpdateAccount}
				/>
			</div>

			<ConnectAccountDialog open={isConnectOpen} onOpenChange={setIsConnectOpen} />
		</div>
	);
}
