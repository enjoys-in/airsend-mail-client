import {
  type CreateProjectInput,
  type TaskColumn,
  type TaskLabel,
  type TaskMember,
  type TaskProject,
} from "./tasks-types";

const BASE_URL = "/api/tasks";

export async function createProject(input: CreateProjectInput): Promise<TaskProject | null> {
  try {
    const res = await fetch(`${BASE_URL}/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const p = await res.json();
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      icon: p.icon || "Layout",
      description: p.description || "",
      workspaceId: p.workspaceId,
      taskCount: 0,
    };
  } catch {
    return null;
  }
}

export async function updateProject(
  id: string,
  data: Partial<CreateProjectInput & { isPublic?: boolean }>
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/project/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/project/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLabels(workspaceId: string): Promise<TaskLabel[]> {
  try {
    const res = await fetch(`${BASE_URL}/label/workspace/${workspaceId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createLabel(name: string, color: string, workspaceId: string): Promise<TaskLabel | null> {
  try {
    const res = await fetch(`${BASE_URL}/label`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, workspaceId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteLabel(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/label/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createColumn(
  projectId: string,
  name: string,
  slug: string,
  position: number
): Promise<TaskColumn | null> {
  try {
    const res = await fetch(`${BASE_URL}/column/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, position, icon: "Circle" }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteColumn(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/column/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchWorkspaceMembers(workspaceId: string): Promise<TaskMember[]> {
  try {
    const res = await fetch(`${BASE_URL}/workspace/${workspaceId}/members`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((m: any) => ({
      id: String(m.id),
      userId: String(m.id),
      name: m.name || m.email?.split("@")[0] || "User",
      email: m.email,
      avatarUrl: m.image,
      role: m.role || "member",
    }));
  } catch {
    return [];
  }
}
