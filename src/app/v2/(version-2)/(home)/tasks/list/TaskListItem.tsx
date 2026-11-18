"use client";

import React, { useMemo } from "react";
import { Calendar, CheckCircle2, Circle, MoreVertical, Trash2 } from "lucide-react";
import { type TaskItem, type TaskStatus } from "../_lib/tasks-types";
import { TaskPriorityBadge } from "../task/TaskPriorityBadge";
import { useTasks } from "../_lib/tasks-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TaskListItem({ task }: { task: TaskItem }) {
  const { setSelectedTask, handleMoveTaskStatus, handleDeleteTask, columns } = useTasks();

  const isDone = task.status === "done";

  const formattedDue = useMemo(() => {
    if (!task.dueDate) return null;
    return new Date(task.dueDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [task.dueDate]);

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className={cn(
        "group flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40",
        "hover:bg-muted/30 cursor-pointer transition-colors select-none",
        isDone && "bg-muted/10 opacity-70"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleMoveTaskStatus(task.id, isDone ? "todo" : "done");
          }}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="size-4" />
          )}
        </button>

        <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
          {task.ticketId}
        </span>

        <span
          className={cn(
            "text-sm font-medium text-foreground truncate",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <TaskPriorityBadge priority={task.priority} />

        {formattedDue && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Calendar className="size-3" />
            {formattedDue}
          </span>
        )}

        {task.assigneeName ? (
          <div
            title={task.assigneeName}
            className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary uppercase border border-primary/20"
          >
            {task.assigneeName.slice(0, 2)}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60 hidden md:inline">Unassigned</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            {columns.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleMoveTaskStatus(task.id, c.slug as TaskStatus);
                }}
              >
                Move to {c.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                void handleDeleteTask(task.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
