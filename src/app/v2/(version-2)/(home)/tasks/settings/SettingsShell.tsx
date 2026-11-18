"use client";

import React, { useEffect } from "react";
import { useTasks } from "../_lib/tasks-context";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsPage } from "./SettingsPage";
import { WorkspaceGeneralTab } from "./WorkspaceGeneralTab";
import { WorkspaceMembersTab } from "./WorkspaceMembersTab";
import { WorkspaceLabelsTab } from "./WorkspaceLabelsTab";
import { WorkspaceApiKeysTab } from "./WorkspaceApiKeysTab";
import { WorkspacePreferencesTab } from "./WorkspacePreferencesTab";
import { ProjectGeneralTab } from "./ProjectGeneralTab";
import { ProjectColumnsTab } from "./ProjectColumnsTab";
import { ProjectVisibilityTab } from "./ProjectVisibilityTab";
import { CustomFieldsTab } from "./CustomFieldsTab";
import { AdminOverviewTab } from "./AdminOverviewTab";

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

  const projectName = currentProject?.name || "Project";

  const registry: Record<string, SectionMeta> = {
    "workspace-general": {
      sectionTitle: "Workspace",
      pageTitle: "General Settings",
      description: "Manage global workspace properties, branding, and danger zone.",
      component: <WorkspaceGeneralTab />,
    },
    "workspace-members": {
      sectionTitle: "Workspace",
      pageTitle: "Roles & Members",
      description: "Manage members, invites, and team access permissions.",
      component: <WorkspaceMembersTab />,
    },
    "workspace-labels": {
      sectionTitle: "Workspace",
      pageTitle: "Labels & Tags",
      description: "Create and customize labels available across all workspace projects.",
      component: <WorkspaceLabelsTab />,
    },
    "account-preferences": {
      sectionTitle: "Account",
      pageTitle: "Preferences",
      description: "Personalize your display options, theme, and default views.",
      component: <WorkspacePreferencesTab />,
    },
    "account-apikeys": {
      sectionTitle: "Account",
      pageTitle: "API Keys",
      description: "Manage personal and developer tokens for Tasks API integration.",
      component: <WorkspaceApiKeysTab />,
    },
    "project-general": {
      sectionTitle: projectName,
      pageTitle: "Project General",
      description: `Settings for ${projectName}, including key slug prefix and deletion.`,
      component: <ProjectGeneralTab />,
    },
    "project-workflow": {
      sectionTitle: projectName,
      pageTitle: "Workflow Columns",
      description: "Configure custom kanban columns, done status triggers, and ordering.",
      component: <ProjectColumnsTab />,
    },
    "project-custom-fields": {
      sectionTitle: projectName,
      pageTitle: "Custom Fields",
      description: "Define custom metadata fields attached to issues in this project.",
      component: <CustomFieldsTab />,
    },
    "project-visibility": {
      sectionTitle: projectName,
      pageTitle: "Project Visibility",
      description: "Configure project privacy, member access, and visibility.",
      component: <ProjectVisibilityTab />,
    },
    "admin-overview": {
      sectionTitle: "Administration",
      pageTitle: "Instance Overview",
      description: "High-level overview of services, database schemas, and metrics.",
      component: <AdminOverviewTab />,
    },
  };

  const current = registry[settingsSection] || registry["workspace-general"];

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
