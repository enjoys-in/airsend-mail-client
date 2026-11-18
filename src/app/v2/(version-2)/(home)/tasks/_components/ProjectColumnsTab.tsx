"use client";

import React, { useState } from "react";
import { Plus, Trash2, Columns3 } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import * as api from "../_lib/tasks-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ProjectColumnsTab() {
  const { currentProject, columns, refreshTasks } = useTasks();
  const [newColName, setNewColName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddColumn = async () => {
    if (!newColName.trim() || !currentProject) return;
    setIsAdding(true);
    const slug = newColName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const ok = await api.createColumn(currentProject.id, newColName.trim(), slug, columns.length);
    setIsAdding(false);
    if (ok) {
      toast.success("Column added");
      setNewColName("");
      void refreshTasks();
    } else {
      toast.error("Failed to add column");
    }
  };

  const handleDeleteColumn = async (colId: string) => {
    const ok = await api.deleteColumn(colId);
    if (ok) {
      toast.success("Column removed");
      void refreshTasks();
    } else {
      toast.error("Failed to delete column");
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-foreground">Workflow Columns</h4>
          <p className="text-[11px] text-muted-foreground">Manage board stages for {currentProject?.name}</p>
        </div>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <Columns3 className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">{col.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">({col.slug})</span>
            </div>
            {columns.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void handleDeleteColumn(col.id)}
                className="size-6 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <Input
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          placeholder="New column name (e.g. In Review)"
          className="h-8 text-xs"
          onKeyDown={(e) => e.key === "Enter" && void handleAddColumn()}
        />
        <Button
          size="sm"
          onClick={handleAddColumn}
          disabled={isAdding || !newColName.trim()}
          className="h-8 text-xs gap-1 shrink-0"
        >
          <Plus className="size-3" />
          Add
        </Button>
      </div>
    </div>
  );
}
