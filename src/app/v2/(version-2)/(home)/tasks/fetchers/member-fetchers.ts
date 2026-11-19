import * as settingsApi from "../_lib/tasks-settings-api";
import type { WorkspaceMember } from "../_lib/tasks-settings-api";

export async function getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return settingsApi.fetchWorkspaceMembers(workspaceId);
}

export async function inviteMember(workspaceId: string, email: string, role: string): Promise<boolean> {
  return true;
}

export async function removeMember(workspaceId: string, memberId: string): Promise<boolean> {
  return settingsApi.removeWorkspaceMember(workspaceId, memberId);
}
