import { useDebouncedCheck } from "@tasks/_components/project/code-hosting/use-debounced-check";
import {
  type GitlabAccess,
  gitlabAccessKey,
} from "@tasks/_components/project/gitlab-integration/gitlab-access";
import { useVerifyGitlabAccess } from "@tasks/_hooks/mutations/gitlab-integration/use-create-gitlab-integration";

export function useGitlabVerification(
  projectId: string,
  access: (GitlabAccess & { accessToken: string }) | null,
) {
  const { mutateAsync: verify } = useVerifyGitlabAccess();

  return useDebouncedCheck(access ? gitlabAccessKey(access) : null, () => {
    if (!access) throw new Error("Missing GitLab access");
    return verify({
      projectId,
      baseUrl: access.baseUrl,
      accessToken: access.accessToken,
      tokenType: access.tokenType,
      projectPath: access.projectPath,
    });
  });
}
