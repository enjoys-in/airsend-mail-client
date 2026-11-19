import { useTranslation } from "react-i18next";
import { IntegrationCheckLine } from "@tasks/_components/project/integrations/panel/integration-check-line";
import { IntegrationPanelSection } from "@tasks/_components/project/integrations/panel/integration-panel-section";
import { Button } from "@tasks/_components/ui/button";

type CodeHostingLoadErrorProps = {
  error: unknown;
  onRetry: () => void;
};

export function CodeHostingLoadError({
  error,
  onRetry,
}: CodeHostingLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <IntegrationPanelSection>
      <IntegrationCheckLine
        tone="destructive"
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {t("settings:codeHosting.retry")}
          </Button>
        }
      >
        {error instanceof Error && error.message
          ? error.message
          : t("settings:codeHosting.loadError")}
      </IntegrationCheckLine>
    </IntegrationPanelSection>
  );
}
