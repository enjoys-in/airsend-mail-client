"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { LimitedAccessAccount, UserSchema } from "../../_lib/files-types";
import { useAccounts } from "../../_hooks/useAccounts";
import { useGetUser } from "../../_hooks/useGetUser";

interface UserInfoState {
  user: UserSchema | null;
  accounts: LimitedAccessAccount[] | null;
  error: Error | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const UserInfoContext = createContext<UserInfoState | undefined>(undefined);

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const { data: user, error: userError, isLoading: isUserLoading, refetch: refetchUser } = useGetUser();
  const { data: accounts, error: accountsError, isLoading: isAccountsLoading, refetch: refetchAccounts } = useAccounts();

  const value = useMemo<UserInfoState>(
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

  return <UserInfoContext.Provider value={value}>{children}</UserInfoContext.Provider>;
}

export function useUserInfoProvider() {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error("useUserInfoProvider must be used within a UserInfoProvider");
  }
  return context;
}
