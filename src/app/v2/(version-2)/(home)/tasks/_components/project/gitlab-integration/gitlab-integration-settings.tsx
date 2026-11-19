import { CodeHostingLoadError } from "@tasks/_components/project/code-hosting/code-hosting-load-error";
import { CodeHostingPanelSkeleton } from "@tasks/_components/project/code-hosting/code-hosting-panel-skeleton";
import { GitlabConnectedPanel } from "@tasks/_components/project/gitlab-integration/gitlab-connected-panel";
import { GitlabSetupPanel } from "@tasks/_components/project/gitlab-integration/gitlab-setup-panel";
import useGetGitlabIntegration from "@tasks/_hooks/queries/gitlab-integration/use-get-gitlab-integration";

type GitlabIntegrationSettingsProps = {
  projectId: string;
};

export function GitlabIntegrationSettings({
  projectId,
}: GitlabIntegrationSettingsProps) {
  const {
    data: integration,
    isLoading,
    error,
    refetch,
  } = useGetGitlabIntegration(projectId);

  if (isLoading) return <CodeHostingPanelSkeleton />;
  if (error && !integration)
    return (
      <CodeHostingLoadError error={error} onRetry={() => void refetch()} />
    );
  if (!integration) return <GitlabSetupPanel projectId={projectId} />;

  return (
    <GitlabConnectedPanel projectId={projectId} integration={integration} />
  );
}
