import type { IntegrationStatus } from "@tasks/_components/project/integrations/get-integration-status";
import type {
  IntegrationDefinition,
  IntegrationId,
} from "@tasks/_components/project/integrations/integration-definitions";
import { providerType } from "./filter-enabled-integrations";
import { IntegrationRow } from "@tasks/_components/project/integrations/integration-row";
import { SettingsCard } from "@tasks/_components/settings/settings-card";
import { SettingsSection } from "@tasks/_components/settings/settings-section";

type IntegrationsGroupProps = {
  onRetry: (id: IntegrationId) => void;
  title: string;
  integrations: IntegrationDefinition[];
  projectId: string;
  disabledProviders: readonly string[];
  statuses: Partial<Record<IntegrationId, IntegrationStatus>>;
};

export function IntegrationsGroup({
  title,
  onRetry,
  integrations,
  projectId,
  statuses,
  disabledProviders,
}: IntegrationsGroupProps) {
  return (
    <SettingsSection title={title}>
      <SettingsCard>
        {integrations.map((integration) => (
          <IntegrationRow
            key={integration.id}
            integration={integration}
            projectId={projectId}
            status={statuses[integration.id]}
            disabled={disabledProviders.includes(providerType(integration.id))}
            onRetry={() => onRetry(integration.id)}
          />
        ))}
      </SettingsCard>
    </SettingsSection>
  );
}
