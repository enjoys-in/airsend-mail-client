import * as settingsApi from "../_lib/tasks-settings-api";
import type { TaskMember } from "../_lib/tasks-types";

export type WorkspaceMember = TaskMember;

export async function getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return settingsApi.fetchWorkspaceMembers(workspaceId);
}

export async function inviteMember(_workspaceId: string, _email: string, _role: string): Promise<boolean> {
  return true;
}

export async function removeMember(_workspaceId: string, _memberId: string): Promise<boolean> {
  return true;
}
