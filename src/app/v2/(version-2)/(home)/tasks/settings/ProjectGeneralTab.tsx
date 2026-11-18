"use client";

import React, { useState, useEffect } from "react";
import { Save, Trash2, AlertTriangle } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import * as api from "../_lib/tasks-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ProjectGeneralTab() {
  const { currentProject, refreshTasks, setIsSettingsOpen } = useTasks();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setSlug(currentProject.slug);
      setDescription(currentProject.description || "");
    }
  }, [currentProject]);

  if (!currentProject) {
    return <p className="text-xs text-muted-foreground py-4">No team selected.</p>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const ok = await api.updateProject(currentProject.id, {
      name: name.trim(),
      slug: slug.trim() || currentProject.slug,
      description: description.trim(),
    });
    setSaving(false);
    if (ok) {
      toast.success("Team settings saved");
      void refreshTasks();
    } else {
      toast.error("Failed to update team settings");
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${currentProject.name}"? All associated tasks will be removed.`)) {
      return;
    }
    setDeleting(true);
    const ok = await api.deleteProject(currentProject.id);
    setDeleting(false);
    if (ok) {
      toast.success("Project deleted");
      setIsSettingsOpen(false);
      void refreshTasks();
    } else {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-6 py-2">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-foreground">General Details</h4>
          <p className="text-[11px] text-muted-foreground">
            Settings for {currentProject.name}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Team Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Key / Slug Prefix</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toUpperCase())}
            maxLength={6}
            className="h-8 text-xs font-mono uppercase max-w-[140px]"
            required
          />
          <p className="text-[10px] text-muted-foreground">Used for issue keys (e.g. {slug}-1)</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this team..."
            className="text-xs resize-none h-16"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button size="sm" type="submit" disabled={saving || !name.trim()} className="h-8 text-xs gap-1.5">
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save Details"}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          <h5 className="text-xs font-semibold">Danger Zone</h5>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Permanently delete this project and all its tasks. This action cannot be undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDeleteProject}
          disabled={deleting}
          className="h-7 text-xs gap-1.5"
        >
          <Trash2 className="size-3.5" />
          {deleting ? "Deleting..." : "Delete Project"}
        </Button>
      </div>
    </div>
  );
}
