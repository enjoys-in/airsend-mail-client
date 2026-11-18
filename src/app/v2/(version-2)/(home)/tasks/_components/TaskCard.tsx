"use client";

import React from "react";
import { Calendar, Check, MoreVertical, Trash2 } from "lucide-react";
import { type TaskItem, type TaskStatus } from "../_lib/tasks-types";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { useTasks } from "../_lib/tasks-context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: TaskItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const { setSelectedTask, handleMoveTaskStatus, handleDeleteTask, columns } = useTasks();

  const isOverdue = React.useMemo(() => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).getTime() < Date.now() && task.status !== "done";
  }, [task.dueDate, task.status]);

  const formattedDue = React.useMemo(() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, [task.dueDate]);

  return (
    <div
      onClick={() => setSelectedTask(task)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs",
        "transition-all duration-150 hover:border-primary/40 hover:shadow-md cursor-pointer select-none",
        task.status === "done" && "opacity-75 bg-muted/20"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground/80 tracking-tight">
          {task.ticketId}
        </span>
        <div className="flex items-center gap-1">
          <TaskPriorityBadge priority={task.priority} showLabel={false} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {columns.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleMoveTaskStatus(task.id, c.slug as TaskStatus);
                  }}
                  className="flex items-center justify-between text-xs"
                >
                  <span>Move to {c.name}</span>
                  {task.status === c.slug && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDeleteTask(task.id);
                }}
                className="text-xs text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h4
        className={cn(
          "text-sm font-medium leading-snug text-foreground line-clamp-2",
          task.status === "done" && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {formattedDue && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium border",
                isOverdue
                  ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold"
                  : "border-border/40 bg-muted/40 text-muted-foreground"
              )}
            >
              <Calendar className="size-3" />
              {formattedDue}
            </span>
          )}
        </div>

        {task.assigneeName ? (
          <div
            title={task.assigneeName}
            className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary uppercase border border-primary/20"
          >
            {task.assigneeName.slice(0, 2)}
          </div>
        ) : (
          <div className="size-6 rounded-full border border-dashed border-border/80 flex items-center justify-center text-[10px] text-muted-foreground/60">
            —
          </div>
        )}
      </div>
    </div>
  );
}
