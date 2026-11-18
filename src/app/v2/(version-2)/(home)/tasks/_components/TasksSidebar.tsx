"use client";

import React from "react";
import { FolderKanban, Plus, CheckSquare, Settings } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TasksSidebar() {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    assignedTasks,
    viewMode,
    setViewMode,
    setIsProjectCreateOpen,
    setIsSettingsOpen,
  } = useTasks();

  const isMyTasksActive = viewMode === "my-tasks";

  return (
    <div className="flex h-full w-60 flex-col justify-between border-r border-border/50 bg-muted/10 p-3 shrink-0">
      <div className="flex flex-col gap-3">
        {/* Top: My Tasks Quick Link */}
        <button
          onClick={() => setViewMode("my-tasks")}
          className={cn(
            "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left",
            isMyTasksActive
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-primary shrink-0" />
            <span>My Tasks</span>
          </div>
          <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground font-semibold">
            {assignedTasks.length}
          </span>
        </button>

        <div className="h-px bg-border/40" />

        {/* Section: Teams & Projects */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Teams & Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsProjectCreateOpen(true)}
            className="size-6 text-muted-foreground hover:text-foreground"
            title="Create Team / Project"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh]">
          {projects.map((p) => {
            const isSelected = !isMyTasksActive && p.id === selectedProjectId;
            const count = tasks.filter((t) => t.projectId === p.id).length;

            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id);
                  if (viewMode === "my-tasks") setViewMode("board");
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderKanban className="size-3.5 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {p.taskCount ?? count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Settings */}
      <div className="border-t border-border/40 pt-2">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Settings className="size-4 text-muted-foreground" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
