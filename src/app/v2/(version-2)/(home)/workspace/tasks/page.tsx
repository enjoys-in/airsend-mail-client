"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Layers,
  ListFilter,
  Trash2,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "../_lib/chat-store";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import type { ChatTask } from "../_lib/chat-types";

export default function TasksPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Workspace Tasks">
      <TasksPlannerContent />
    </WorkspaceErrorBoundary>
  );
}

function TasksPlannerContent() {
  const {
    tasks,
    addTask,
    updateTaskStatus,
    deleteTask,
    members,
    channels,
    activeTeamId,
    currentUserId,
  } = useChatStore();

  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<ChatTask["priority"]>("medium");
  const [taskAssignee, setTaskAssignee] = useState(currentUserId || "u-self");
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [taskChannelId, setTaskChannelId] = useState<string>("general");

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in-progress");
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      assigneeId: taskAssignee,
      teamId: activeTeamId || "t-1",
      channelId: taskChannelId !== "none" ? taskChannelId : undefined,
      status: "todo",
      priority: taskPriority,
      dueDate: taskDueDate ? `${taskDueDate}T17:00:00Z` : undefined,
    });

    setTaskTitle("");
    setTaskDescription("");
    setCreateDialogOpen(false);
  };

  const getPriorityBadge = (priority: ChatTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px]">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px]">Medium</Badge>;
      case "low":
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/30 text-[10px]">Low</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CheckSquare className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Tasks & Planner
              <Badge variant="outline" className="text-[11px] font-normal border-border/60">
                {todoTasks.length + inProgressTasks.length} pending
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Teams task board, sprint items and tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList className="h-8 p-0.5 bg-muted/60">
              <TabsTrigger value="board" className="text-xs h-7 px-2.5 gap-1.5">
                <Layers className="size-3.5" />
                <span className="hidden sm:inline">Board</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs h-7 px-2.5 gap-1.5">
                <ListFilter className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1.5 text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="size-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* ── Search & Priority Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/40 px-4 md:px-6 py-2.5 bg-muted/20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Filter:</span>
          {["all", "urgent", "high", "medium", "low"].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={priorityFilter === p ? "default" : "outline"}
              onClick={() => setPriorityFilter(p)}
              className="h-7 text-xs px-2.5 capitalize"
            >
              {p}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* ── Main Content: Kanban Board vs Dense List ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {viewMode === "board" ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto h-full items-start">
            {/* Column 1: To Do */}
            <TaskColumn
              title="To Do"
              count={todoTasks.length}
              color="border-blue-500/40 text-blue-600 dark:text-blue-400"
              bg="bg-blue-500/5"
            >
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  channels={channels}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  onDelete={() => deleteTask(task.id)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}
            </TaskColumn>

            {/* Column 2: In Progress */}
            <TaskColumn
              title="In Progress"
              count={inProgressTasks.length}
              color="border-amber-500/40 text-amber-600 dark:text-amber-400"
              bg="bg-amber-500/5"
            >
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  channels={channels}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  onDelete={() => deleteTask(task.id)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}
            </TaskColumn>

            {/* Column 3: Completed */}
            <TaskColumn
              title="Completed"
              count={doneTasks.length}
              color="border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-500/5"
            >
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  channels={channels}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  onDelete={() => deleteTask(task.id)}
                  getPriorityBadge={getPriorityBadge}
                />
              ))}
            </TaskColumn>
          </div>
        ) : (
          /* Dense List View */
          <div className="max-w-4xl mx-auto space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-xs">
                No tasks match your filter.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === "done";
                const assignee = members.find((m) => m.userId === task.assigneeId);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isDone
                        ? "border-border/30 bg-muted/10 opacity-70"
                        : "border-border/40 bg-card hover:border-border hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <button
                        onClick={() => updateTaskStatus(task.id, isDone ? "todo" : "done")}
                        className="text-muted-foreground hover:text-emerald-500 transition-colors shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-0.5">
                        <p className={`text-xs font-semibold truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {getPriorityBadge(task.priority)}

                      {task.dueDate && (
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          Due {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      )}

                      {assignee && (
                        <Avatar className="size-6" title={`Assigned to ${assignee.displayName}`}>
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                            {assignee.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Create Task Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-amber-500" />
              Create Task in Planner
            </DialogTitle>
            <DialogDescription>
              Assign action items with priority and due dates to keep team goals on track.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="e.g. Implement WebRTC audio mute indicator"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Details, steps, and expected outcome..."
                rows={2}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="u-self">You (Self)</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.displayName} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!taskTitle.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskColumn({
  title,
  count,
  color,
  bg,
  children,
}: {
  title: string;
  count: number;
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border/40 bg-card p-3 shadow-2xs min-h-[300px]">
      <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>
            {title}
          </span>
          <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5">
            {count}
          </Badge>
        </div>
      </div>
      <div className="space-y-2.5 flex-1">{children}</div>
    </div>
  );
}

function TaskCard({
  task,
  members,
  channels,
  onStatusChange,
  onDelete,
  getPriorityBadge,
}: {
  task: ChatTask;
  members: any[];
  channels: any[];
  onStatusChange: (status: ChatTask["status"]) => void;
  onDelete: () => void;
  getPriorityBadge: (priority: ChatTask["priority"]) => React.ReactNode;
}) {
  const assignee = members.find((m) => m.userId === task.assigneeId);
  const channel = task.channelId ? channels.find((c) => c.id === task.channelId) : null;

  return (
    <div className="group rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/30 p-3.5 space-y-2 transition-all">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-semibold text-foreground leading-snug">{task.title}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="size-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {channel && (
        <div className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-accent/60 px-1.5 py-0.5 rounded">
          <Hash className="size-2.5" />
          <span>{channel.name}</span>
        </div>
      )}

      <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="size-2.5" />
              {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {assignee && (
          <Avatar className="size-5 shrink-0" title={`Assigned to ${assignee.displayName}`}>
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
              {assignee.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Status Progress Button */}
      <div className="pt-1 flex items-center justify-end gap-1">
        {task.status === "todo" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusChange("in-progress")}
            className="h-6 text-[10px] px-2 text-amber-600 hover:bg-amber-500/10"
          >
            Start Work →
          </Button>
        )}
        {task.status === "in-progress" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusChange("done")}
            className="h-6 text-[10px] px-2 text-emerald-600 hover:bg-emerald-500/10"
          >
            Mark Done ✓
          </Button>
        )}
        {task.status === "done" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusChange("todo")}
            className="h-6 text-[10px] px-2 text-muted-foreground hover:bg-muted"
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
