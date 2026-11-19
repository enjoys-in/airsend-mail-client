"use client";

import React from "react";
import { FolderKanban, CheckCircle2, Clock, ArrowRight, Plus } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeView() {
  const {
    projects,
    tasks,
    assignedTasks,
    setSelectedProjectId,
    setViewMode,
    setSelectedTask,
    setIsProjectCreateOpen,
    setIsCreateOpen,
  } = useTasks();

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const upNextTasks = assignedTasks
    .filter((t) => t.status !== "done")
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-background">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Workspace Overview
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Track projects, sprint velocity, and your scheduled tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProjectCreateOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="size-3.5" />
            New Project
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Projects", val: projects.length, icon: FolderKanban, color: "text-blue-500" },
          { label: "Assigned to You", val: assignedTasks.length, icon: Clock, color: "text-amber-500" },
          { label: "In Progress", val: inProgressCount, icon: Clock, color: "text-indigo-500" },
          { label: "Completed", val: completedCount, icon: CheckCircle2, color: "text-emerald-500" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
                <Icon className={cn("size-4", m.color)} />
              </div>
              <p className="text-xl font-bold text-foreground mt-1.5">{m.val}</p>
            </div>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Projects & Teams</h2>
          <span className="text-xs text-muted-foreground">{projects.length} total</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {projects.map((p) => {
            const projTasks = tasks.filter((t) => t.projectId === p.id);
            const done = projTasks.filter((t) => t.status === "done").length;
            const pct = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id);
                  setViewMode("board");
                }}
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FolderKanban className="size-4" />
                      </div>
                      <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </span>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2">{p.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Progress ({done}/{projTasks.length || 0})</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Up Next Tasks */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Up Next (Your Tasks)</h2>
        {upNextTasks.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 text-center text-xs text-muted-foreground">
            No upcoming tasks assigned to you.
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden">
            {upNextTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {t.status.replace("_", " ")}
                  </span>
                  {t.dueDate && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default HomeView;
