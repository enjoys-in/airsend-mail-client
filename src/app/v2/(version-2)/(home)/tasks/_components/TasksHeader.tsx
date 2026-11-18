"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Layers,
  ListFilter,
  RefreshCw,
  Server,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "../_lib/tasks-context";
import { TaskCreateDialog } from "./TaskCreateDialog";

export function TasksHeader() {
  const {
    tasks,
    filteredTasks,
    viewMode,
    setViewMode,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    isBackendLive,
    isLoading,
    refreshTasks,
    activeFilter,
  } = useTasks();

  const [createOpen, setCreateOpen] = useState(false);

  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const completedCount = tasks.filter((t) => t.status === "done").length;

  return (
    <>
      <div className="flex flex-col border-b border-border/40 bg-background shrink-0">
        {/* ── Top Row: Title, Backend Badge, Actions ── */}
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CheckSquare className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  Workspace Tasks
                </h1>
                <Badge
                  variant="outline"
                  className="text-[11px] font-normal border-border/60"
                >
                  {pendingCount} open
                </Badge>
                {/* Kaneo / Tasks Backend Connection Status */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                  style={{
                    backgroundColor: isBackendLive
                      ? "rgba(16, 185, 129, 0.08)"
                      : "rgba(245, 158, 11, 0.08)",
                    borderColor: isBackendLive
                      ? "rgba(16, 185, 129, 0.25)"
                      : "rgba(245, 158, 11, 0.25)",
                    color: isBackendLive ? "#10b981" : "#f59e0b",
                  }}
                  title={
                    isBackendLive
                      ? "Synced with tasks backend repo (Kaneo)"
                      : "Local Storage Mode (tasks backend connecting or offline)"
                  }
                >
                  <span
                    className="size-1.5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: isBackendLive ? "#10b981" : "#f59e0b",
                    }}
                  />
                  <span>
                    {isBackendLive ? "Backend Sync: Live" : "Local Engine"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground hidden md:block">
                Assigned items, sprints, and Kanban board synced with tasks repo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <Button
              variant="outline"
              size="icon"
              onClick={refreshTasks}
              className="size-8 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
              title="Refresh tasks from backend"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>

            {/* View Mode Toggle: Board vs List */}
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as any)}
              className="w-auto"
            >
              <TabsList className="h-8 p-0.5 bg-muted/60">
                <TabsTrigger
                  value="board"
                  className="text-xs h-7 px-2.5 gap-1.5"
                >
                  <Layers className="size-3.5" />
                  <span className="hidden sm:inline">Board</span>
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="text-xs h-7 px-2.5 gap-1.5"
                >
                  <ListFilter className="size-3.5" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* New Task Button */}
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1.5 text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>

        {/* ── Sub Row: Filter Chips & Search ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/40 px-4 md:px-6 py-2 bg-muted/15">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground font-medium mr-1 hidden sm:inline">
              Priority:
            </span>
            {["all", "urgent", "high", "medium", "low"].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={priorityFilter === p ? "default" : "outline"}
                onClick={() => setPriorityFilter(p)}
                className={`h-6 text-[11px] px-2 capitalize ${
                  priorityFilter === p
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks, tickets, labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-8 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      <TaskCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
