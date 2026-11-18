"use client";

import { useQuery } from "@tanstack/react-query";
import { filesApiClient } from "../_lib/files-client";
import type { LimitedAccessAccount } from "../_lib/files-types";

export function useAccounts() {
  return useQuery<LimitedAccessAccount[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      return filesApiClient.getAccounts();
    },
    retry: 1,
  });
}
