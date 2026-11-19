"use client";

import React, { useEffect } from "react";
import { useTasks } from "../_lib/tasks-context";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsPage } from "./SettingsPage";
import { AccountProfileTab } from "./AccountProfileTab";
import { AccountSecurityTab } from "./AccountSecurityTab";
import { WorkspaceGeneralTab } from "./WorkspaceGeneralTab";
import { WorkspaceMembersTab } from "./WorkspaceMembersTab";
import { WorkspaceLabelsTab } from "./WorkspaceLabelsTab";
import { WorkspaceImportTab } from "./WorkspaceImportTab";
import { WorkspaceBillingTab } from "./WorkspaceBillingTab";
import { WorkspaceApiKeysTab } from "./WorkspaceApiKeysTab";
import { WorkspacePreferencesTab } from "./WorkspacePreferencesTab";
import { ProjectGeneralTab } from "./ProjectGeneralTab";
import { ProjectColumnsTab } from "./ProjectColumnsTab";
import { ProjectVisibilityTab } from "./ProjectVisibilityTab";
import { CustomFieldsTab } from "./CustomFieldsTab";
import { ProjectIntegrationsTab } from "./ProjectIntegrationsTab";
import { ProjectCalendarFeedsTab } from "./ProjectCalendarFeedsTab";
import { AdminOverviewTab } from "./AdminOverviewTab";
import { AdminAuditLogTab } from "./AdminAuditLogTab";

interface SectionMeta {
  sectionTitle: string;
  pageTitle: string;
  description: string;
  component: React.ReactNode;
}

export function SettingsShell() {
  const { settingsSection, currentProject, closeSettings } = useTasks();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSettings]);

  const pName = currentProject?.name || "Project";

  const registry: Record<string, SectionMeta> = {
    "account-information": { sectionTitle: "Account", pageTitle: "Profile Information", description: "Manage your personal profile, display name, and avatar.", component: <AccountProfileTab /> },
    "account-preferences": { sectionTitle: "Account", pageTitle: "Preferences", description: "Personalize your display options, theme, and default views.", component: <WorkspacePreferencesTab /> },
    "account-security": { sectionTitle: "Account", pageTitle: "Security & Sessions", description: "Manage authentication, 2FA, and active browser sessions.", component: <AccountSecurityTab /> },
    "account-apikeys": { sectionTitle: "Account", pageTitle: "API Keys", description: "Manage personal and developer tokens for Tasks API integration.", component: <WorkspaceApiKeysTab /> },
    "workspace-general": { sectionTitle: "Workspace", pageTitle: "General Settings", description: "Manage global workspace properties, branding, and danger zone.", component: <WorkspaceGeneralTab /> },
    "workspace-roles": { sectionTitle: "Workspace", pageTitle: "Roles & Members", description: "Manage members, invites, and team access permissions.", component: <WorkspaceMembersTab /> },
    "workspace-labels": { sectionTitle: "Workspace", pageTitle: "Labels & Tags", description: "Create and customize labels available across all workspace projects.", component: <WorkspaceLabelsTab /> },
    "workspace-import": { sectionTitle: "Workspace", pageTitle: "Import Data", description: "Migrate issues and boards from Jira, Linear, Trello, or CSV.", component: <WorkspaceImportTab /> },
    "workspace-billing": { sectionTitle: "Workspace", pageTitle: "Plans & Billing", description: "Manage subscription seats, quotas, and invoices.", component: <WorkspaceBillingTab /> },
    "project-general": { sectionTitle: pName, pageTitle: "Project General", description: `Settings for ${pName}, including key slug prefix and deletion.`, component: <ProjectGeneralTab /> },
    "project-workflow": { sectionTitle: pName, pageTitle: "Workflow Columns", description: "Configure custom kanban columns, done status triggers, and ordering.", component: <ProjectColumnsTab /> },
    "project-custom-fields": { sectionTitle: pName, pageTitle: "Custom Fields", description: "Define custom metadata fields attached to issues in this project.", component: <CustomFieldsTab /> },
    "project-visibility": { sectionTitle: pName, pageTitle: "Project Visibility", description: "Configure project privacy, member access, and visibility.", component: <ProjectVisibilityTab /> },
    "project-integrations": { sectionTitle: pName, pageTitle: "Project Integrations", description: "Connect GitHub, GitLab, Slack, and Discord webhooks.", component: <ProjectIntegrationsTab /> },
    "project-calendar": { sectionTitle: pName, pageTitle: "Calendar Feeds", description: "Subscribe to project schedules in external calendar apps via iCal.", component: <ProjectCalendarFeedsTab /> },
    "admin-overview": { sectionTitle: "Administration", pageTitle: "Instance Overview", description: "High-level overview of services, database schemas, and metrics.", component: <AdminOverviewTab /> },
    "admin-audit-log": { sectionTitle: "Administration", pageTitle: "Audit Log", description: "Security events and administrative actions audit trail.", component: <AdminAuditLogTab /> },
  };

  const current = registry[settingsSection] || registry["account-information"];

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-hidden">
      <SettingsHeader sectionTitle={current.sectionTitle} pageTitle={current.pageTitle} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SettingsPage title={current.pageTitle} description={current.description}>
          {current.component}
        </SettingsPage>
      </div>
    </div>
  );
}
export default SettingsShell;
