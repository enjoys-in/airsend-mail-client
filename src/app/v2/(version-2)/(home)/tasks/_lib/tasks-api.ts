import {
  type CreateTaskInput,
  type TaskItem,
  type TaskProject,
  type TaskWorkspace,
  type UpdateTaskInput,
  normalizeTaskStatus,
  toBackendTaskStatus,
} from "./tasks-types";

export function getTasksApiUrl(): string {
  if (typeof window !== "undefined") {
    const runtimeUrl = (window as any).__RUNTIME_CONFIG__?.TASKS_API_URL;
    if (runtimeUrl) return runtimeUrl.trim().replace(/\/+$/, "");
  }
  const envUrl = process.env.NEXT_PUBLIC_TASKS_API_URL || process.env.TASKS_API_URL;
  if (envUrl) return envUrl.trim().replace(/\/+$/, "");
  return "http://localhost:1337";
}

// Initial seed mock data for fallback when backend is starting or offline
const MOCK_WORKSPACE: TaskWorkspace = {
  id: "ws-airsend-primary",
  name: "AirSend Main",
  slug: "airsend-main",
};

const MOCK_PROJECTS: TaskProject[] = [
  {
    id: "proj-web",
    name: "Web Client",
    slug: "WEB",
    icon: "Globe",
    color: "#3b82f6",
    workspaceId: "ws-airsend-primary",
    taskCount: 5,
  },
  {
    id: "proj-backend",
    name: "Mail & Task Engine",
    slug: "ENG",
    icon: "Server",
    color: "#10b981",
    workspaceId: "ws-airsend-primary",
    taskCount: 4,
  },
  {
    id: "proj-mobile",
    name: "Mobile App",
    slug: "MOB",
    icon: "Smartphone",
    color: "#f59e0b",
    workspaceId: "ws-airsend-primary",
    taskCount: 3,
  },
];

const INITIAL_FALLBACK_TASKS: TaskItem[] = [
  {
    id: "task-1",
    projectId: "proj-web",
    projectName: "Web Client",
    projectSlug: "WEB",
    number: 101,
    ticketId: "WEB-101",
    title: "Integrate tasks backend repository endpoints with v2 UI",
    description: "Connect ../tasks API to the new /v2/tasks workspace view with support for board and list views.",
    status: "in-progress",
    priority: "urgent",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assigneeName: "Alex Morgan",
    assigneeEmail: "alex@airsend.io",
    labels: [
      { id: "l-1", name: "v2-ui", color: "#6366f1" },
      { id: "l-2", name: "backend-sync", color: "#ec4899" },
    ],
  },
  {
    id: "task-2",
    projectId: "proj-web",
    projectName: "Web Client",
    projectSlug: "WEB",
    number: 102,
    ticketId: "WEB-102",
    title: "Implement Kanban drag-and-drop & status columns",
    description: "Provide interactive columns for To Do, In Progress, In Review, and Done with smooth transitions.",
    status: "todo",
    priority: "high",
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    assigneeName: "Alex Morgan",
    assigneeEmail: "alex@airsend.io",
    labels: [{ id: "l-3", name: "frontend", color: "#3b82f6" }],
  },
  {
    id: "task-3",
    projectId: "proj-backend",
    projectName: "Mail & Task Engine",
    projectSlug: "ENG",
    number: 45,
    ticketId: "ENG-45",
    title: "Review task assigned endpoint caching and rate limits",
    description: "Check /api/task/assigned query response speed with multi-project filters.",
    status: "done",
    priority: "medium",
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    assigneeName: "Mullayam Singh",
    assigneeEmail: "mullayam06@gmail.com",
    labels: [{ id: "l-4", name: "performance", color: "#10b981" }],
  },
  {
    id: "task-4",
    projectId: "proj-mobile",
    projectName: "Mobile App",
    projectSlug: "MOB",
    number: 22,
    ticketId: "MOB-22",
    title: "Optimize mobile task cards and quick actions drawer",
    description: "Ensure touch responsiveness on small viewports and bottom navigation bar.",
    status: "todo",
    priority: "low",
    dueDate: new Date(Date.now() + 432000000).toISOString(),
    assigneeName: "Sarah Connor",
    assigneeEmail: "sarah@airsend.io",
    labels: [{ id: "l-5", name: "mobile", color: "#f59e0b" }],
  },
];

const LOCAL_STORAGE_KEY = "airsend_v2_tasks_store_v1";

function getLocalStoredTasks(): TaskItem[] {
  if (typeof window === "undefined") return INITIAL_FALLBACK_TASKS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_FALLBACK_TASKS;
}

function saveLocalStoredTasks(tasks: TaskItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore quota
  }
}

class TasksApiService {
  private lastBackendStatus: { connected: boolean; url: string; lastChecked: number } = {
    connected: false,
    url: "",
    lastChecked: 0,
  };

  private async fetchApi<T>(path: string, options: RequestInit = {}): Promise<{ data?: T; ok: boolean; error?: string }> {
    // Use Next.js API proxy to avoid CORS
    const proxyPath = `/api/tasks/${path.replace(/^\/+/, "")}`;
    try {
      const res = await fetch(proxyPath, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        return { ok: false, error: errorJson.error || `HTTP ${res.status}` };
      }

      const json = await res.json();
      this.lastBackendStatus.connected = true;
      return { data: json as T, ok: true };
    } catch (err: any) {
      this.lastBackendStatus.connected = false;
      return { ok: false, error: err?.message || "Network error" };
    }
  }

  // ── Workspaces & Projects ──

  async getWorkspaces(): Promise<TaskWorkspace[]> {
    const res = await this.fetchApi<any>("workspace");
    if (res.ok && res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (res.data.id && res.data.name) return [res.data];
      if (Array.isArray((res.data as any).workspaces)) return (res.data as any).workspaces;
    }
    return [MOCK_WORKSPACE];
  }

  async getProjects(workspaceId?: string): Promise<TaskProject[]> {
    const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : "";
    const res = await this.fetchApi<any>(`project${query}`);
    if (res.ok && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).projects || [];
      return list.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        icon: p.icon || "Folder",
        color: p.color || "#3b82f6",
        description: p.description,
        workspaceId: p.workspaceId,
        taskCount: p.statistics?.totalTasks ?? p.taskCount ?? 0,
      }));
    }
    return MOCK_PROJECTS;
  }

  // ── Assigned Tasks (User's Workspace Tasks) ──

  async getAssignedTasks(workspaceId?: string): Promise<{ tasks: TaskItem[]; total: number; isLive: boolean }> {
    const wsQuery = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : "";
    const res = await this.fetchApi<{ tasks: any[]; total: number }>(`task/assigned${wsQuery}`);

    if (res.ok && res.data && Array.isArray(res.data.tasks)) {
      const mapped: TaskItem[] = res.data.tasks.map((t: any) => ({
        id: t.id,
        projectId: t.projectId,
        projectName: t.projectName,
        projectSlug: t.projectSlug,
        projectIcon: t.projectIcon,
        number: t.number,
        ticketId: t.number != null ? `${t.projectSlug || "TASK"}-${t.number}` : t.projectSlug || "TASK",
        title: t.title,
        description: t.description,
        status: normalizeTaskStatus(t.status),
        statusName: t.statusName,
        statusIcon: t.statusIcon,
        priority: (t.priority || "none") as any,
        dueDate: t.dueDate,
        labels: t.labels || [],
        createdAt: t.createdAt,
      }));
      return { tasks: mapped, total: res.data.total ?? mapped.length, isLive: true };
    }

    // Fallback to local stored tasks
    const local = getLocalStoredTasks();
    return { tasks: local, total: local.length, isLive: false };
  }

  // ── Project Tasks ──

  async getProjectTasks(projectId: string): Promise<{ tasks: TaskItem[]; total: number; isLive: boolean }> {
    const res = await this.fetchApi<any>(`task/tasks/${encodeURIComponent(projectId)}`);

    if (res.ok && res.data) {
      const boardData = res.data.data || res.data;
      let rawTasks: any[] = [];
      if (Array.isArray(boardData.columns)) {
        for (const col of boardData.columns) {
          if (Array.isArray(col.tasks)) {
            for (const t of col.tasks) {
              rawTasks.push({
                ...t,
                status: col.slug || t.status,
                statusName: col.name,
              });
            }
          }
        }
      } else if (Array.isArray(boardData.tasks)) {
        rawTasks = boardData.tasks;
      }

      const mapped: TaskItem[] = rawTasks.map((t: any) => ({
        id: t.id,
        projectId: t.projectId || projectId,
        projectName: t.projectName || boardData.name,
        projectSlug: t.projectSlug || boardData.slug,
        number: t.number,
        ticketId: t.number != null ? `${t.projectSlug || boardData.slug || "TASK"}-${t.number}` : undefined,
        title: t.title,
        description: t.description,
        status: normalizeTaskStatus(t.status),
        statusName: t.statusName,
        priority: (t.priority || "none") as any,
        dueDate: t.dueDate,
        assigneeId: t.userId,
        assigneeName: t.userName,
        labels: t.labels || [],
        createdAt: t.createdAt,
      }));
      return { tasks: mapped, total: mapped.length, isLive: true };
    }

    const local = getLocalStoredTasks().filter((t) => t.projectId === projectId);
    return { tasks: local, total: local.length, isLive: false };
  }

  // ── Create Task ──

  async createTask(input: CreateTaskInput): Promise<{ task: TaskItem; isLive: boolean }> {
    const res = await this.fetchApi<any>(`task/${encodeURIComponent(input.projectId)}`, {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        description: input.description || "",
        priority: input.priority || "medium",
        status: toBackendTaskStatus(input.status || "todo"),
        dueDate: input.dueDate,
        userId: input.assigneeId,
      }),
    });

    if (res.ok && res.data) {
      const t = res.data;
      const created: TaskItem = {
        id: t.id,
        projectId: t.projectId || input.projectId,
        title: t.title,
        description: t.description,
        status: normalizeTaskStatus(t.status || input.status),
        priority: t.priority || input.priority || "medium",
        dueDate: t.dueDate || input.dueDate,
        labels: t.labels || [],
        number: t.number,
        ticketId: t.number ? `TASK-${t.number}` : undefined,
      };
      return { task: created, isLive: true };
    }

    // Local fallback creation
    const local = getLocalStoredTasks();
    const newId = `task-${Date.now()}`;
    const newTask: TaskItem = {
      id: newId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      priority: input.priority || "medium",
      status: normalizeTaskStatus(input.status),
      dueDate: input.dueDate,
      number: local.length + 100,
      ticketId: `TASK-${local.length + 100}`,
      labels: (input.labels || []).map((l, i) => ({ id: `l-${i}`, name: l, color: "#6366f1" })),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...local];
    saveLocalStoredTasks(updated);
    return { task: newTask, isLive: false };
  }

  // ── Update Task Status ──

  async updateTaskStatus(taskId: string, status: TaskItem["status"]): Promise<{ ok: boolean; isLive: boolean }> {
    const res = await this.fetchApi<any>(`task/status/${encodeURIComponent(taskId)}`, {
      method: "PUT",
      body: JSON.stringify({ status: toBackendTaskStatus(status) }),
    });

    if (res.ok) {
      return { ok: true, isLive: true };
    }

    // Fallback local update
    const local = getLocalStoredTasks();
    const updated = local.map((t) => (t.id === taskId ? { ...t, status: normalizeTaskStatus(status) } : t));
    saveLocalStoredTasks(updated);
    return { ok: true, isLive: false };
  }

  // ── Update Task Priority ──

  async updateTaskPriority(taskId: string, priority: TaskItem["priority"]): Promise<{ ok: boolean; isLive: boolean }> {
    const res = await this.fetchApi<any>(`task/priority/${encodeURIComponent(taskId)}`, {
      method: "PUT",
      body: JSON.stringify({ priority }),
    });

    if (res.ok) {
      return { ok: true, isLive: true };
    }

    const local = getLocalStoredTasks();
    const updated = local.map((t) => (t.id === taskId ? { ...t, priority } : t));
    saveLocalStoredTasks(updated);
    return { ok: true, isLive: false };
  }

  // ── Update Task Details ──

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<{ ok: boolean; isLive: boolean }> {
    const res = await this.fetchApi<any>(`task/${encodeURIComponent(taskId)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });

    if (res.ok) {
      return { ok: true, isLive: true };
    }

    const local = getLocalStoredTasks();
    const updated = local.map((t) => (t.id === taskId ? { ...t, ...input } : t));
    saveLocalStoredTasks(updated);
    return { ok: true, isLive: false };
  }

  // ── Delete Task ──

  async deleteTask(taskId: string): Promise<{ ok: boolean; isLive: boolean }> {
    const res = await this.fetchApi<any>(`task/${encodeURIComponent(taskId)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      return { ok: true, isLive: true };
    }

    const local = getLocalStoredTasks();
    const updated = local.filter((t) => t.id !== taskId);
    saveLocalStoredTasks(updated);
    return { ok: true, isLive: false };
  }
}

export const tasksApi = new TasksApiService();
