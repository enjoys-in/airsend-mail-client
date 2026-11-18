"use client";

import React, { useState } from "react";
import { Globe, Users, Copy, Check, ExternalLink } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import * as api from "../_lib/tasks-api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ProjectVisibilityTab() {
  const { currentProject, refreshTasks } = useTasks();
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  if (!currentProject) {
    return <p className="text-xs text-muted-foreground py-4">No team selected.</p>;
  }

  const isPublic = Boolean(currentProject.isPublic);
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/v2/tasks/public/${currentProject.id}`
    : `/v2/tasks/public/${currentProject.id}`;

  const handleToggle = async (checked: boolean) => {
    setToggling(true);
    const ok = await api.updateProject(currentProject.id, {
      name: currentProject.name,
      isPublic: checked,
    });
    setToggling(false);
    if (ok) {
      toast.success(checked ? "Public access enabled" : "Public access disabled");
      void refreshTasks();
    } else {
      toast.error("Failed to update visibility");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Public link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <h4 className="text-xs font-semibold text-foreground">Project Visibility</h4>
        <p className="text-[11px] text-muted-foreground">
          Control who can view and interact with {currentProject.name}
        </p>
      </div>

      <div className="space-y-3">
        {/* Workspace Members Row */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Workspace Members</div>
              <div className="text-[11px] text-muted-foreground">Members of this workspace can view and edit tasks</div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
            Always Allowed
          </span>
        </div>

        {/* Public Access Toggle Row */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Public Access</div>
              <div className="text-[11px] text-muted-foreground">Anyone with the link can view this project board</div>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
        </div>

        {/* Public Link Box */}
        {isPublic && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
            <span className="font-mono text-[11px] text-foreground truncate flex-1">
              {publicUrl}
            </span>
            <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs gap-1 shrink-0">
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
        When public access is disabled, external users attempting to access the link will see an access denied notice.
      </p>
    </div>
  );
}
