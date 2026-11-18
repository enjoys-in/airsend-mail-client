"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  ChevronDown,
  Layers,
  Inbox,
  Filter,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "../_lib/tasks-context";
import { TaskCreateDialog } from "./TaskCreateDialog";

export function TasksSidebar() {
  const pathname = usePathname();
  const {
    tasks,
    projects,
    workspaces,
    activeWorkspaceId,
    activeProjectId,
    setActiveProjectId,
    activeFilter,
    setActiveFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    isBackendLive,
  } = useTasks();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const assignedCount = tasks.filter((t) => t.status !== "done").length;
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate).getTime() < Date.now();
  }).length;
  const completedCount = tasks.filter((t) => t.status === "done").length;

  return (
    <>
      <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background">
        {/* ── Header: Workspace title ── */}
        <SidebarHeader className="gap-0 border-b p-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-12 w-full items-center justify-between px-3 text-left hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-xs font-bold text-amber-500">
                    <CheckSquare className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-semibold">
                      {activeWorkspace?.name || "Tasks Planner"}
                    </span>
                    <span className="block text-[10px] text-muted-foreground leading-none">
                      {isBackendLive ? "Backend: ../tasks" : "Local Workspace"}
                    </span>
                  </div>
                </div>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {workspaces.map((w) => (
                <DropdownMenuItem key={w.id} className="gap-2 text-xs">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded bg-amber-500/10 text-[9px] font-bold text-amber-500">
                    {(w.name || "?").charAt(0).toUpperCase()}
                  </span>
                  {w.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator className="bg-border/40" />

          {/* Quick Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 text-xs bg-muted/30"
              />
            </div>
          </div>
        </SidebarHeader>

        {/* ── Content: Views & Projects ── */}
        <SidebarContent className="py-0">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <ScrollArea className="flex-1">
                <div className="px-2 pb-4 space-y-4">
                  {/* Views */}
                  <div className="space-y-0.5 pt-2">
                    <button
                      onClick={() => {
                        setActiveFilter("assigned");
                        setActiveProjectId(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium text-left",
                        activeFilter === "assigned" && activeProjectId === null
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Inbox className="size-3.5 shrink-0 text-amber-500" />
                        <span>My Assigned Tasks</span>
                      </div>
                      {assignedCount > 0 && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                          {assignedCount > 9 ? "9+" : assignedCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveFilter("all");
                        setActiveProjectId(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium text-left",
                        activeFilter === "all" && activeProjectId === null
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="size-3.5 shrink-0 text-blue-500" />
                        <span>All Tasks</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {tasks.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveFilter("overdue");
                        setActiveProjectId(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium text-left",
                        activeFilter === "overdue"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 shrink-0 text-red-500" />
                        <span>Overdue</span>
                      </div>
                      {overdueCount > 0 && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                          {overdueCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveFilter("completed");
                        setActiveProjectId(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium text-left",
                        activeFilter === "completed"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                        <span>Completed</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {completedCount}
                      </span>
                    </button>
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Projects List */}
                  <div>
                    <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                      <span>Projects</span>
                      <span className="text-[10px] lowercase text-muted-foreground/70">
                        {projects.length}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {projects.map((p) => {
                        const count = tasks.filter(
                          (t) => t.projectId === p.id && t.status !== "done"
                        ).length;
                        const isSelected = activeProjectId === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() =>
                              setActiveProjectId(isSelected ? null : p.id)
                            }
                            className={cn(
                              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium text-left",
                              isSelected
                                ? "bg-accent text-accent-foreground font-semibold"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="size-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor: p.color || "#3b82f6",
                                }}
                              />
                              <span className="truncate">{p.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer: Add Task Button ── */}
        <SidebarFooter className="p-3 border-t border-border/40">
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="w-full text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Task</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <TaskCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
