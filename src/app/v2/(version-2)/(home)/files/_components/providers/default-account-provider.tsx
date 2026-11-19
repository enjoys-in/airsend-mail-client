import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { DriveProvider, DriveProviderSlug } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { providerToSlug } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { useUserInfoProvider } from "./user-info-provider";

interface AccountProvider {
	defaultProviderSlug: DriveProviderSlug | null;
	defaultProviderId: DriveProvider | null;
	defaultAccountId: string | null;
	error: Error | null;
	isLoading: boolean;
}

const DefaultAccountProviderContext = createContext<AccountProvider | undefined>(undefined);

// The default account is the ORGANIZATION's default storage (`isDefault`, set by an owner or admin). Until one is marked the
// first account is used.
export function DefaultAccountProvider({ children }: { children: ReactNode }) {
	const { accounts, error, isLoading } = useUserInfoProvider();
	const navigate = useNavigate();
	const pathname = useLocation().pathname;

	const state = useMemo<AccountProvider>(() => {
		const account = accounts?.find(a => a.isDefault) ?? accounts?.[0] ?? null;
		const providerId = (account?.providerId as DriveProvider | undefined) ?? null;
		return {
			defaultProviderSlug: providerId ? (providerToSlug(providerId) ?? null) : null,
			defaultProviderId: providerId,
			defaultAccountId: account?.accountId ?? null,
			error,
			isLoading,
		};
	}, [accounts, error, isLoading]);

	useEffect(() => {
		if (pathname !== "/dashboard") return;
		if (!state.defaultProviderSlug || !state.defaultAccountId) return;
		navigate({
			to: "/dashboard/$providerSlug/$accountId",
			params: { providerSlug: state.defaultProviderSlug, accountId: state.defaultAccountId },
			replace: true,
		});
	}, [pathname, state.defaultProviderSlug, state.defaultAccountId, navigate]);

	return <DefaultAccountProviderContext.Provider value={state}>{children}</DefaultAccountProviderContext.Provider>;
}

export function useDefaultAccountProvider() {
	const context = useContext(DefaultAccountProviderContext);
	if (context === undefined) {
		throw new Error("usage of useDefaultAccountProvider must be used within a DefaultAccountProvider");
	}
	return context;
}
