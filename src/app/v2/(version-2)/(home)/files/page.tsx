"use client";

import React, { Suspense } from "react";
import { Header } from "./_components/header";
import { FileTable } from "./_components/file-browser";
import { FilePreview } from "./_components/file-browser/file-preview";
import DndKitProvider from "./_components/providers/dnd-kit-provider";
import { useGetFiles } from "./_hooks/useFileOperations";
import { useSearch } from "./_lib/router-shim";
import { Loader2 } from "lucide-react";

function FilesMainContent() {
  const search = useSearch();
  const currentFolderId = search.folderId || "root";

  const { data, isLoading, refetch, error } = useGetFiles({
    parentId: currentFolderId,
    pageSize: 50,
    returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
  });

  return (
    <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden bg-background">
      <DndKitProvider parentId={currentFolderId}>
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error as Error | null} />
        </main>
        <FilePreview />
      </DndKitProvider>
    </div>
  );
}

export default function FilesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <FilesMainContent />
    </Suspense>
  );
}
