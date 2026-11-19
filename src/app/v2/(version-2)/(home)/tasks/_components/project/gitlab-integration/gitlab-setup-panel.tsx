import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessVerificationLine } from "@tasks/_components/project/code-hosting/access-verification-line";
import { isAccessVerified } from "@tasks/_components/project/code-hosting/access-verification-tone";
import { isValidUrl } from "@tasks/_components/project/code-hosting/is-valid-url";
import { RepositoryChoiceStep } from "@tasks/_components/project/code-hosting/repository-choice-step";
import {
  GITLAB_CLOUD_URL,
  type GitlabTokenType,
  isValidProjectPath,
  normalizeProjectPath,
} from "@tasks/_components/project/gitlab-integration/gitlab-access";
import { GitlabProjectPicker } from "@tasks/_components/project/gitlab-integration/gitlab-project-picker";
import { GitlabSignInStep } from "@tasks/_components/project/gitlab-integration/gitlab-sign-in-step";
import { useGitlabVerification } from "@tasks/_components/project/gitlab-integration/use-gitlab-verification";
import { useSaveGitlabIntegration } from "@tasks/_components/project/gitlab-integration/use-save-gitlab-integration";
import { IntegrationPanel } from "@tasks/_components/project/integrations/panel/integration-panel";
import { IntegrationPanelFooter } from "@tasks/_components/project/integrations/panel/integration-panel-footer";
import { IntegrationSteps } from "@tasks/_components/project/integrations/panel/integration-steps";
import { Button } from "@tasks/_components/ui/button";

type GitlabSetupPanelProps = {
  projectId: string;
};

export function GitlabSetupPanel({ projectId }: GitlabSetupPanelProps) {
  const { t } = useTranslation();
  const [baseUrl, setBaseUrl] = useState(GITLAB_CLOUD_URL);
  const [token, setToken] = useState("");
  const [tokenType, setTokenType] = useState<GitlabTokenType>("private");
  const [path, setPath] = useState("");
  const [touched, setTouched] = useState({ baseUrl: false, path: false });
  const [browsing, setBrowsing] = useState(false);
  const { save, saving } = useSaveGitlabIntegration(projectId);

  const trimmedUrl = baseUrl.trim();
  const trimmedToken = token.trim();
  const urlValid = isValidUrl(trimmedUrl);
  const projectPath = normalizeProjectPath(path);
  const pathValid = isValidProjectPath(path);
  const access =
    urlValid && pathValid && trimmedToken
      ? {
          baseUrl: trimmedUrl,
          accessToken: trimmedToken,
          tokenType,
          projectPath,
        }
      : null;
  const verification = useGitlabVerification(projectId, access);
  const verified = isAccessVerified(verification.result);
  const blocked = verification.result !== undefined && !verified;

  const baseUrlError = !touched.baseUrl
    ? null
    : !trimmedUrl
      ? t("settings:gitlabIntegration.validation.baseUrlRequired")
      : urlValid
        ? null
        : t("settings:gitlabIntegration.validation.baseUrlInvalid");
  const pathInvalid = touched.path && path.trim() !== "" && !pathValid;

  return (
    <>
      <IntegrationPanel>
        <IntegrationSteps>
          <GitlabSignInStep
            baseUrl={baseUrl}
            token={token}
            tokenType={tokenType}
            baseUrlError={baseUrlError}
            disabled={saving}
            onBaseUrlChange={setBaseUrl}
            onBaseUrlBlur={() =>
              setTouched((current) => ({ ...current, baseUrl: true }))
            }
            onTokenChange={setToken}
            onTokenTypeChange={setTokenType}
          />
          <RepositoryChoiceStep
            title={t("settings:codeHosting.chooseProjectTitle")}
            description={t(
              "settings:gitlabIntegration.chooseProjectDescription",
            )}
            inputLabel={t("settings:gitlabIntegration.projectPathLabel")}
            placeholder="group/subgroup/project"
            value={path}
            invalidMessage={
              pathInvalid
                ? t("settings:gitlabIntegration.validation.pathInvalid")
                : null
            }
            disabled={saving}
            browseDisabled={!trimmedUrl || !trimmedToken}
            status={
              <AccessVerificationLine
                {...verification}
                fallbackError={t(
                  "settings:gitlabIntegration.toast.verifyError",
                )}
              />
            }
            onChange={setPath}
            onBlur={() => setTouched((current) => ({ ...current, path: true }))}
            onBrowse={() => setBrowsing(true)}
          />
        </IntegrationSteps>
        <IntegrationPanelFooter>
          <Button
            type="button"
            loading={saving}
            disabled={!access || blocked}
            onClick={() => {
              if (access) void save(access, verified);
            }}
          >
            {t("settings:codeHosting.connectProject")}
          </Button>
        </IntegrationPanelFooter>
      </IntegrationPanel>
      <GitlabProjectPicker
        open={browsing}
        projectId={projectId}
        onOpenChange={setBrowsing}
        onSelectProject={(selected) => {
          setPath(selected);
          setTouched((current) => ({ ...current, path: true }));
        }}
        selectedProjectPath={projectPath || undefined}
        baseUrl={trimmedUrl}
        accessToken={trimmedToken}
        tokenType={tokenType}
      />
    </>
  );
}
