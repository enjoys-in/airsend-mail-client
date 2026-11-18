"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Settings, Shield, Tag, FolderKanban,
  Columns3, Globe, KeyRound, SlidersHorizontal,
  ChevronDown, LayoutDashboard, Type,
} from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";

const ACCOUNT_LINKS = [
  { id: "account-preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "account-apikeys", label: "API Keys", icon: KeyRound },
];

const WORKSPACE_LINKS = [
  { id: "workspace-general", label: "General", icon: Settings },
  { id: "workspace-members", label: "Roles & Members", icon: Shield },
  { id: "workspace-labels", label: "Labels", icon: Tag },
];

const PROJECT_SECTIONS = [
  { id: "project-general", label: "General", icon: FolderKanban },
  { id: "project-workflow", label: "Workflow", icon: Columns3 },
  { id: "project-custom-fields", label: "Custom Fields", icon: Type },
  { id: "project-visibility", label: "Visibility", icon: Globe },
];

export function SettingsSidebar() {
  const {
    projects, selectedProjectId, setSelectedProjectId,
    settingsSection, setSettingsSection, closeSettings,
  } = useTasks();

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    [selectedProjectId || ""]: true,
  }));

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background border-r border-border/40 select-none">
      <SidebarHeader className="p-2 border-b border-border/40">
        <button
          onClick={closeSettings}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5 text-muted-foreground" />
          <span>Back to Workspace</span>
        </button>
      </SidebarHeader>

      <SidebarContent className="p-2 space-y-4 overflow-y-auto">
        {/* Account */}
        <div className="space-y-0.5">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Account
          </span>
          {ACCOUNT_LINKS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSettingsSection(id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                settingsSection === id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="space-y-0.5">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Airsend Mail
          </span>
          {WORKSPACE_LINKS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSettingsSection(id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                settingsSection === id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Projects */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Projects
          </span>
          {projects.map((proj) => {
            const isOpen = expanded[proj.id] ?? false;
            return (
              <div key={proj.id} className="space-y-0.5">
                <button
                  onClick={() => { toggle(proj.id); setSelectedProjectId(proj.id); }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderKanban className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  <ChevronDown className={cn("size-3 text-muted-foreground transition-transform", !isOpen && "-rotate-90")} />
                </button>

                {isOpen && (
                  <div className="pl-4 space-y-0.5 border-l border-border/40 ml-2">
                    {PROJECT_SECTIONS.map(({ id, label, icon: Icon }) => {
                      const active = settingsSection === id && selectedProjectId === proj.id;
                      return (
                        <button
                          key={id}
                          onClick={() => { setSelectedProjectId(proj.id); setSettingsSection(id); }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors text-left cursor-pointer",
                            active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <Icon className="size-3" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Administration */}
        <div className="space-y-0.5">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Administration
          </span>
          <button
            onClick={() => setSettingsSection("admin-overview")}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
              settingsSection === "admin-overview" ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <LayoutDashboard className="size-3.5" />
            <span>Overview</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
export default SettingsSidebar;
