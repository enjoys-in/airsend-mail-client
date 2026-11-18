"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "../_components/providers/account-provider";
import { filesApiClient } from "../_lib/files-client";
import type { DriveInfo, PinnedFile } from "../_lib/files-types";

export function useDriveOps() {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();

  const driveInfoQuery = useQuery<DriveInfo>({
    queryKey: ["driveInfo", providerId, accountId],
    queryFn: () => filesApiClient.getDriveInfo(providerId, accountId),
    enabled: !!providerId && !!accountId,
  });

  const pinnedFilesQuery = useQuery<PinnedFile[]>({
    queryKey: ["pinnedFiles", providerId, accountId],
    queryFn: () => filesApiClient.getPinnedFiles(providerId, accountId),
    enabled: !!providerId && !!accountId,
  });

  const pinFileMutation = useMutation({
    mutationFn: (fileId: string) => filesApiClient.pinFile(fileId, providerId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pinnedFiles", providerId, accountId] });
    },
  });

  const unpinFileMutation = useMutation({
    mutationFn: (fileId: string) => filesApiClient.unpinFile(fileId, providerId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pinnedFiles", providerId, accountId] });
    },
  });

  return {
    driveInfo: driveInfoQuery.data,
    isLoadingDriveInfo: driveInfoQuery.isLoading,
    pinnedFiles: pinnedFilesQuery.data ?? [],
    isLoadingPinnedFiles: pinnedFilesQuery.isLoading,
    pinFile: pinFileMutation.mutate,
    unpinFile: unpinFileMutation.mutate,
  };
}
