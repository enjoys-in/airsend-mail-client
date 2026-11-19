import type { LimitedAccessAccount } from "@nimbus/_packages/shared";
import { createContext, useContext, useMemo } from "react";
import type { SessionUser } from "@nimbus/_packages/auth/auth";
import { useAccounts } from "@nimbus/_hooks/useAccounts";
import { useSession } from "@nimbus/_lib/session";

interface DriveProviderState {
	user: SessionUser | null;
	accounts: LimitedAccessAccount[] | null;
	error: Error | null;
	isLoading: boolean;
	refreshUser: () => Promise<void>;
	refreshAccounts: () => Promise<void>;
}

const DriveProviderContext = createContext<DriveProviderState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
	// The user comes from the session (GET /api/auth/get-session); there is no separate /api/user any more.
	const { data: session, error: userError, isPending: isUserLoading, refetch: refetchUser } = useSession();
	const user = session?.user ?? null;

	const {
		data: accounts,
		error: accountsError,
		isLoading: isAccountsLoading,
		refetch: refetchAccounts,
	} = useAccounts();

	const value = useMemo<DriveProviderState>(
		() => ({
			user: user || null,
			accounts: accounts || null,
			error: (userError || accountsError) as Error | null,
			isLoading: isUserLoading || isAccountsLoading,
			refreshUser: async () => {
				await refetchUser();
			},
			refreshAccounts: async () => {
				await refetchAccounts();
			},
		}),
		[user, accounts, userError, accountsError, isUserLoading, isAccountsLoading, refetchUser, refetchAccounts]
	);

	return <DriveProviderContext.Provider value={value}>{children}</DriveProviderContext.Provider>;
}

export function useUserInfoProvider() {
	const context = useContext(DriveProviderContext);
	if (context === undefined) {
		throw new Error("useUserInfoProvider must be used within a UserInfoProvider");
	}
	return context;
}
