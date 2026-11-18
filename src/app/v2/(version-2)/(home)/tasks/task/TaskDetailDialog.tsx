"use client";

import React, { useState, useEffect } from "react";
import { Trash2, FileText, CheckSquare, Clock, MessageSquare } from "lucide-react";
import { type TaskPriority, type TaskStatus, type TaskSubtask } from "../_lib/tasks-types";
import { useTasks } from "../_lib/tasks-context";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskTimeTracking } from "./TaskTimeTracking";
import { TaskActivity } from "./TaskActivity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRIORITIES: Array<{ value: TaskPriority; label: string; color?: string }> = [
  { value: "urgent", label: "Urgent", color: "text-red-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "medium", label: "Medium", color: "text-amber-500" },
  { value: "low", label: "Low", color: "text-blue-500" },
  { value: "none", label: "None" },
];

export function TaskDetailDialog() {
  const { selectedTask, setSelectedTask, handleUpdateTask, handleDeleteTask, columns } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("none");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || "");
      setDescription(selectedTask.description || "");
      setStatus(selectedTask.status || "todo");
      setPriority(selectedTask.priority || "none");
      setDueDate(selectedTask.dueDate ? selectedTask.dueDate.slice(0, 10) : "");
      setSubtasks(selectedTask.subtasks || []);
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

  return (
    <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTask(null)}>
      <DialogContent className="max-w-2xl p-6 max-h-[90svh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {selectedTask.ticketId}
            </span>
            <DialogTitle className="text-base font-semibold truncate max-w-sm">
              {selectedTask.title}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => { await handleDeleteTask(selectedTask.id); setSelectedTask(null); }}
            className="size-8 text-destructive hover:bg-destructive/10"
            title="Delete Task"
          >
            <Trash2 className="size-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="text-sm font-medium" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (<SelectItem key={c.id} value={c.slug} className="text-xs">{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (<SelectItem key={p.value} value={p.value} className={`text-xs ${p.color || ""}`}>{p.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-4 h-8 bg-muted/40 p-0.5">
              <TabsTrigger value="details" className="text-xs gap-1.5 py-1"><FileText className="size-3" />Details</TabsTrigger>
              <TabsTrigger value="subtasks" className="text-xs gap-1.5 py-1"><CheckSquare className="size-3" />Subtasks</TabsTrigger>
              <TabsTrigger value="time" className="text-xs gap-1.5 py-1"><Clock className="size-3" />Time</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs gap-1.5 py-1"><MessageSquare className="size-3" />Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-3">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details, notes, acceptance criteria..." className="min-h-[120px] text-xs resize-none" />
            </TabsContent>
            <TabsContent value="subtasks" className="pt-3"><TaskSubtasks subtasks={subtasks} onChange={setSubtasks} /></TabsContent>
            <TabsContent value="time" className="pt-3"><TaskTimeTracking taskId={selectedTask.id} /></TabsContent>
            <TabsContent value="activity" className="pt-3"><TaskActivity taskId={selectedTask.id} /></TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-border/40 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !title.trim()}>{isSaving ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
