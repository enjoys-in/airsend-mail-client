"use client";

import React, { useState } from "react";
import {
  House, Inbox, CircleCheck, Users, FolderKanban,
  Plus, UserPlus, Settings, ChevronRight,
} from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { SettingsSidebar } from "../settings/SettingsSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

export function TasksSidebar() {
  const {
    projects, selectedProjectId, setSelectedProjectId,
    tasks, assignedTasks, viewMode, setViewMode,
    setIsProjectCreateOpen, openSettings,
  } = useTasks();

  const [projectsOpen, setProjectsOpen] = useState(true);

  if (viewMode === "settings") {
    return <SettingsSidebar />;
  }

  const unreadCount = 2; // sample unread notifications
  const navMainItems = [
    { id: "home", label: "Home", icon: House, count: undefined, active: viewMode === "home" },
    { id: "inbox", label: "Inbox", icon: Inbox, count: unreadCount, emphasize: true, active: viewMode === "inbox" },
    { id: "my-tasks", label: "My Tasks", icon: CircleCheck, count: assignedTasks.length, active: viewMode === "my-tasks" },
    { id: "members", label: "Members", icon: Users, count: undefined, active: viewMode === "members" },
  ];

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background border-r border-border/40 select-none">
      {/* Workspace Header */}
      <SidebarHeader className="p-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5 px-1 py-0.5">
          <div className="size-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate leading-none">Airsend Mail</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">Workspace</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 space-y-4 overflow-y-auto">
        {/* NavMain */}
        <div className="space-y-0.5">
          {navMainItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as any)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                  item.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count != null && item.count > 0 && (
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                      item.emphasize ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* NavProjects */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-0.5">
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className={cn("size-3 transition-transform", projectsOpen && "rotate-90")} />
              <span>Projects</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProjectCreateOpen(true)}
              className="size-5 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Create Project"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          {projectsOpen && (
            <div className="space-y-0.5">
              {projects.map((p) => {
                const count = tasks.filter((t) => t.projectId === p.id).length;
                const isSelected =
                  ["board", "list", "calendar", "gantt"].includes(viewMode) &&
                  p.id === selectedProjectId;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      if (!["board", "list", "calendar", "gantt"].includes(viewMode)) {
                        setViewMode("board");
                      }
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="rounded-full bg-muted/60 px-1.5 py-0.2 text-[10px] text-muted-foreground font-mono">
                      {p.taskCount ?? count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SidebarContent>

      {/* NavSecondary Footer */}
      <SidebarFooter className="border-t border-border/40 p-2 space-y-0.5">
        <button
          onClick={() => {
            const email = prompt("Invite email to workspace:");
            if (email) toast.success(`Invited ${email}`);
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
        >
          <UserPlus className="size-4" />
          <span>Invite People</span>
        </button>
        <button
          onClick={() => openSettings()}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
export default TasksSidebar;
