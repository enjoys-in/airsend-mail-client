"use client";

import React, { useState } from "react";
import { Settings, FolderKanban, Tag } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectColumnsTab } from "./ProjectColumnsTab";
import { WorkspaceLabelsTab } from "./WorkspaceLabelsTab";

export function TasksSettingsDialog() {
  const { isSettingsOpen, setIsSettingsOpen, currentProject } = useTasks();
  const [activeTab, setActiveTab] = useState<"columns" | "labels">("columns");

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Settings className="size-4 text-primary" />
            Tasks & Workflow Settings
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex border-b border-border/40 gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("columns")}
            className={`h-8 px-2 text-xs gap-1.5 rounded-none border-b-2 shadow-none ${
              activeTab === "columns"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <FolderKanban className="size-3.5" />
            Project Columns
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("labels")}
            className={`h-8 px-2 text-xs gap-1.5 rounded-none border-b-2 shadow-none ${
              activeTab === "labels"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <Tag className="size-3.5" />
            Workspace Labels
          </Button>
        </div>

        {/* Tab Content */}
        <div className="py-2">
          {activeTab === "columns" ? <ProjectColumnsTab /> : <WorkspaceLabelsTab />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
