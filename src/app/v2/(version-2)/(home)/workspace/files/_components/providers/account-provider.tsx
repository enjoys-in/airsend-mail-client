"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { type DriveProvider, type DriveProviderSlug, providerToSlug, slugToProvider } from "../../_lib/files-types";
import { useLocation, useNavigate, useSearch } from "../../_lib/router-shim";

interface AccountProviderContextType {
  providerId: DriveProvider | null;
  providerSlug: DriveProviderSlug | null;
  accountId: string | null;
  setDriveProviderById: (providerId: string, accountId: string) => void;
  setAccountId: (accountId: string) => void;
  setProviderId: (providerId: DriveProvider) => void;
}

const AccountProviderContext = createContext<AccountProviderContextType | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const search = useSearch();

  const [providerId, setProviderIdState] = useState<DriveProvider | null>("google");
  const [providerSlug, setProviderSlugState] = useState<DriveProviderSlug | null>("g");
  const [accountId, setAccountIdState] = useState<string | null>("default");

  const setDriveProviderById = useCallback(
    (newProviderId: string, newAccountId: string) => {
      const slug = providerToSlug(newProviderId as DriveProvider) || "g";
      setProviderIdState(newProviderId as DriveProvider);
      setProviderSlugState(slug);
      setAccountIdState(newAccountId);
      navigate({
        search: (prev) => ({
          ...prev,
          provider: newProviderId,
          account: newAccountId,
        }),
      });
    },
    [navigate]
  );

  const setAccountId = useCallback((newAccountId: string) => {
    setAccountIdState(newAccountId);
  }, []);

  const setProviderId = useCallback((newProviderId: DriveProvider) => {
    const slug = providerToSlug(newProviderId) || "g";
    setProviderIdState(newProviderId);
    setProviderSlugState(slug);
  }, []);

  const value = useMemo(
    () => ({
      providerId,
      providerSlug,
      accountId,
      setDriveProviderById,
      setAccountId,
      setProviderId,
    }),
    [providerId, providerSlug, accountId, setDriveProviderById, setAccountId, setProviderId]
  );

  return <AccountProviderContext.Provider value={value}>{children}</AccountProviderContext.Provider>;
}

export function useAccountProvider() {
  const context = useContext(AccountProviderContext);
  if (!context) {
    throw new Error("useAccountProvider must be used within an AccountProvider");
  }
  return context;
}
