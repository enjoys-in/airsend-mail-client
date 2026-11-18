"use client";

import React, { useState } from "react";
import {
  Settings,
  FolderKanban,
  Columns3,
  Tag,
  Users,
  Globe,
  KeyRound,
  Sliders,
  Type,
} from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectGeneralTab } from "./ProjectGeneralTab";
import { ProjectColumnsTab } from "./ProjectColumnsTab";
import { ProjectVisibilityTab } from "./ProjectVisibilityTab";
import { WorkspaceLabelsTab } from "./WorkspaceLabelsTab";
import { WorkspaceMembersTab } from "./WorkspaceMembersTab";
import { WorkspaceApiKeysTab } from "./WorkspaceApiKeysTab";
import { WorkspacePreferencesTab } from "./WorkspacePreferencesTab";
import { CustomFieldsTab } from "./CustomFieldsTab";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general"
  | "columns"
  | "visibility"
  | "labels"
  | "members"
  | "custom-fields"
  | "api-keys"
  | "preferences";

export function TasksSettingsDialog() {
  const { isSettingsOpen, setIsSettingsOpen } = useTasks();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const navItems: Array<{ key: SettingsTab; label: string; icon: React.ReactNode }> = [
    { key: "general", label: "General", icon: <FolderKanban className="size-3.5" /> },
    { key: "columns", label: "Workflow", icon: <Columns3 className="size-3.5" /> },
    { key: "visibility", label: "Visibility", icon: <Globe className="size-3.5" /> },
    { key: "custom-fields", label: "Custom Fields", icon: <Type className="size-3.5" /> },
    { key: "labels", label: "Labels", icon: <Tag className="size-3.5" /> },
    { key: "members", label: "Members", icon: <Users className="size-3.5" /> },
    { key: "api-keys", label: "API Keys", icon: <KeyRound className="size-3.5" /> },
    { key: "preferences", label: "Preferences", icon: <Sliders className="size-3.5" /> },
  ];

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden flex flex-col h-[520px]">
        <DialogHeader className="p-4 pb-3 border-b border-border/40 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings className="size-4 text-primary" />
            Team & Workspace Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Settings Sub-Sidebar */}
          <div className="w-48 shrink-0 border-r border-border/40 bg-muted/20 p-2 flex flex-col gap-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left",
                  activeTab === item.key
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto bg-background">
            {activeTab === "general" && <ProjectGeneralTab />}
            {activeTab === "columns" && <ProjectColumnsTab />}
            {activeTab === "visibility" && <ProjectVisibilityTab />}
            {activeTab === "custom-fields" && <CustomFieldsTab />}
            {activeTab === "labels" && <WorkspaceLabelsTab />}
            {activeTab === "members" && <WorkspaceMembersTab />}
            {activeTab === "api-keys" && <WorkspaceApiKeysTab />}
            {activeTab === "preferences" && <WorkspacePreferencesTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
