"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  Circle,
  CircleDot,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TaskItem } from "../../tasks/_lib/tasks-types";
import {
  formatDue,
  isOverdue,
  PRIORITY_STYLE,
  STATUS_LABEL,
} from "./workspace-tasks-helpers";

interface WorkspaceTaskRowProps {
  task: TaskItem;
  pending: boolean;
  onToggleDone: (task: TaskItem) => void;
}

export function WorkspaceTaskRow({
  task: t,
  pending,
  onToggleDone,
}: WorkspaceTaskRowProps) {
  const done = t.status === "done";
  const overdue = isOverdue(t);

  return (
    <li className="flex items-start gap-3 px-4 md:px-6 py-2.5 hover:bg-accent/30 transition-colors">
      <button
        type="button"
        onClick={() => onToggleDone(t)}
        disabled={pending}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
        title={done ? "Mark as not done" : "Mark as done"}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : done ? (
          <CheckCircle2 className="size-4 text-emerald-500" />
        ) : t.status === "in-progress" || t.status === "in-review" ? (
          <CircleDot className="size-4 text-amber-500" />
        ) : (
          <Circle className="size-4" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              done && "line-through text-muted-foreground",
            )}
          >
            {t.title}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {t.ticketId && <span className="font-mono">{t.ticketId}</span>}
          {t.projectName && <span className="truncate">{t.projectName}</span>}
          <span>{t.statusName || STATUS_LABEL[t.status] || t.status}</span>
          {t.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1",
                overdue && "text-red-500 font-medium",
              )}
            >
              <Calendar className="size-3" />
              {formatDue(t.dueDate)}
              {overdue && " · overdue"}
            </span>
          )}
          {t.labels?.slice(0, 3).map((l) => (
            <span
              key={l.id}
              className="rounded px-1.5 py-px"
              style={{ backgroundColor: `${l.color}22`, color: l.color }}
            >
              {l.name}
            </span>
          ))}
        </div>
      </div>

      {t.priority && t.priority !== "none" && (
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[10px] capitalize font-normal",
            PRIORITY_STYLE[t.priority] ?? PRIORITY_STYLE.none,
          )}
        >
          {t.priority}
        </Badge>
      )}
    </li>
  );
}
