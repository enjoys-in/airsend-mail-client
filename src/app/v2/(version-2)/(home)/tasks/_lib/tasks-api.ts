import { TASKS_BASE_URL, tasksFetch } from "./tasks-http";
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

const BASE_URL = TASKS_BASE_URL;

let workspaceIdPromise: Promise<string | null> | null = null;

/**
 * The user's Kaneo workspace id. Kaneo needs it on the project and assigned-task lists and the proxy no longer asks
 * airsend-api for it, so it is read from Kaneo's own workspace list (first workspace unless one was passed in).
 */
function resolveWorkspaceId(): Promise<string | null> {
  workspaceIdPromise ??= (async () => {
    try {
      const res = await tasksFetch(`${BASE_URL}/auth/organization/list`, { cache: "no-store" });
      if (!res.ok) return null;
      const list = await res.json();
      return Array.isArray(list) && list[0]?.id ? String(list[0].id) : null;
    } catch {
      return null;
    }
  })().then((id) => {
    if (!id) workspaceIdPromise = null; // don't cache a failure
    return id;
  });
  return workspaceIdPromise;
}

export async function fetchProjects(workspaceId?: string): Promise<TaskProject[]> {
  try {
    const ws = workspaceId ?? (await resolveWorkspaceId());
    if (!ws) return [];
    const res = await tasksFetch(`${BASE_URL}/project?workspaceId=${encodeURIComponent(ws)}`, { cache: "no-store" });
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
    const res = await tasksFetch(`${BASE_URL}/task/tasks/${projectId}`, { cache: "no-store" });
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

export type AssignedTasksResult =
  | { status: "ok"; tasks: TaskItem[] }
  /** The token was refused (401/403), or the user has no workspace in the tasks service. */
  | { status: "no-access" }
  | { status: "unreachable" };

/**
 * Tasks assigned to the signed-in user. The tasks API decides "who" from the AirSend token and
 * only ever returns that user's own tasks; this just reports why a list is empty instead of
 * collapsing every failure into "no tasks".
 */
export async function fetchAssignedTasksResult(workspaceId?: string): Promise<AssignedTasksResult> {
  try {
    const ws = workspaceId ?? (await resolveWorkspaceId());
    if (!ws) return { status: "no-access" };
    const res = await tasksFetch(`${BASE_URL}/task/assigned?workspaceId=${encodeURIComponent(ws)}`, { cache: "no-store" });
    if (res.status === 401 || res.status === 403) return { status: "no-access" };
    if (!res.ok) return { status: "unreachable" };
    const data = await res.json();
    const rawList = Array.isArray(data?.tasks) ? data.tasks : [];
    const tasks: TaskItem[] = rawList.map((t: any) => ({
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
    return { status: "ok", tasks };
  } catch {
    return { status: "unreachable" };
  }
}

export async function fetchAssignedTasks(workspaceId?: string): Promise<TaskItem[]> {
  const result = await fetchAssignedTasksResult(workspaceId);
  return result.status === "ok" ? result.tasks : [];
}

export const tasksApi = {
  fetchProjects,
  fetchProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getAssignedTasks: async (workspaceId?: string) => {
    const list = await fetchAssignedTasks(workspaceId);
    return { isLive: true, tasks: list };
  },
};
