import { useTranslation } from "react-i18next";
import { IntegrationCheckLine } from "@tasks/_components/project/integrations/panel/integration-check-line";
import { IntegrationPanel } from "@tasks/_components/project/integrations/panel/integration-panel";
import { IntegrationPanelSection } from "@tasks/_components/project/integrations/panel/integration-panel-section";
import { Button } from "@tasks/_components/ui/button";

type TelegramLoadErrorProps = {
  retrying: boolean;
  onRetry: () => void;
};

export function TelegramLoadError({
  retrying,
  onRetry,
}: TelegramLoadErrorProps) {
  const { t } = useTranslation();

  return (
    <IntegrationPanel>
      <IntegrationPanelSection>
        <IntegrationCheckLine
          action={
            <Button
              disabled={retrying}
              onClick={onRetry}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("settings:chatIntegrations.retry")}
            </Button>
          }
          tone="destructive"
        >
          {t("settings:telegramIntegration.loadError")}
        </IntegrationCheckLine>
      </IntegrationPanelSection>
    </IntegrationPanel>
  );
}
