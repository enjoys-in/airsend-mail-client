"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  refreshMyTasks,
  useMyTasksStore,
} from "../../tasks/_lib/my-tasks-store";
import type { TaskItem } from "../../tasks/_lib/tasks-types";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import { WorkspaceTaskRow } from "./WorkspaceTaskRow";
import {
  matchesTab,
  TABS,
  type TabKey,
} from "./workspace-tasks-helpers";

function MyTasksContent() {
  const tasks = useMyTasksStore((s) => s.tasks);
  const isLoading = useMyTasksStore((s) => s.isLoading);
  const error = useMyTasksStore((s) => s.error);
  const lastFetchedAt = useMyTasksStore((s) => s.lastFetchedAt);
  const setTaskStatus = useMyTasksStore((s) => s.setTaskStatus);
  const [tab, setTab] = useState<TabKey>("open");
  const [query, setQuery] = useState("");
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!useMyTasksStore.getState().isLoading) refreshMyTasks();
  }, []);

  const load = useCallback(() => refreshMyTasks(), []);

  const toggleDone = useCallback(
    async (task: TaskItem) => {
      setPendingIds((s) => new Set(s).add(task.id));
      await setTaskStatus(task.id, task.status === "done" ? "todo" : "done");
      setPendingIds((s) => {
        const n = new Set(s);
        n.delete(task.id);
        return n;
      });
    },
    [setTaskStatus],
  );

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.ticketId || "").toLowerCase().includes(q) ||
        (t.projectName || "").toLowerCase().includes(q) ||
        t.labels?.some((l) => l.name.toLowerCase().includes(q)),
    );
  }, [tasks, query]);

  const counts = useMemo(() => {
    const c = { open: 0, "in-progress": 0, overdue: 0, completed: 0, all: tasks.length };
    for (const t of tasks) {
      if (matchesTab(t, "open")) c.open++;
      if (matchesTab(t, "in-progress")) c["in-progress"]++;
      if (matchesTab(t, "overdue")) c.overdue++;
      if (matchesTab(t, "completed")) c.completed++;
    }
    return c;
  }, [tasks]);

  const visible = useMemo(
    () => searched.filter((t) => matchesTab(t, tab)),
    [searched, tab],
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-4 text-primary" />
          <h1 className="text-sm font-semibold">My Tasks</h1>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {counts.open}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={load}
          disabled={isLoading}
          title="Reload assigned tasks"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <div className="flex flex-col gap-2 border-b border-border/50 px-4 md:px-6 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="h-8 p-0.5 bg-muted/50">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="h-7 px-2.5 text-xs gap-1.5">
                <span>{t.label}</span>
                <span className="text-[10px] opacity-70">
                  {counts[t.key as keyof typeof counts] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my tasks..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && tasks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error && lastFetchedAt === null ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <AlertTriangle className="size-8 text-amber-500" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={load}>
              Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-sm">
              {query.trim()
                ? "No tasks match your search."
                : tab === "all"
                  ? "No tasks are assigned to you."
                  : "Nothing here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {visible.map((t) => (
              <WorkspaceTaskRow
                key={t.id}
                task={t}
                pending={pendingIds.has(t.id)}
                onToggleDone={toggleDone}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function WorkspaceTasksPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load your tasks">
      <MyTasksContent />
    </WorkspaceErrorBoundary>
  );
}
