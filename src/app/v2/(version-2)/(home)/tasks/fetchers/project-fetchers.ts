import * as api from "../_lib/tasks-api";
import type { TaskProject, CreateProjectInput } from "../_lib/tasks-types";

export async function getProjects(): Promise<TaskProject[]> {
  return api.fetchProjects();
}

export async function createProject(input: CreateProjectInput): Promise<TaskProject | null> {
  const ok = await api.createProject(input);
  if (!ok) return null;
  return {
    id: `proj-${Date.now()}`,
    name: input.name,
    slug: input.slug,
    description: input.description,
    taskCount: 0,
  };
}

export async function updateProject(id: string, input: Partial<CreateProjectInput>): Promise<boolean> {
  return api.updateProject(id, input);
}

export async function deleteProject(id: string): Promise<boolean> {
  return api.deleteProject(id);
}
