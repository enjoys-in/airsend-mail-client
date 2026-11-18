"use client";

import React, { Suspense, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilesRouterProvider, useSearch } from "./_lib/router-shim";
import { UserInfoProvider } from "./_components/providers/user-info-provider";
import { AccountProvider } from "./_components/providers/account-provider";
import { SidebarInset, SidebarProvider } from "./_components/ui/sidebar";
import DndKitProvider from "./_components/providers/dnd-kit-provider";
import { AppSidebar } from "./_components/sidebar";
import { Header } from "./_components/header";
import { FileTable } from "./_components/file-browser";
import { FilePreview } from "./_components/file-browser/file-preview";
import { useGetFiles } from "./_hooks/useFileOperations";

export default function WorkspaceFilesPage() {
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
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading workspace files...</div>}>
        <FilesRouterProvider>
          <UserInfoProvider>
            <AccountProvider>
              <FilesWorkspaceView />
            </AccountProvider>
          </UserInfoProvider>
        </FilesRouterProvider>
      </Suspense>
    </QueryClientProvider>
  );
}

function FilesWorkspaceView() {
  const search = useSearch();
  const currentFolderId = search.folderId || "root";

  const { data, isLoading, refetch, error } = useGetFiles({
    parentId: currentFolderId,
    pageSize: 50,
    returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
  });

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <SidebarProvider className="h-full w-full">
        <AppSidebar />
        <SidebarInset className="flex h-full flex-1 flex-col overflow-hidden p-0">
          <DndKitProvider parentId={currentFolderId}>
            <Header />
            <main className="flex-1 overflow-auto p-4">
              <FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error as Error | null} />
            </main>
            <FilePreview />
          </DndKitProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
