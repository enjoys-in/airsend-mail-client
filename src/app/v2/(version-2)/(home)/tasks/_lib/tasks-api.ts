import {
  type CreateTaskInput,
  type TaskColumn,
  type TaskItem,
  type TaskProject,
  type TaskStatus,
  type UpdateTaskInput,
  normalizeTaskStatus,
} from "./tasks-types";

const BASE_URL = "/api/tasks";

export async function fetchProjects(): Promise<TaskProject[]> {
  try {
    const res = await fetch(`${BASE_URL}/project`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load projects");
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      icon: p.icon || "Layout",
      description: p.description || "",
      workspaceId: p.workspaceId,
      taskCount: p.statistics?.totalTasks ?? 0,
    }));
  } catch (error) {
    console.error("fetchProjects error:", error);
    return [];
  }
}

export async function fetchProjectTasks(projectId: string): Promise<{
  project: TaskProject | null;
  columns: TaskColumn[];
  tasks: TaskItem[];
}> {
  try {
    const res = await fetch(`${BASE_URL}/task/tasks/${projectId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load tasks");
    const json = await res.json();
    const data = json?.data || json;

    const project: TaskProject | null = data?.id
      ? {
          id: data.id,
          name: data.name,
          slug: data.slug,
          icon: data.icon || "Layout",
          description: data.description || "",
          workspaceId: data.workspaceId,
        }
      : null;

    const rawCols = Array.isArray(data?.columns) ? data.columns : [];
    const columns: TaskColumn[] = rawCols.map((c: any, idx: number) => ({
      id: c.id || c.slug || `col-${idx}`,
      name: c.name,
      slug: c.slug || c.id,
      position: c.position ?? idx,
      icon: c.icon,
      isFinal: Boolean(c.isFinal),
    }));

    const tasks: TaskItem[] = [];
    for (const col of rawCols) {
      if (Array.isArray(col.tasks)) {
        for (const t of col.tasks) {
          tasks.push({
            id: t.id,
            projectId: t.projectId || projectId,
            projectName: project?.name,
            projectSlug: project?.slug || data?.slug,
            number: t.number,
            ticketId: t.number && data?.slug ? `${data.slug}-${t.number}` : t.id.slice(0, 8),
            title: t.title,
            description: t.description || "",
            status: normalizeTaskStatus(t.status || col.slug),
            statusName: col.name,
            statusIcon: col.icon,
            priority: t.priority || "none",
            dueDate: t.dueDate,
            assigneeId: t.userId || t.assigneeId,
            assigneeName: t.assigneeName,
            assigneeAvatar: t.assigneeImage,
            labels: Array.isArray(t.labels) ? t.labels : [],
            position: t.position ?? 0,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          });
        }
      }
    }

    return { project, columns, tasks };
  } catch (error) {
    console.error("fetchProjectTasks error:", error);
    return { project: null, columns: [], tasks: [] };
  }
}

export async function createTask(input: CreateTaskInput): Promise<TaskItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/task/${input.projectId}`, {
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
    if (!res.ok) throw new Error("Failed to create task");
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
  } catch (error) {
    console.error("createTask error:", error);
    return null;
  }
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/task/${taskId}`, {
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
  } catch (error) {
    console.error("updateTask error:", error);
    return false;
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const ok = await updateTask(taskId, { status });
  return { isLive: ok, success: ok };
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/task/${taskId}`, { method: "DELETE" });
    return res.ok;
  } catch (error) {
    console.error("deleteTask error:", error);
    return false;
  }
}

export const tasksApi = {
  fetchProjects,
  fetchProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getWorkspaces: async () => [{ id: "QLgzDfOu35H0B5B4p6qWHC22JLlvoNNQ", name: "AirSend", slug: "airsend" }],
  getAssignedTasks: async (workspaceId?: string) => {
    const projs = await fetchProjects();
    const pid = projs[0]?.id || "026bd7c8-beb7-4a3d-96b6-6b3e162ead91";
    const res = await fetchProjectTasks(pid);
    return { isLive: true, tasks: res.tasks };
  },
};
