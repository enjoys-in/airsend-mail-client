"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApiClient } from "../_lib/files-client";
import type { DriveProvider } from "../_lib/files-types";
import { toast } from "sonner";

export function useUnlinkAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId, accountId }: { providerId: DriveProvider; accountId: string }) => {
      return filesApiClient.unlinkAccount(providerId, accountId);
    },
    onSuccess: () => {
      toast.success("Account unlinked successfully");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to unlink account");
    },
  });
}
