"use client";

import React from "react";
import { FolderKanban, Plus, CheckSquare } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TasksSidebar() {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    tasks,
    setIsCreateOpen,
  } = useTasks();

  return (
    <div className="flex h-full w-60 flex-col border-r border-border/50 bg-muted/10 p-3 shrink-0">
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Teams & Projects
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreateOpen(true)}
          className="size-6 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto">
        {projects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          const count = tasks.filter((t) => t.projectId === p.id).length;

          return (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
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
              <span className="rounded-full bg-muted/60 px-1.5 py-0.2 text-[10px] text-muted-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
