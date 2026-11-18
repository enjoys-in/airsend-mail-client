"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserSchema } from "../_lib/files-types";

export function useGetUser() {
  return useQuery<UserSchema>({
    queryKey: ["user-info"],
    queryFn: async () => {
      // In AirSend mail client, user is authenticated
      return {
        id: "current-user",
        name: "User",
        email: "user@airsend.in",
      };
    },
  });
}
