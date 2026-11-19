"use client";

import React, { Suspense } from "react";
import { SigninAccountDialog } from "@nimbus/_components/auth/signin-account-dialog";
import { AccountProvider } from "@nimbus/_components/providers/account-provider";
import DndKitProvider from "@nimbus/_components/providers/dnd-kit-provider";
import { FileTable } from "@nimbus/_components/dashboard/file-browser";
import { useGetFiles } from "@nimbus/_hooks/useFileOperations";
import { Header } from "@nimbus/_components/dashboard/header";
import { useNavigate, useSearch } from "@nimbus/_lib/router-shim";
import { Loader2 } from "lucide-react";

function DrivePageContent({ params }: { params?: Promise<{ providerSlug: string; accountId: string }> }) {
  const search = useSearch();
  const navigate = useNavigate();
  const currentFolderId = search.folderId || "root";
  const connectAccount = search.connectAccount;

  const handleSigninOpenChange = (open: boolean) => {
    navigate({
      replace: true,
      search: (prev) => {
        const next = { ...prev };
        if (open) {
          next.connectAccount = true;
        } else {
          delete next.connectAccount;
        }
        return next;
      },
    });
  };

  const { data, isLoading, refetch, error } = useGetFiles({
    parentId: currentFolderId,
    pageSize: 30,
    returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
  });

  return (
    <AccountProvider>
      <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden bg-background">
        <DndKitProvider parentId={currentFolderId}>
          <Header />
          <main className="flex-1 overflow-auto p-4">
            <FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error} />
          </main>
        </DndKitProvider>
        <SigninAccountDialog open={!!connectAccount} onOpenChange={handleSigninOpenChange} />
      </div>
    </AccountProvider>
  );
}

export default function ProviderDrivePage(props: { params: Promise<{ providerSlug: string; accountId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DrivePageContent params={props.params} />
    </Suspense>
  );
}
