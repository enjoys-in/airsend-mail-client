import { useDefaultAccountProvider } from "@nimbus/_components/providers/default-account-provider";
import { authClient } from "@nimbus/_packages/auth/auth-client";
import type { DriveProvider } from "@nimbus/_packages/shared";
import { toast } from "sonner";

export const useUnlinkAccount = () => {
	const { defaultAccountId, defaultProviderId } = useDefaultAccountProvider();

	const unlinkAccount = async (provider: DriveProvider, accountId: string) => {
		if (defaultAccountId === accountId && provider === defaultProviderId) {
			toast.error("Cannot disconnect the default account. Set another account as default first.");
			return;
		}
		return await authClient.unlinkAccount({
			providerId: provider,
			accountId,
		});
	};

	return { unlinkAccount };
};
