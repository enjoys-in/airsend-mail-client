"use client";

import React, { useState } from "react";
import { Building2, Save, AlertTriangle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WorkspaceGeneralTab() {
  const [name, setName] = useState("Airsend Mail");
  const [description, setDescription] = useState("Primary workspace for communications, tasks, and team projects.");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((res) => setTimeout(res, 400));
    setSaving(false);
    toast.success("Workspace settings updated");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Workspace Details</h3>
          <p className="text-[11px] text-muted-foreground">
            Basic information about this workspace across all projects.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Workspace Name</label>
          <div className="relative max-w-md">
            <Building2 className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-8 h-8 text-xs"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this workspace do?"
            className="text-xs resize-none h-16 max-w-md"
          />
        </div>

        <div className="flex justify-end max-w-md pt-2 border-t border-border/40">
          <Button size="sm" type="submit" disabled={saving || !name.trim()} className="h-8 text-xs gap-1.5">
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3 max-w-md">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          <h4 className="text-xs font-semibold">Danger Zone</h4>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Deleting a workspace removes all projects, tasks, comments, and members permanently.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm("Are you sure you want to delete this entire workspace? This cannot be undone.")) {
              toast.error("Contact your administrator to delete this primary workspace.");
            }
          }}
          className="h-7 text-xs gap-1.5"
        >
          <Trash2 className="size-3.5" />
          Delete Workspace
        </Button>
      </div>
    </div>
  );
}
export default WorkspaceGeneralTab;
