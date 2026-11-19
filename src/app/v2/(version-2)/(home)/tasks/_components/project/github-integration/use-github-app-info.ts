import { useQuery } from "@tanstack/react-query";
import getGitHubAppInfo from "@tasks/_fetchers/github-integration/get-app-info";
import { authClient } from "@tasks/_lib/auth-client";

export function useGithubAppInfo(enabled = true) {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["github-app-info", session?.user.id],
    queryFn: getGitHubAppInfo,
    enabled: enabled && Boolean(session?.user.id),
  });
}
