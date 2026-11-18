"use client";

import React from "react";
import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "../_lib/tasks-context";

interface EmptyProps {
  title?: string;
  description?: string;
  actionText?: string;
}

export function TasksEmptyState({
  title = "No tasks found",
  description = "Get started by creating a task for this project.",
  actionText = "Create Task",
}: EmptyProps) {
  const { setIsCreateOpen } = useTasks();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
        <CheckSquare className="size-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      <Button
        onClick={() => setIsCreateOpen(true)}
        className="gap-2 font-medium shadow-sm transition-all hover:scale-[1.02]"
        size="sm"
      >
        <Plus className="size-4" />
        {actionText}
      </Button>
    </div>
  );
}
