"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserSchema } from "../_lib/files-types";
import { useAppSelector } from "@/store/hooks";

export function useGetUser() {
  const account = useAppSelector((s) => s.accounts?.currAccount);

  return useQuery<UserSchema>({
    queryKey: ["user-info", account?.email, account?.mid],
    queryFn: async () => {
      return {
        id: account?.mid || "current-user",
        name: account?.name || account?.email?.split("@")[0] || "User",
        email: account?.email || "user@airsend.in",
      };
    },
  });
}
