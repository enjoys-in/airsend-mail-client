import * as api from "../_lib/tasks-api";
import * as settingsApi from "../_lib/tasks-settings-api";
import type { TaskLabel } from "../_lib/tasks-types";

export async function getLabels(workspaceId: string): Promise<TaskLabel[]> {
  return settingsApi.fetchWorkspaceLabels(workspaceId);
}

export async function createLabel(workspaceId: string, name: string, color: string): Promise<boolean> {
  return settingsApi.createWorkspaceLabel(workspaceId, { name, color });
}

export async function deleteLabel(labelId: string): Promise<boolean> {
  return settingsApi.deleteWorkspaceLabel(labelId);
}
