import { useTranslation } from "react-i18next";
import { GithubLinkAccountButton } from "@tasks/_components/project/github-integration/github-link-account-button";
import { Button } from "@tasks/_components/ui/button";
import type { GitHubAppInfo } from "@tasks/_fetchers/github-integration/get-app-info";

type GithubReconnectActionProps = {
  appInfo: GitHubAppInfo | undefined;
  reconnecting: boolean;
  onReconnect: () => void;
};

export function GithubReconnectAction({
  appInfo,
  reconnecting,
  onReconnect,
}: GithubReconnectActionProps) {
  const { t } = useTranslation();

  if (!appInfo) return null;
  if (appInfo.accountConnected) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={reconnecting}
        onClick={onReconnect}
      >
        {t("settings:codeHosting.reconnect")}
      </Button>
    );
  }
  return appInfo.accountLinkingAvailable ? <GithubLinkAccountButton /> : null;
}
