"use client";

import React, { useState, useEffect } from "react";
import { Trash2, FileText, CheckSquare, Clock, MessageSquare, Copy, Check } from "lucide-react";
import { type TaskPriority, type TaskStatus, type TaskSubtask } from "../_lib/tasks-types";
import { useTasks } from "../_lib/tasks-context";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskTimeTracking } from "./TaskTimeTracking";
import { TaskActivity } from "./TaskActivity";
import { TaskLabelsPopover } from "./TaskLabelsPopover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PRIORITIES: Array<{ value: TaskPriority; label: string; color?: string }> = [
  { value: "urgent", label: "Urgent", color: "text-red-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "medium", label: "Medium", color: "text-amber-500" },
  { value: "low", label: "Low", color: "text-blue-500" },
  { value: "none", label: "None" },
];

export function TaskDetailDialog() {
  const { selectedTask, setSelectedTask, handleUpdateTask, handleDeleteTask, columns, labels } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("none");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [copied, setCopied] = useState(false);

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

  const handleSaveField = async (fields: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority; dueDate?: string | null }) => {
    await handleUpdateTask(selectedTask.id, fields);
  };

  const copyTaskLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Task link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTask(null)}>
      <SheetContent side="right" className="sm:max-w-2xl lg:max-w-3xl w-full p-0 flex flex-col h-full bg-background border-l border-border/40">
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-3.5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {selectedTask.ticketId}
            </span>
            <SheetTitle className="text-sm font-semibold truncate max-w-sm">
              {selectedTask.title}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={copyTaskLink} className="size-8 text-muted-foreground" title="Copy Link">
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => { await handleDeleteTask(selectedTask.id); setSelectedTask(null); }}
              className="size-8 text-destructive hover:bg-destructive/10"
              title="Delete Task"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 min-h-0 divide-x divide-border/40">
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => void handleSaveField({ title })}
              placeholder="Task title"
              className="text-base font-semibold border-0 px-0 shadow-none focus-visible:ring-0"
            />

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-4 h-8 bg-muted/40 p-0.5">
                <TabsTrigger value="details" className="text-xs gap-1.5 py-1"><FileText className="size-3" />Details</TabsTrigger>
                <TabsTrigger value="subtasks" className="text-xs gap-1.5 py-1"><CheckSquare className="size-3" />Subtasks</TabsTrigger>
                <TabsTrigger value="time" className="text-xs gap-1.5 py-1"><Clock className="size-3" />Time</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs gap-1.5 py-1"><MessageSquare className="size-3" />Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-3">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => void handleSaveField({ description })}
                  placeholder="Add description, acceptance criteria, markdown..."
                  className="min-h-[140px] text-xs resize-none"
                />
              </TabsContent>
              <TabsContent value="subtasks" className="pt-3"><TaskSubtasks subtasks={subtasks} onChange={setSubtasks} /></TabsContent>
              <TabsContent value="time" className="pt-3"><TaskTimeTracking taskId={selectedTask.id} /></TabsContent>
              <TabsContent value="activity" className="pt-3"><TaskActivity taskId={selectedTask.id} /></TabsContent>
            </Tabs>
          </div>

          <aside className="w-64 shrink-0 p-5 space-y-4 bg-muted/10 overflow-y-auto text-xs">
            <div className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Properties</div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Status</label>
              <Select value={status} onValueChange={(val) => { setStatus(val as TaskStatus); void handleSaveField({ status: val as TaskStatus }); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{columns.map((c) => (<SelectItem key={c.id} value={c.slug} className="text-xs">{c.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={(val) => { setPriority(val as TaskPriority); void handleSaveField({ priority: val as TaskPriority }); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => (<SelectItem key={p.value} value={p.value} className={`text-xs ${p.color || ""}`}>{p.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => { setDueDate(e.target.value); void handleSaveField({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }); }} className="h-8 text-xs" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Labels</label>
              <div><TaskLabelsPopover availableLabels={labels} selectedLabels={selectedTask.labels || []} onToggleLabel={() => {}} /></div>
            </div>
          </aside>
        </div>
      </SheetContent>
    </Sheet>
  );
}
