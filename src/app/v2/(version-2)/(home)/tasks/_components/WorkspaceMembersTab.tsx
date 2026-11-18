"use client";

import React, { useEffect, useState } from "react";
import { Users, Shield, User } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { type TaskMember } from "../_lib/tasks-types";
import * as api from "../_lib/tasks-api";
import { Badge } from "@/components/ui/badge";

export function WorkspaceMembersTab() {
  const { currentProject } = useTasks();
  const [members, setMembers] = useState<TaskMember[]>([]);
  const [loading, setLoading] = useState(true);

  const workspaceId = currentProject?.workspaceId || "QLgzDfOu35H0B5B4p6qWHC22JLlvoNNQ";

  useEffect(() => {
    let mounted = true;
    api.fetchWorkspaceMembers(workspaceId).then((res) => {
      if (mounted) {
        setMembers(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  return (
    <div className="space-y-4 py-2">
      <div>
        <h4 className="text-xs font-semibold text-foreground">Workspace Members</h4>
        <p className="text-[11px] text-muted-foreground">
          People who have access to this workspace and its teams
        </p>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-muted-foreground py-2">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No members found.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt="" className="size-full rounded-full object-cover" />
                  ) : (
                    m.name?.slice(0, 2).toUpperCase() || <User className="size-3.5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground leading-tight">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">{m.email}</p>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] capitalize font-medium ${
                  m.role === "owner"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : m.role === "admin"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {m.role === "owner" && <Shield className="size-2.5 mr-1 inline" />}
                {m.role}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
