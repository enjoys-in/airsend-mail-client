import { useTranslation } from "react-i18next";
import { StatusDotLine } from "@tasks/_components/project/code-hosting/status-dot-line";
import {
  describeGithubVerification,
  githubVerificationTone,
} from "@tasks/_components/project/github-integration/describe-github-verification";
import { githubVerificationMessage } from "@tasks/_components/project/github-integration/github-verification-message";
import type { VerifyGithubInstallationResponse } from "@tasks/_fetchers/github-integration/verify-github-installation";

type GithubAppStatusProps = {
  result: VerifyGithubInstallationResponse | undefined;
};

export function GithubAppStatus({ result }: GithubAppStatusProps) {
  const { t } = useTranslation();
  if (!result) return null;
  const outcome = describeGithubVerification(result);

  return (
    <StatusDotLine tone={githubVerificationTone(outcome)}>
      {githubVerificationMessage(outcome, result.message, t)}
    </StatusDotLine>
  );
}
