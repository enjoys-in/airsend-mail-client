"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import * as api from "../_lib/tasks-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280", "#06b6d4"];

export function WorkspaceLabelsTab() {
  const { labels, currentProject, refreshTasks } = useTasks();
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const workspaceId = currentProject?.workspaceId || "QLgzDfOu35H0B5B4p6qWHC22JLlvoNNQ";

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    setIsAdding(true);
    const created = await api.createLabel(newLabelName.trim(), selectedColor, workspaceId);
    setIsAdding(false);
    if (created) {
      toast.success("Label created");
      setNewLabelName("");
      void refreshTasks();
    } else {
      toast.error("Failed to create label");
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    const ok = await api.deleteLabel(labelId);
    if (ok) {
      toast.success("Label deleted");
      void refreshTasks();
    } else {
      toast.error("Failed to delete label");
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <h4 className="text-xs font-semibold text-foreground">Workspace Labels</h4>
        <p className="text-[11px] text-muted-foreground">Tags used to categorize tasks across projects</p>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {labels.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No labels configured yet.</p>
        ) : (
          labels.map((lbl) => (
            <div
              key={lbl.id}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: lbl.color }} />
                <span className="font-medium text-foreground">{lbl.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void handleDeleteLabel(lbl.id)}
                className="size-6 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedColor(c)}
              className="size-5 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                transform: selectedColor === c ? "scale(1.2)" : "scale(1)",
                outline: selectedColor === c ? "2px solid var(--primary)" : "none",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="New label name (e.g. Bug, Feature)"
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && void handleAddLabel()}
          />
          <Button
            size="sm"
            onClick={handleAddLabel}
            disabled={isAdding || !newLabelName.trim()}
            className="h-8 text-xs gap-1 shrink-0"
          >
            <Plus className="size-3" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
