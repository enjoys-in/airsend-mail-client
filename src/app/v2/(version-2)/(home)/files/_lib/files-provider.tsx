"use client";

import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilesRouterProvider } from "./router-shim";
import { UserInfoProvider } from "../_components/providers/user-info-provider";
import { AccountProvider } from "../_components/providers/account-provider";
import { DownloadProvider } from "../_components/providers/download-provider";

export function FilesProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FilesRouterProvider>
        <UserInfoProvider>
          <AccountProvider>
            <DownloadProvider>{children}</DownloadProvider>
          </AccountProvider>
        </UserInfoProvider>
      </FilesRouterProvider>
    </QueryClientProvider>
  );
}

export default FilesProvider;
