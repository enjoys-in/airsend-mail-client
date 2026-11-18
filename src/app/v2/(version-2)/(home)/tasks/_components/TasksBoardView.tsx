"use client";

import React, { useState } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  ArrowRight,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { TaskCreateDialog } from "./TaskCreateDialog";

interface ColumnDef {
  id: TaskStatus;
  title: string;
  color: string;
  bgBadge: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "todo",
    title: "To Do",
    color: "text-blue-500",
    bgBadge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "text-amber-500",
    bgBadge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    id: "in-review",
    title: "In Review",
    color: "text-purple-500",
    bgBadge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    id: "done",
    title: "Done",
    color: "text-emerald-500",
    bgBadge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
];

export function TasksBoardView() {
  const { filteredTasks, updateTaskStatus, deleteTask } = useTasks();

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] =
    useState<TaskStatus>("todo");

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
    if (!dateStr) return null;
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
        className={`flex items-center gap-1 text-[11px] font-medium ${
          isOverdue
            ? "text-red-500 font-semibold"
            : isToday
            ? "text-amber-500"
            : "text-muted-foreground"
        }`}
      >
        <Calendar className="size-3" />
        {isOverdue ? `Overdue (${formatted})` : isToday ? "Today" : formatted}
      </span>
    );
  };

  const handleOpenDetail = (task: TaskItem) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleAddInColumn = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateOpen(true);
  };

  return (
    <>
      <div className="flex-1 overflow-x-auto p-4 md:p-6 bg-muted/10">
        <div className="flex gap-4 min-w-[900px] h-full items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col flex-1 min-w-[280px] max-w-[340px] rounded-xl border border-border/50 bg-background/60 shadow-xs max-h-full"
              >
                {/* ── Column Header ── */}
                <div className="flex items-center justify-between p-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        col.id === "todo"
                          ? "bg-blue-500"
                          : col.id === "in-progress"
                          ? "bg-amber-500"
                          : col.id === "in-review"
                          ? "bg-purple-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <h3 className="text-xs font-semibold text-foreground">
                      {col.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] h-4 px-1.5 font-mono ${col.bgBadge}`}
                    >
                      {colTasks.length}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddInColumn(col.id)}
                    className="size-6 text-muted-foreground hover:text-foreground"
                    title={`Add task in ${col.title}`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>

                {/* ── Column Cards ── */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[140px]">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/40 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground/60">
                        No tasks in {col.title.toLowerCase()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddInColumn(col.id)}
                        className="mt-1 text-[11px] h-6 text-amber-500 hover:text-amber-600 gap-1"
                      >
                        <Plus className="size-3" /> Add task
                      </Button>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <Card
                        key={task.id}
                        onClick={() => handleOpenDetail(task)}
                        className="group relative cursor-pointer border border-border/50 hover:border-border hover:shadow-xs transition-all duration-150 bg-card rounded-lg overflow-hidden"
                      >
                        <CardContent className="p-3 space-y-2.5">
                          {/* Card top: ticketId + project tag + actions */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-mono font-medium text-muted-foreground">
                                {task.ticketId || `TASK-${task.id.slice(-4)}`}
                              </span>
                              {task.projectName && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 border-border/40 text-muted-foreground truncate max-w-[100px]"
                                >
                                  {task.projectName}
                                </Badge>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                >
                                  <MoreVertical className="size-3" />
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
                                  <Edit2 className="size-3" /> Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {COLUMNS.filter((c) => c.id !== task.status).map(
                                  (c) => (
                                    <DropdownMenuItem
                                      key={c.id}
                                      onClick={() =>
                                        updateTaskStatus(task.id, c.id)
                                      }
                                      className="gap-2 text-xs"
                                    >
                                      <ArrowRight className="size-3" /> Move to{" "}
                                      {c.title}
                                    </DropdownMenuItem>
                                  )
                                )}
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

                          {/* Title */}
                          <h4 className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Description preview */}
                          {task.description && (
                            <p className="text-[11px] text-muted-foreground/80 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Labels */}
                          {task.labels && task.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.labels.slice(0, 3).map((l) => (
                                <span
                                  key={l.id}
                                  className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm font-medium"
                                  style={{
                                    backgroundColor: `${l.color}15`,
                                    color: l.color,
                                  }}
                                >
                                  {l.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Bottom Row: Priority & Due Date */}
                          <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs">
                            <div>{getPriorityBadge(task.priority)}</div>
                            <div>{formatDueDate(task.dueDate)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <TaskCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStatus={createDefaultStatus}
      />
    </>
  );
}
