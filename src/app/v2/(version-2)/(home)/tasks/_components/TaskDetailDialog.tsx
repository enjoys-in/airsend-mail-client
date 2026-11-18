"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "../_lib/tasks-context";
import type { TaskItem, TaskPriority, TaskStatus } from "../_lib/tasks-types";

interface TaskDetailDialogProps {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const { updateTask, deleteTask, projects } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setProjectId(task.projectId || projects[0]?.id || "");
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
    }
  }, [task, projects]);

  if (!task) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        projectId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsSaving(true);
    try {
      await deleteTask(task.id);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border/60">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {task.ticketId || `TASK-${task.id.slice(-4)}`}
              </Badge>
              {task.projectName && (
                <Badge variant="secondary" className="text-[11px]">
                  {task.projectName}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="size-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              title="Delete task"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <DialogTitle className="text-base font-semibold pt-1">
            Task Details
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            View or edit task specifications, status, priority, and timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[80px] resize-none"
              placeholder="No description provided."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo" className="text-xs">
                    To Do
                  </SelectItem>
                  <SelectItem value="in-progress" className="text-xs">
                    In Progress
                  </SelectItem>
                  <SelectItem value="in-review" className="text-xs">
                    In Review
                  </SelectItem>
                  <SelectItem value="done" className="text-xs">
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent" className="text-xs text-red-500 font-medium">
                    Urgent
                  </SelectItem>
                  <SelectItem value="high" className="text-xs text-amber-500 font-medium">
                    High
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs text-blue-500 font-medium">
                    Medium
                  </SelectItem>
                  <SelectItem value="low" className="text-xs text-slate-400 font-medium">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {task.labels && task.labels.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Labels</Label>
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map((l) => (
                  <Badge
                    key={l.id}
                    variant="outline"
                    className="text-[11px] font-normal"
                    style={{ borderColor: `${l.color}40`, color: l.color }}
                  >
                    <span
                      className="size-1.5 rounded-full mr-1.5"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
