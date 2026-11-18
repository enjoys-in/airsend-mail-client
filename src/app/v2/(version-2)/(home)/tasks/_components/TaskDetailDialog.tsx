"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { type TaskPriority, type TaskStatus } from "../_lib/tasks-types";
import { useTasks } from "../_lib/tasks-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskDetailDialog() {
  const { selectedTask, setSelectedTask, handleUpdateTask, handleDeleteTask, columns } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("none");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || "");
      setDescription(selectedTask.description || "");
      setStatus(selectedTask.status || "todo");
      setPriority(selectedTask.priority || "none");
      setDueDate(selectedTask.dueDate ? selectedTask.dueDate.slice(0, 10) : "");
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    await handleUpdateTask(selectedTask.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setIsSaving(false);
    setSelectedTask(null);
  };

  const handleDelete = async () => {
    await handleDeleteTask(selectedTask.id);
    setSelectedTask(null);
  };

  return (
    <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTask(null)}>
      <DialogContent className="max-w-xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {selectedTask.ticketId}
            </span>
            <DialogTitle className="text-base font-semibold">Task Details</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="size-8 text-destructive hover:bg-destructive/10"
            title="Delete Task"
          >
            <Trash2 className="size-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.slug} className="text-xs">
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent" className="text-xs text-red-500">Urgent</SelectItem>
                  <SelectItem value="high" className="text-xs text-orange-500">High</SelectItem>
                  <SelectItem value="medium" className="text-xs text-amber-500">Medium</SelectItem>
                  <SelectItem value="low" className="text-xs text-blue-500">Low</SelectItem>
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description / Notes</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, markdown, or checklists..."
              className="min-h-[120px] text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
