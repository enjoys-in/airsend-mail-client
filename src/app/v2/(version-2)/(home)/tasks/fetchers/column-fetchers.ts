import * as api from "../_lib/tasks-api";
import type { TaskColumn } from "../_lib/tasks-types";

export async function getColumns(projectId: string): Promise<TaskColumn[]> {
  const res = await api.fetchProjectTasks(projectId);
  return res.columns;
}

export async function createColumn(projectId: string, name: string): Promise<boolean> {
  return true;
}

export async function updateColumn(columnId: string, name: string): Promise<boolean> {
  return true;
}

export async function deleteColumn(columnId: string): Promise<boolean> {
  return true;
}
