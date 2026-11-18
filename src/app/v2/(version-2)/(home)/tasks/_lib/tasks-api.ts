import {
  type TaskColumn,
  type TaskItem,
  type TaskProject,
  normalizeTaskStatus,
} from "./tasks-types";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "./tasks-crud-api";

export * from "./tasks-settings-api";
export * from "./tasks-crud-api";

const BASE_URL = "/api/tasks";

export async function fetchProjects(): Promise<TaskProject[]> {
  try {
    const res = await fetch(`${BASE_URL}/project`, { cache: "no-store" });
    if (!res.ok) return [];
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
      isPublic: Boolean(p.isPublic),
    }));
  } catch {
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
    if (!res.ok) return { project: null, columns: [], tasks: [] };
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
  } catch {
    return { project: null, columns: [], tasks: [] };
  }
}

export async function fetchAssignedTasks(workspaceId?: string): Promise<TaskItem[]> {
  try {
    const url = workspaceId
      ? `${BASE_URL}/task/assigned?workspaceId=${workspaceId}`
      : `${BASE_URL}/task/assigned`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const rawList = Array.isArray(data?.tasks) ? data.tasks : [];
    return rawList.map((t: any) => ({
      id: t.id,
      projectId: t.projectId,
      projectName: t.project?.name,
      projectSlug: t.project?.slug,
      projectIcon: t.project?.icon,
      number: t.number,
      ticketId: t.number && t.project?.slug ? `${t.project.slug}-${t.number}` : t.id.slice(0, 8),
      title: t.title,
      description: t.description || "",
      status: normalizeTaskStatus(t.status),
      priority: t.priority || "none",
      dueDate: t.dueDate,
      assigneeId: t.userId,
      assigneeName: t.assigneeName,
      labels: Array.isArray(t.labels) ? t.labels : [],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  } catch {
    return [];
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
    const list = await fetchAssignedTasks(workspaceId);
    return { isLive: true, tasks: list };
  },
};
