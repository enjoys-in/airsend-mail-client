import * as settingsApi from "../_lib/tasks-settings-api";
import type { TaskLabel } from "../_lib/tasks-types";

export async function getLabels(workspaceId: string): Promise<TaskLabel[]> {
  return settingsApi.fetchLabels(workspaceId);
}

export async function createLabel(workspaceId: string, name: string, color: string): Promise<boolean> {
  const res = await settingsApi.createLabel(name, color, workspaceId);
  return !!res;
}

export async function deleteLabel(labelId: string): Promise<boolean> {
  return settingsApi.deleteLabel(labelId);
}
