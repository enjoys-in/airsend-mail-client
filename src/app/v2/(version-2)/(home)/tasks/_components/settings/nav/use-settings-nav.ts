import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildSettingsNav } from "@tasks/_components/settings/nav/build-settings-nav";
import useAdminAccess from "@tasks/_hooks/queries/admin/use-admin-access";
import useGetConfig from "@tasks/_hooks/queries/config/use-get-config";
import useGetProjects from "@tasks/_hooks/queries/project/use-get-projects";
import useActiveWorkspace from "@tasks/_hooks/queries/workspace/use-active-workspace";
import { useCanImport } from "@tasks/_hooks/use-can-import";

export function useSettingsNav() {
  const { t } = useTranslation();
  const { data: workspace } = useActiveWorkspace();
  const { data: projects } = useGetProjects({
    workspaceId: workspace?.id ?? "",
  });
  const { data: config } = useGetConfig();
  const { permissions: adminPermissions } = useAdminAccess();
  const { canImport } = useCanImport();

  return useMemo(
    () =>
      buildSettingsNav({
        t,
        workspaceName: workspace?.name,
        billingEnabled: Boolean(config?.billingEnabled),
        canImport,
        adminPermissions,
        projects: projects ?? [],
      }),
    [
      t,
      workspace?.name,
      config?.billingEnabled,
      canImport,
      adminPermissions,
      projects,
    ],
  );
}
