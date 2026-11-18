"use client";

import React from "react";
import { Server, Database, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";

export function AdminOverviewTab() {
  const { projects, tasks } = useTasks();

  const stats = [
    { label: "Active Projects", value: projects.length, icon: Server },
    { label: "Total Tasks", value: tasks.length, icon: Activity },
    { label: "Database Schema", value: "tasks (PostgreSQL)", icon: Database },
    { label: "System Status", value: "Operational", icon: ShieldCheck, status: "ok" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-foreground">Administration Overview</h3>
        <p className="text-[11px] text-muted-foreground">
          System health, database configuration, and instance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-xs"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {s.label}
                </span>
                <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                  {s.value}
                  {s.status === "ok" && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 max-w-xl">
        <h4 className="text-xs font-semibold text-foreground">Database & Auth Scopes</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tasks service connects to <code className="font-mono text-primary font-semibold">airsend_mail</code> using
          the <code className="font-mono text-primary font-semibold">tasks</code> schema. Default user scopes are
          <code className="font-mono"> mail, calender</code>, with all scopes granted under organization domains.
        </p>
      </div>
    </div>
  );
}
export default AdminOverviewTab;
