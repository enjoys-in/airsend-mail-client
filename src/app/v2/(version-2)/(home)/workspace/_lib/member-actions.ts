// ============================================================================
// Member management actions (role assignment, timeouts, removal). Each one
// calls the server first and updates local state only on success, so the UI
// never shows a change the server refused.
// ============================================================================

import { workspaceApi, apiErrorMessage } from "./api";
import { useChatStore } from "./chat-store";
import { useAccessStore } from "./access-store";
import type { MemberRole, Role } from "./chat-types";

type Result = { ok: true } | { ok: false; error: string };

const sameEmail = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

function patchMember(teamId: string, email: string, patch: Record<string, unknown>) {
  useChatStore.setState((s) => ({
    members: s.members.map((m) => (m.teamId === teamId && sameEmail(m.email, email) ? { ...m, ...patch } : m)),
  }));
}

/** My own access changed: refetch it and my channel permissions. */
function refreshSelf(teamId: string, email: string) {
  const { currentUserId, fetchChannels } = useChatStore.getState();
  if (!sameEmail(currentUserId, email)) return;
  void useAccessStore.getState().fetchAccess(teamId, true);
  void fetchChannels(teamId, currentUserId);
}

/** Assigns a role. Custom roles need enforce mode; system roles work in every mode. */
export async function assignRole(teamId: string, email: string, role: Role | MemberRole): Promise<Result> {
  const actor = useChatStore.getState().currentUserId;
  try {
    if (typeof role === "string") {
      await workspaceApi.changeMemberRole(teamId, email, role, actor);
      patchMember(teamId, email, { role, roleName: undefined, roleId: undefined });
    } else {
      await workspaceApi.assignRole(teamId, email, role.id);
      patchMember(teamId, email, {
        role: role.systemKey ?? "member",
        roleId: role.id,
        roleName: role.name,
        roleColor: role.color,
        rolePosition: role.position,
      });
    }
    useAccessStore.getState().invalidateTeam(teamId);
    refreshSelf(teamId, email);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: apiErrorMessage(err, "Could not change the role") };
  }
}

/** Times a member out for `minutes` (0 ends the timeout). */
export async function timeoutMember(teamId: string, email: string, minutes: number, reason?: string): Promise<Result> {
  try {
    const res = await workspaceApi.timeoutMember(teamId, email, minutes, reason);
    patchMember(teamId, email, { timedOutUntil: res.timed_out_until ?? undefined });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: apiErrorMessage(err, "Could not update the timeout") };
  }
}

/** Removes a member from the team. */
export async function kickMember(teamId: string, email: string): Promise<Result> {
  const actor = useChatStore.getState().currentUserId;
  try {
    await workspaceApi.removeMember(teamId, email, actor);
    useChatStore.setState((s) => ({
      members: s.members.filter((m) => !(m.teamId === teamId && sameEmail(m.email, email))),
    }));
    useAccessStore.getState().invalidateTeam(teamId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: apiErrorMessage(err, "Could not remove the member") };
  }
}

/** Discord's timeout presets. */
export const TIMEOUT_PRESETS: { label: string; minutes: number }[] = [
  { label: "60 seconds", minutes: 1 },
  { label: "5 minutes", minutes: 5 },
  { label: "10 minutes", minutes: 10 },
  { label: "1 hour", minutes: 60 },
  { label: "1 day", minutes: 60 * 24 },
  { label: "1 week", minutes: 60 * 24 * 7 },
];

export function formatUntil(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const mins = Math.round((d.getTime() - Date.now()) / 60000);
  if (mins <= 1) return "less than a minute";
  if (mins < 60) return `${mins} min`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h`;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
