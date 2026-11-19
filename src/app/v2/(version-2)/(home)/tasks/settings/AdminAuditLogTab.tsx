"use client";

import React, { useState } from "react";
import { ScrollText, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export function AdminAuditLogTab() {
  const [query, setQuery] = useState("");
  const [logs] = useState<AuditEntry[]>([
    { id: "1", user: "mullayam06@outlook.com", action: "project.create", target: "Team Project", time: "10m ago" },
    { id: "2", user: "system", action: "schema.migrate", target: "tasks (PostgreSQL)", time: "25m ago" },
    { id: "3", user: "mullayam06@outlook.com", action: "apikey.generate", target: "tasks_prod_sec_...", time: "1h ago" },
    { id: "4", user: "dev@airsend.in", action: "task.delete", target: "Legacy Issue #42", time: "2h ago" },
  ]);

  const filtered = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(query.toLowerCase()) ||
      l.action.toLowerCase().includes(query.toLowerCase()) ||
      l.target.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Audit & Security Log</h3>
          <p className="text-[11px] text-muted-foreground">Immutable trail of administrative events and actions.</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter audit logs..." className="h-8 pl-8 text-xs bg-muted/20" />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden text-xs">
        {filtered.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{entry.user}</span>
                <span className="rounded-full bg-primary/10 text-primary font-mono text-[10px] px-2 py-0.5 font-bold">
                  {entry.action}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate">{entry.target}</p>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{entry.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default AdminAuditLogTab;
