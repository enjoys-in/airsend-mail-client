import * as api from "../_lib/tasks-api";
import * as crud from "../_lib/tasks-crud-api";
import type { TaskItem, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from "../_lib/tasks-types";

export async function getTasks(projectId: string): Promise<TaskItem[]> {
  const res = await api.fetchProjectTasks(projectId);
  return res.tasks;
}

export async function getAssignedTasks(): Promise<TaskItem[]> {
  return api.fetchAssignedTasks();
}

export async function createTask(input: CreateTaskInput): Promise<TaskItem | null> {
  const ok = await crud.createTask(input);
  if (!ok) return null;
  return {
    id: `task-${Date.now()}`,
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    status: input.status || "todo",
    priority: input.priority || "none",
    dueDate: input.dueDate,
    labels: (input as any).labels || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<boolean> {
  return crud.updateTask(id, input);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
  const res = await crud.updateTaskStatus(id, status);
  return res.success;
}

export async function deleteTask(id: string): Promise<boolean> {
  return crud.deleteTask(id);
}

export async function reorderTasks(projectId: string, taskIds: string[]): Promise<boolean> {
  return true;
}
