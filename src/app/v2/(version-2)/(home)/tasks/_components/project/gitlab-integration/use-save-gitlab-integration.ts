import { useTranslation } from "react-i18next";
import { isAccessVerified } from "@tasks/_components/project/code-hosting/access-verification-tone";
import type { GitlabAccess } from "@tasks/_components/project/gitlab-integration/gitlab-access";
import {
  useCreateGitlabIntegration,
  useVerifyGitlabAccess,
} from "@tasks/_hooks/mutations/gitlab-integration/use-create-gitlab-integration";
import { toast } from "@tasks/_lib/toast";

export function useSaveGitlabIntegration(projectId: string) {
  const { t } = useTranslation();
  const { mutateAsync: verify, isPending: isVerifying } =
    useVerifyGitlabAccess();
  const { mutateAsync: create, isPending: isCreating } =
    useCreateGitlabIntegration();

  const save = async (access: GitlabAccess, alreadyVerified: boolean) => {
    try {
      if (access.accessToken && !alreadyVerified) {
        const verification = await verify({
          projectId,
          baseUrl: access.baseUrl,
          accessToken: access.accessToken,
          tokenType: access.tokenType,
          projectPath: access.projectPath,
        });
        if (!isAccessVerified(verification)) {
          toast.error(t("settings:gitlabIntegration.toast.verifyFirst"));
          return false;
        }
      }
      await create({
        projectId,
        data: {
          baseUrl: access.baseUrl,
          ...(access.accessToken ? { accessToken: access.accessToken } : {}),
          tokenType: access.tokenType,
          projectPath: access.projectPath,
        },
      });
      toast.success(t("settings:gitlabIntegration.toast.updated"));
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("settings:gitlabIntegration.toast.updateError"),
      );
      return false;
    }
  };

  return { save, saving: isVerifying || isCreating };
}
