"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DriveProvider, DriveProviderSlug } from "../../_lib/files-types";
import { providerToSlug, slugToProvider } from "../../_lib/files-types";
import { useNavigate, useLocation } from "../../_lib/router-shim";
import { useUserInfoProvider } from "./user-info-provider";

interface AccountProviderState {
  defaultProviderSlug: DriveProviderSlug | null;
  defaultProviderId: DriveProvider | null;
  defaultAccountId: string | null;
  error: Error | null;
  isLoading: boolean;
}

const DefaultAccountProviderContext = createContext<AccountProviderState | undefined>(undefined);

export function DefaultAccountProvider({ children }: { children: ReactNode }) {
  const { user, error: userInfoError, isLoading: userInfoIsPending } = useUserInfoProvider();
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<AccountProviderState>(() => ({
    defaultProviderSlug: "g",
    defaultProviderId: "google",
    defaultAccountId: "default",
    error: null,
    isLoading: false,
  }));

  return (
    <DefaultAccountProviderContext.Provider value={state}>
      {children}
    </DefaultAccountProviderContext.Provider>
  );
}

export function useDefaultAccountProvider() {
  const context = useContext(DefaultAccountProviderContext);
  if (context === undefined) {
    throw new Error("usage of useDefaultAccountProvider must be used within a DefaultAccountProvider");
  }
  return context;
}
