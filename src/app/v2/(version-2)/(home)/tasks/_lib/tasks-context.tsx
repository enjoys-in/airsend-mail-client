"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  type CreateProjectInput,
  type CreateTaskInput,
  type TaskColumn,
  type TaskItem,
  type TaskLabel,
  type TaskPriority,
  type TaskProject,
  type TaskStatus,
  type TasksViewMode,
  type UpdateTaskInput,
} from "./tasks-types";
import * as api from "./tasks-api";
import { useTasksFiltering } from "./use-tasks-filtering";
import { useTaskMutations } from "./use-task-mutations";

interface TasksContextValue {
  projects: TaskProject[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  currentProject: TaskProject | null;
  columns: TaskColumn[];
  tasks: TaskItem[];
  assignedTasks: TaskItem[];
  filteredTasks: TaskItem[];
  labels: TaskLabel[];
  isLoading: boolean;
  viewMode: TasksViewMode;
  setViewMode: (mode: TasksViewMode) => void;
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
  isProjectCreateOpen: boolean;
  setIsProjectCreateOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsSection: string;
  setSettingsSection: (section: string) => void;
  openSettings: (section?: string) => void;
  closeSettings: () => void;
  createDefaultStatus: TaskStatus;
  setCreateDefaultStatus: (status: TaskStatus) => void;
  refreshTasks: () => Promise<void>;
  refreshAssignedTasks: () => Promise<void>;
  handleCreateTask: (input: CreateTaskInput) => Promise<boolean>;
  handleUpdateTask: (id: string, input: UpdateTaskInput) => Promise<boolean>;
  handleMoveTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>;
  handleDeleteTask: (id: string) => Promise<boolean>;
  handleCreateProject: (input: CreateProjectInput) => Promise<boolean>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const existing = useContext(TasksContext);
  if (existing) return <>{children}</>;

  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<TaskItem[]>([]);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<TasksViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState("workspace-general");
  const isSettingsOpen = viewMode === "settings";
  const setIsSettingsOpen = useCallback(
    (open: boolean) => setViewMode(open ? "settings" : "board"),
    []
  );
  const openSettings = useCallback((sec?: string) => {
    if (sec) setSettingsSection(sec);
    setViewMode("settings");
  }, []);
  const closeSettings = useCallback(() => setViewMode("board"), []);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("todo");

  const refreshProjects = async () => {
    const projs = await api.fetchProjects();
    setProjects(projs);
    if (projs.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projs[0].id);
    }
  };

  useEffect(() => {
    void refreshProjects();
  }, []);

  const refreshTasks = async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    const result = await api.fetchProjectTasks(selectedProjectId);
    setColumns(result.columns);
    setTasks(result.tasks);
    if (result.project?.workspaceId) {
      const lbls = await api.fetchLabels(result.project.workspaceId);
      setLabels(lbls);
    }
    setIsLoading(false);
  };

  const refreshAssignedTasks = async () => {
    const list = await api.fetchAssignedTasks();
    setAssignedTasks(list);
  };

  useEffect(() => {
    if (selectedProjectId) void refreshTasks();
    void refreshAssignedTasks();
  }, [selectedProjectId]);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const activeTaskList = viewMode === "my-tasks" ? assignedTasks : tasks;
  const filteredTasks = useTasksFiltering(activeTaskList, statusFilter, priorityFilter, searchQuery);

  const mutations = useTaskMutations({
    selectedTask,
    setSelectedTask,
    setTasks,
    setAssignedTasks,
    refreshTasks,
    refreshAssignedTasks,
    refreshProjects,
    setSelectedProjectId,
  });

  return (
    <TasksContext.Provider
      value={{
        projects, selectedProjectId, setSelectedProjectId, currentProject,
        columns, tasks, assignedTasks, filteredTasks, labels, isLoading,
        viewMode, setViewMode, searchQuery, setSearchQuery,
        statusFilter, setStatusFilter, priorityFilter, setPriorityFilter,
        selectedTask, setSelectedTask, isCreateOpen, setIsCreateOpen,
        isProjectCreateOpen, setIsProjectCreateOpen,
        isSettingsOpen, setIsSettingsOpen, settingsSection, setSettingsSection,
        openSettings, closeSettings, createDefaultStatus, setCreateDefaultStatus,
        refreshTasks, refreshAssignedTasks,
        ...mutations,
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
