"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type CreateTaskInput,
  type TaskColumn,
  type TaskItem,
  type TaskPriority,
  type TaskProject,
  type TaskStatus,
  type UpdateTaskInput,
} from "./tasks-types";
import * as api from "./tasks-api";

interface TasksContextValue {
  projects: TaskProject[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  currentProject: TaskProject | null;
  columns: TaskColumn[];
  tasks: TaskItem[];
  filteredTasks: TaskItem[];
  isLoading: boolean;
  viewMode: "board" | "list";
  setViewMode: (mode: "board" | "list") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: TaskStatus | "all";
  setStatusFilter: (s: TaskStatus | "all") => void;
  priorityFilter: TaskPriority | "all";
  setPriorityFilter: (p: TaskPriority | "all") => void;
  selectedTask: TaskItem | null;
  setSelectedTask: (task: TaskItem | null) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createDefaultStatus: TaskStatus;
  setCreateDefaultStatus: (status: TaskStatus) => void;
  refreshTasks: () => Promise<void>;
  handleCreateTask: (input: CreateTaskInput) => Promise<boolean>;
  handleUpdateTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
  handleMoveTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>;
  handleDeleteTask: (id: string) => Promise<boolean>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("todo");

  useEffect(() => {
    let mounted = true;
    api.fetchProjects().then((projs) => {
      if (!mounted) return;
      setProjects(projs);
      if (projs.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projs[0].id);
      }
    });
    return () => { mounted = false; };
  }, []);

  const refreshTasks = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    const result = await api.fetchProjectTasks(selectedProjectId);
    setColumns(result.columns);
    setTasks(result.tasks);
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedProjectId) {
      void refreshTasks();
    }
  }, [selectedProjectId]);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchId = t.ticketId?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchId) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const handleCreateTask = async (input: CreateTaskInput) => {
    const created = await api.createTask(input);
    if (created) {
      toast.success("Task created successfully");
      await refreshTasks();
      return true;
    }
    toast.error("Failed to create task");
    return false;
  };

  const handleUpdateTask = async (id: string, input: UpdateTaskInput) => {
    // Optimistic local update
    const { labels, ...restInput } = input;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...restInput } : t))
    );
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, ...restInput } : null));
    }
    const success = await api.updateTask(id, input);
    if (success) {
      toast.success("Task updated");
      void refreshTasks();
      return true;
    }
    toast.error("Failed to update task");
    void refreshTasks();
    return false;
  };

  const handleMoveTaskStatus = async (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    const success = await api.updateTaskStatus(id, status);
    if (!success) {
      toast.error("Failed to move task");
      void refreshTasks();
      return false;
    }
    return true;
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) setSelectedTask(null);
    const success = await api.deleteTask(id);
    if (success) {
      toast.success("Task deleted");
      return true;
    }
    toast.error("Failed to delete task");
    void refreshTasks();
    return false;
  };

  return (
    <TasksContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        currentProject,
        columns,
        tasks,
        filteredTasks,
        isLoading,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        selectedTask,
        setSelectedTask,
        isCreateOpen,
        setIsCreateOpen,
        createDefaultStatus,
        setCreateDefaultStatus,
        refreshTasks,
        handleCreateTask,
        handleUpdateTask,
        handleMoveTaskStatus,
        handleDeleteTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
