"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "../_lib/tasks-context";
import type { TaskItem, TaskPriority, TaskStatus } from "../_lib/tasks-types";
import { TaskDetailDialog } from "./TaskDetailDialog";

export function TasksListView() {
  const { filteredTasks, updateTaskStatus, deleteTask, groupBy, setGroupBy } =
    useTasks();

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px] font-normal px-1.5 py-0">
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-normal px-1.5 py-0">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px] font-normal px-1.5 py-0">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/30 text-[10px] font-normal px-1.5 py-0">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return <span className="text-muted-foreground/60 text-xs">-</span>;
    const due = new Date(dateStr);
    const now = new Date();
    const isOverdue = due.getTime() < now.getTime() && due.toDateString() !== now.toDateString();
    const isToday = due.toDateString() === now.toDateString();

    const formatted = due.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return (
      <span
        className={`flex items-center gap-1 text-xs ${
          isOverdue
            ? "text-red-500 font-semibold"
            : isToday
            ? "text-amber-500 font-medium"
            : "text-muted-foreground"
        }`}
      >
        <Calendar className="size-3" />
        {isOverdue ? `Overdue (${formatted})` : isToday ? "Today" : formatted}
      </span>
    );
  };

  // Grouping logic
  const groups = useMemo(() => {
    if (groupBy === "project") {
      const map = new Map<string, TaskItem[]>();
      for (const t of filteredTasks) {
        const name = t.projectName || "General";
        const arr = map.get(name) || [];
        arr.push(t);
        map.set(name, arr);
      }
      return Array.from(map.entries()).map(([title, tasks]) => ({
        id: title,
        title,
        tasks,
      }));
    }

    if (groupBy === "status") {
      const order: TaskStatus[] = ["todo", "in-progress", "in-review", "done"];
      const titles: Record<string, string> = {
        todo: "To Do",
        "in-progress": "In Progress",
        "in-review": "In Review",
        done: "Done",
      };
      return order
        .map((status) => ({
          id: status,
          title: titles[status],
          tasks: filteredTasks.filter((t) => t.status === status),
        }))
        .filter((g) => g.tasks.length > 0);
    }

    // Default: Group by Due Date
    const overdue: TaskItem[] = [];
    const today: TaskItem[] = [];
    const thisWeek: TaskItem[] = [];
    const later: TaskItem[] = [];
    const noDueDate: TaskItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;
    const endOfWeek = startOfToday + 7 * 86400000;

    for (const t of filteredTasks) {
      if (!t.dueDate) {
        noDueDate.push(t);
        continue;
      }
      const dueTime = new Date(t.dueDate).getTime();
      if (dueTime < startOfToday && t.status !== "done") {
        overdue.push(t);
      } else if (dueTime >= startOfToday && dueTime < endOfToday) {
        today.push(t);
      } else if (dueTime >= endOfToday && dueTime < endOfWeek) {
        thisWeek.push(t);
      } else {
        later.push(t);
      }
    }

    return [
      { id: "overdue", title: "Overdue", tasks: overdue, isWarning: true },
      { id: "today", title: "Today", tasks: today },
      { id: "thisWeek", title: "This Week", tasks: thisWeek },
      { id: "later", title: "Later", tasks: later },
      { id: "noDueDate", title: "No Due Date", tasks: noDueDate },
    ].filter((g) => g.tasks.length > 0);
  }, [filteredTasks, groupBy]);

  const handleOpenDetail = (task: TaskItem) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleToggleDone = (task: TaskItem) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    updateTaskStatus(task.id, nextStatus);
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 bg-background">
        {/* ── Sub toolbar: Group by control ── */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredTasks.length} tasks
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Group by:</span>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
              <SelectTrigger className="h-7 text-xs w-32 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date" className="text-xs">
                  Due Date
                </SelectItem>
                <SelectItem value="project" className="text-xs">
                  Project
                </SelectItem>
                <SelectItem value="status" className="text-xs">
                  Status
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Groups & Task Rows ── */}
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-xl text-center space-y-2 mt-4">
            <CheckCircle2 className="size-10 text-muted-foreground/40" />
            <h3 className="text-sm font-semibold text-foreground">
              No tasks found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              All caught up or no tasks matching your filters and search.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <div className="flex items-center gap-2 px-1">
                  <h3
                    className={`text-xs font-semibold tracking-wide ${
                      (group as any).isWarning
                        ? "text-red-500 font-bold"
                        : "text-foreground"
                    }`}
                  >
                    {group.title}
                  </h3>
                  <span className="text-[11px] text-muted-foreground tabular-nums font-mono">
                    ({group.tasks.length})
                  </span>
                </div>

                <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
                  {group.tasks.map((task) => {
                    const isDone = task.status === "done";

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleOpenDetail(task)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors cursor-pointer hover:bg-muted/40 ${
                          isDone ? "bg-muted/10 opacity-75" : ""
                        }`}
                      >
                        {/* Status Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDone(task);
                          }}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          ) : (
                            <Circle className="size-4 hover:stroke-amber-500" />
                          )}
                        </button>

                        {/* Priority Badge */}
                        <div className="shrink-0">
                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* Ticket ID */}
                        <span className="text-[11px] font-mono text-muted-foreground hidden sm:block shrink-0 min-w-[70px]">
                          {task.ticketId || `TASK-${task.id.slice(-4)}`}
                        </span>

                        {/* Title & Description preview */}
                        <div className="flex-1 min-w-0 pr-2">
                          <span
                            className={`text-xs font-medium truncate block ${
                              isDone
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-[11px] text-muted-foreground/70 truncate block">
                              {task.description}
                            </span>
                          )}
                        </div>

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="hidden md:flex items-center gap-1.5 shrink-0 max-w-[140px] overflow-hidden">
                            {task.labels.slice(0, 2).map((l) => (
                              <Badge
                                key={l.id}
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 font-normal truncate"
                                style={{
                                  borderColor: `${l.color}40`,
                                  color: l.color,
                                }}
                              >
                                {l.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Project Tag */}
                        {task.projectName && (
                          <Badge
                            variant="secondary"
                            className="hidden lg:inline-flex text-[10px] font-normal max-w-[110px] truncate shrink-0"
                          >
                            {task.projectName}
                          </Badge>
                        )}

                        {/* Due Date */}
                        <div className="shrink-0 text-right min-w-[90px]">
                          {formatDueDate(task.dueDate)}
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                            >
                              <MoreVertical className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => handleOpenDetail(task)}
                              className="gap-2 text-xs"
                            >
                              <Edit2 className="size-3" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleDone(task)}
                              className="gap-2 text-xs"
                            >
                              <CheckCircle2 className="size-3" />
                              {isDone ? "Mark Incomplete" : "Mark Done"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteTask(task.id)}
                              className="gap-2 text-xs text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="size-3" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
