"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Circle, Calendar, FolderKanban } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import { type MyTasksGroupBy, type TaskItem } from "../_lib/tasks-types";
import { groupTasksByDueDate, groupTasksByProject } from "./MyTasksGrouper";
import { TaskPriorityBadge } from "../task/TaskPriorityBadge";
import { TasksEmptyState } from "../navigation/TasksEmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MyTasksView() {
  const { filteredTasks, setSelectedTask, handleMoveTaskStatus } = useTasks();
  const [groupBy, setGroupBy] = useState<MyTasksGroupBy>("dueDate");

  const groups = useMemo(() => {
    return groupBy === "project"
      ? groupTasksByProject(filteredTasks)
      : groupTasksByDueDate(filteredTasks);
  }, [filteredTasks, groupBy]);

  if (filteredTasks.length === 0) {
    return (
      <TasksEmptyState
        title="No tasks assigned to you"
        description="Tasks assigned to your AirSend account will appear here."
        actionText="Create Task"
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Group by:</span>
          <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <Button
              variant={groupBy === "dueDate" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGroupBy("dueDate")}
              className="h-7 px-2.5 text-xs shadow-none"
            >
              Due Date
            </Button>
            <Button
              variant={groupBy === "project" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGroupBy("project")}
              className="h-7 px-2.5 text-xs shadow-none"
            >
              Project
            </Button>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{filteredTasks.length} assigned</span>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="space-y-2">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  group.bucket === "overdue" ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {group.title}
              </span>
              <span className="rounded-full bg-muted/60 px-1.5 py-0.2 text-[10px] text-muted-foreground">
                {group.tasks.length}
              </span>
            </div>

            <div className="divide-y divide-border/20 rounded-xl border border-border/40 bg-card overflow-hidden">
              {group.tasks.map((task) => (
                <MyTaskRow
                  key={task.id}
                  task={task}
                  onSelect={() => setSelectedTask(task)}
                  onToggleComplete={() =>
                    handleMoveTaskStatus(task.id, task.status === "done" ? "todo" : "done")
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyTaskRow({
  task,
  onSelect,
  onToggleComplete,
}: {
  task: TaskItem;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const isDone = task.status === "done";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between px-3 py-2.5 text-xs transition-colors hover:bg-muted/40 cursor-pointer",
        isDone && "opacity-60 bg-muted/10"
      )}
    >
      <div className="flex items-center gap-3 truncate">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="size-4" />
          )}
        </button>

        <span className="font-mono text-[11px] text-muted-foreground shrink-0">
          {task.ticketId || `#${task.id.slice(0, 6)}`}
        </span>

        <span className={cn("font-medium truncate", isDone && "line-through text-muted-foreground")}>
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {task.projectName && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
            <FolderKanban className="size-3" />
            {task.projectName}
          </span>
        )}

        <TaskPriorityBadge priority={task.priority} />

        {task.dueDate && (
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="size-3" />
            {task.dueDate.split("T")[0]}
          </span>
        )}
      </div>
    </div>
  );
}
