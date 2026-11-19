import { MessageSquareIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CommentLinkRow } from "@tasks/_components/project/code-hosting/comment-link-row";
import { RepositoryLink } from "@tasks/_components/project/code-hosting/repository-link";
import { StoredTokenRow } from "@tasks/_components/project/code-hosting/stored-token-row";
import { GitlabChangeToken } from "@tasks/_components/project/gitlab-integration/gitlab-change-token";
import { IntegrationCheckLine } from "@tasks/_components/project/integrations/panel/integration-check-line";
import { IntegrationPanelSection } from "@tasks/_components/project/integrations/panel/integration-panel-section";
import { Button } from "@tasks/_components/ui/button";
import type { GitlabIntegration } from "@tasks/_fetchers/gitlab-integration/get-gitlab-integration";
import { useUpdateGitlabIntegration } from "@tasks/_hooks/mutations/gitlab-integration/use-update-gitlab-integration";
import { toast } from "@tasks/_lib/toast";

type GitlabRepositorySectionProps = {
  projectId: string;
  integration: GitlabIntegration;
  editingToken: boolean;
  reconnecting: boolean;
  onEditingTokenChange: (editing: boolean) => void;
  onReconnect: () => void;
};

export function GitlabRepositorySection({
  projectId,
  integration,
  editingToken,
  reconnecting,
  onEditingTokenChange,
  onReconnect,
}: GitlabRepositorySectionProps) {
  const { t } = useTranslation();
  const { mutateAsync: update, isPending } = useUpdateGitlabIntegration();
  const isConnected = Boolean(integration.isActive);
  const href = `${integration.baseUrl.replace(/\/$/, "")}/${integration.projectPath}`;

  const toggleComment = async (next: boolean) => {
    try {
      await update({
        projectId,
        json: { commentTaskLinkOnGitlabIssue: next },
      });
      toast.success(
        next
          ? t("settings:gitlabIntegration.toast.commentOnEnabled")
          : t("settings:gitlabIntegration.toast.commentOnDisabled"),
        { icon: MessageSquareIcon },
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("settings:gitlabIntegration.toast.settingsUpdateError"),
      );
    }
  };

  return (
    <IntegrationPanelSection label={t("settings:codeHosting.projectSection")}>
      <RepositoryLink
        name={integration.projectPath}
        href={href}
        label={t("settings:gitlabIntegration.openInGitlab", {
          project: integration.projectPath,
        })}
      />
      {isConnected ? null : (
        <IntegrationCheckLine
          tone="warning"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={reconnecting}
              onClick={onReconnect}
            >
              {t("settings:codeHosting.reconnect")}
            </Button>
          }
        >
          {t("settings:codeHosting.pausedHint")}
        </IntegrationCheckLine>
      )}
      {isConnected ? (
        <CommentLinkRow
          title={t("settings:gitlabIntegration.commentTaskLinkTitle")}
          description={t("settings:gitlabIntegration.commentTaskLinkHint")}
          checked={integration.commentTaskLinkOnGitlabIssue ?? true}
          disabled={isPending}
          onCheckedChange={toggleComment}
        />
      ) : null}
      <StoredTokenRow
        maskedToken={integration.maskedAccessToken}
        editing={editingToken}
        onEdit={() => onEditingTokenChange(true)}
      />
      {editingToken ? (
        <GitlabChangeToken
          projectId={projectId}
          integration={integration}
          onDone={() => onEditingTokenChange(false)}
        />
      ) : null}
    </IntegrationPanelSection>
  );
}
