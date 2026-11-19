import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import PageTitle from "@tasks/_components/page-title";
import { AutomationsSection } from "@tasks/_components/project/automations/automations-section";
import { ColumnList } from "@tasks/_components/project/columns/column-list";
import { AutosaveNote } from "@tasks/_components/settings/autosave-note";
import { SettingsPage } from "@tasks/_components/settings/settings-page";
import { SettingsSection } from "@tasks/_components/settings/settings-section";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/projects/$projectId/workflow",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();

  return (
    <>
      <PageTitle title={t("settings:projectWorkflow.pageTitle")} />
      <SettingsPage
        title={t("settings:projectWorkflow.title")}
        description={t("settings:projectWorkflow.subtitle")}
        actions={<AutosaveNote />}
      >
        <SettingsSection
          title={t("settings:projectWorkflow.columnsTitle")}
          description={t("settings:projectWorkflow.columnsDescription")}
        >
          <ColumnList projectId={projectId} />
        </SettingsSection>
        <SettingsSection
          title={t("settings:projectWorkflow.automationTitle")}
          description={t("settings:projectWorkflow.automationDescription")}
        >
          <AutomationsSection projectId={projectId} />
        </SettingsSection>
      </SettingsPage>
    </>
  );
}
