import { TASKS_BASE_URL, tasksFetch } from "./tasks-http";
import {
  type CreateTaskInput,
  type TaskItem,
  type TaskStatus,
  type UpdateTaskInput,
  normalizeTaskStatus,
} from "./tasks-types";

const BASE_URL = TASKS_BASE_URL;

export async function createTask(input: CreateTaskInput): Promise<TaskItem | null> {
  try {
    const res = await tasksFetch(`${BASE_URL}/task/${input.projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        description: input.description || "",
        status: input.status || "todo",
        priority: input.priority || "none",
        userId: input.assigneeId || undefined,
        dueDate: input.dueDate || undefined,
      }),
    });
    if (!res.ok) return null;
    const t = await res.json();
    return {
      id: t.id,
      projectId: t.projectId || input.projectId,
      number: t.number,
      ticketId: t.number ? `#${t.number}` : t.id.slice(0, 8),
      title: t.title,
      description: t.description || "",
      status: normalizeTaskStatus(t.status),
      priority: t.priority || "none",
      dueDate: t.dueDate,
      assigneeId: t.userId,
      labels: [],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<boolean> {
  try {
    const res = await tasksFetch(`${BASE_URL}/task/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(input.title ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.priority ? { priority: input.priority } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
        ...(input.assigneeId !== undefined ? { userId: input.assigneeId } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const ok = await updateTask(taskId, { status });
  return { isLive: ok, success: ok };
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const res = await tasksFetch(`${BASE_URL}/task/${taskId}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
