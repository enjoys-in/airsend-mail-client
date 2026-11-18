"use client";

import React from "react";
import {
  CheckSquare,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  RotateCw,
  FolderKanban,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "../_lib/tasks-context";
import { type TaskPriority, type TaskStatus } from "../_lib/tasks-types";
import { cn } from "@/lib/utils";

export function TasksHeader() {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    currentProject,
    tasks,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    setIsCreateOpen,
    refreshTasks,
    isLoading,
  } = useTasks();

  const openCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="flex flex-col border-b border-border/50 bg-background shrink-0">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 gap-3">
        {/* Left: Project Selector & Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckSquare className="size-4" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-2 text-left hover:bg-muted/60">
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs text-muted-foreground font-normal">Workspace Project</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <FolderKanban className="size-3.5 text-primary" />
                    {currentProject?.name || "All Tasks"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Select Team / Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium">{p.name}</span>
                  {selectedProjectId === p.id && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="hidden sm:inline-flex rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/40">
            {openCount} open
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void refreshTasks()}
            disabled={isLoading}
            className="size-8 text-muted-foreground"
            title="Refresh tasks"
          >
            <RotateCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </Button>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("board")}
              className="h-7 px-2.5 text-xs gap-1.5 shadow-none"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden md:inline">Board</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-7 px-2.5 text-xs gap-1.5 shadow-none"
            >
              <List className="size-3.5" />
              <span className="hidden md:inline">List</span>
            </Button>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="h-8 gap-1.5 font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-2 bg-muted/10 border-t border-border/30">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, ID..."
            className="h-8 pl-8 text-xs bg-background/60"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Filter className="size-3 text-muted-foreground" />
                <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              {(["all", "backlog", "todo", "in-progress", "done"] as const).map((s) => (
                <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                  <span className="capitalize">{s}</span>
                  {statusFilter === s && <Check className="size-3 text-primary ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <span>Priority: {priorityFilter === "all" ? "All" : priorityFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              {(["all", "urgent", "high", "medium", "low", "none"] as const).map((p) => (
                <DropdownMenuItem key={p} onClick={() => setPriorityFilter(p)}>
                  <span className="capitalize">{p}</span>
                  {priorityFilter === p && <Check className="size-3 text-primary ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
