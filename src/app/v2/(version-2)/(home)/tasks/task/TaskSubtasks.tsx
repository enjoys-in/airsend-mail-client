"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { type TaskSubtask } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskSubtasksProps {
  subtasks: TaskSubtask[];
  onChange: (subtasks: TaskSubtask[]) => void;
}

export function TaskSubtasks({ subtasks, onChange }: TaskSubtasksProps) {
  const [newTitle, setNewTitle] = useState("");

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newSubtask: TaskSubtask = {
      id: `sub-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
    };
    onChange([...subtasks, newSubtask]);
    setNewTitle("");
  };

  const handleToggle = (id: string) => {
    onChange(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDelete = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CheckSquare className="size-3.5" />
          <span>Subtasks</span>
          {subtasks.length > 0 && (
            <span className="text-[11px] font-mono font-medium text-foreground">
              {completedCount}/{subtasks.length} ({progressPercent}%)
            </span>
          )}
        </div>
      </div>

      {subtasks.length > 0 && (
        <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="flex flex-col gap-1 divide-y divide-border/20 rounded-xl border border-border/40 bg-card overflow-hidden">
        {subtasks.map((s) => (
          <div
            key={s.id}
            className="group flex items-center justify-between px-3 py-2 text-xs hover:bg-muted/30 transition-colors"
          >
            <button
              type="button"
              onClick={() => handleToggle(s.id)}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
            >
              {s.completed ? (
                <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
              ) : (
                <Circle className="size-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  "truncate font-medium",
                  s.completed && "line-through text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(s.id)}
              className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}

        <form onSubmit={handleAdd} className="flex items-center gap-2 px-3 py-1.5 bg-muted/10">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a subtask..."
            className="h-7 text-xs border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
          />
          <Button type="submit" size="sm" variant="ghost" className="h-6 text-xs gap-1 px-2 shrink-0">
            <Plus className="size-3" />
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}
