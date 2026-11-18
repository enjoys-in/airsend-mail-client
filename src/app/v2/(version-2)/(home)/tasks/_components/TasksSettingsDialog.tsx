"use client";

import React, { useState } from "react";
import { Settings, FolderKanban, Columns3, Tag, Users } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectGeneralTab } from "./ProjectGeneralTab";
import { ProjectColumnsTab } from "./ProjectColumnsTab";
import { WorkspaceLabelsTab } from "./WorkspaceLabelsTab";
import { WorkspaceMembersTab } from "./WorkspaceMembersTab";

type SettingsTab = "general" | "columns" | "labels" | "members";

export function TasksSettingsDialog() {
  const { isSettingsOpen, setIsSettingsOpen } = useTasks();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const tabs: Array<{ key: SettingsTab; label: string; icon: React.ReactNode }> = [
    { key: "general", label: "General", icon: <FolderKanban className="size-3.5" /> },
    { key: "columns", label: "Workflow", icon: <Columns3 className="size-3.5" /> },
    { key: "labels", label: "Labels", icon: <Tag className="size-3.5" /> },
    { key: "members", label: "Members", icon: <Users className="size-3.5" /> },
  ];

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings className="size-4 text-primary" />
            Tasks & Workflow Settings
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex border-b border-border/40 gap-2 mt-1">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={`h-8 px-2.5 text-xs gap-1.5 rounded-none border-b-2 shadow-none transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-2">
          {activeTab === "general" && <ProjectGeneralTab />}
          {activeTab === "columns" && <ProjectColumnsTab />}
          {activeTab === "labels" && <WorkspaceLabelsTab />}
          {activeTab === "members" && <WorkspaceMembersTab />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
