"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { TaskItem, TaskProject, TaskWorkspace, CreateTaskInput, UpdateTaskInput, TaskPriority, TaskStatus } from "./tasks-types";
import { tasksApi, getTasksApiUrl } from "./tasks-api";

interface TasksContextValue {
  tasks: TaskItem[];
  filteredTasks: TaskItem[];
  projects: TaskProject[];
  workspaces: TaskWorkspace[];
  activeWorkspaceId: string;
  activeProjectId: string | null;
  activeFilter: "assigned" | "all" | "completed" | "overdue";
  priorityFilter: string;
  viewMode: "board" | "list";
  searchQuery: string;
  groupBy: "due_date" | "project" | "status" | "priority";
  isLoading: boolean;
  isBackendLive: boolean;
  backendUrl: string;

  // Actions
  createTask: (input: CreateTaskInput) => Promise<TaskItem>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => Promise<void>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  setViewMode: (mode: "board" | "list") => void;
  setActiveFilter: (filter: "assigned" | "all" | "completed" | "overdue") => void;
  setPriorityFilter: (p: string) => void;
  setSearchQuery: (q: string) => void;
  setActiveProjectId: (id: string | null) => void;
  setGroupBy: (g: "due_date" | "project" | "status" | "priority") => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [workspaces, setWorkspaces] = useState<TaskWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("ws-airsend-primary");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"assigned" | "all" | "completed" | "overdue">("assigned");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"due_date" | "project" | "status" | "priority">("due_date");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);

  const backendUrl = useMemo(() => getTasksApiUrl(), []);

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch workspaces & projects in parallel
      const [wsList, projList] = await Promise.all([
        tasksApi.getWorkspaces(),
        tasksApi.getProjects(activeWorkspaceId),
      ]);
      setWorkspaces(wsList);
      setProjects(projList);

      const targetWsId =
        wsList.length > 0 && wsList[0].id ? wsList[0].id : activeWorkspaceId;
      if (targetWsId !== activeWorkspaceId) {
        setActiveWorkspaceId(targetWsId);
      }

      // 2. Fetch tasks based on active project or assigned view
      if (activeProjectId) {
        const res = await tasksApi.getProjectTasks(activeProjectId);
        setTasks(res.tasks);
        setIsBackendLive(res.isLive);
      } else {
        const res = await tasksApi.getAssignedTasks(targetWsId);
        if (res.tasks.length === 0 && projList.length > 0) {
          // If no assigned tasks, load first project's tasks so user sees the board right away
          const firstProjRes = await tasksApi.getProjectTasks(projList[0].id);
          setTasks(firstProjRes.tasks);
          setIsBackendLive(firstProjRes.isLive);
        } else {
          setTasks(res.tasks);
          setIsBackendLive(res.isLive);
        }
      }
    } catch {
      setIsBackendLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, activeProjectId]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const res = await tasksApi.createTask(input);
      setTasks((prev) => [res.task, ...prev]);
      if (res.isLive) setIsBackendLive(true);
      return res.task;
    },
    []
  );

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
      const res = await tasksApi.updateTaskStatus(taskId, status);
      if (res.isLive) setIsBackendLive(true);
    },
    []
  );

  const updateTaskPriority = useCallback(
    async (taskId: string, priority: TaskPriority) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, priority } : t))
      );
      const res = await tasksApi.updateTaskPriority(taskId, priority);
      if (res.isLive) setIsBackendLive(true);
    },
    []
  );

  const updateTask = useCallback(
    async (taskId: string, input: UpdateTaskInput) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...input } : t))
      );
      const res = await tasksApi.updateTask(taskId, input);
      if (res.isLive) setIsBackendLive(true);
    },
    []
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      const res = await tasksApi.deleteTask(taskId);
      if (res.isLive) setIsBackendLive(true);
    },
    []
  );

  // Filter tasks based on search, project, active filter, priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Project filter
      if (activeProjectId && t.projectId !== activeProjectId) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && t.priority !== priorityFilter) {
        return false;
      }

      // Active tab filter
      if (activeFilter === "completed" && t.status !== "done") {
        return false;
      }
      if (activeFilter === "assigned" && t.status === "done") {
        return false;
      }
      if (activeFilter === "overdue") {
        if (!t.dueDate || t.status === "done") return false;
        const due = new Date(t.dueDate).getTime();
        if (due >= Date.now()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || "").toLowerCase().includes(q);
        const matchesProject = (t.projectName || "").toLowerCase().includes(q);
        const matchesTicket = (t.ticketId || "").toLowerCase().includes(q);
        const matchesLabel = t.labels?.some((l) => l.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesProject && !matchesTicket && !matchesLabel) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeProjectId, priorityFilter, activeFilter, searchQuery]);

  const value: TasksContextValue = {
    tasks,
    filteredTasks,
    projects,
    workspaces,
    activeWorkspaceId,
    activeProjectId,
    activeFilter,
    priorityFilter,
    viewMode,
    searchQuery,
    groupBy,
    isLoading,
    isBackendLive,
    backendUrl,

    createTask,
    updateTaskStatus,
    updateTaskPriority,
    updateTask,
    deleteTask,
    refreshTasks,
    setViewMode,
    setActiveFilter,
    setPriorityFilter,
    setSearchQuery,
    setActiveProjectId,
    setGroupBy,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return ctx;
}
