"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "../../../../_lib/chat-store";
import { useAccessStore } from "../../../../_lib/access-store";
import { useTeamAccess, memberPosition } from "../../../../_lib/use-access";
import type { Role, TeamMember } from "../../../../_lib/chat-types";

/** Everything a team settings page needs, loaded once per team. */
export function useTeamSettings() {
  const params = useParams<{ teamId: string }>();
  const teamId = params?.teamId ?? "";

  const team = useChatStore((s) => s.teams.find((t) => t.id === teamId));
  const allMembers = useChatStore((s) => s.members);
  const allChannels = useChatStore((s) => s.channels);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const roles = useAccessStore((s) => s.roles[teamId]);
  const catalog = useAccessStore((s) => s.catalog);
  const perms = useTeamAccess(teamId);

  useEffect(() => {
    if (!teamId) return;
    const access = useAccessStore.getState();
    void access.fetchRoles(teamId);
    void access.fetchCatalog();
  }, [teamId]);

  const members = useMemo(() => {
    const list = allMembers.filter((m) => m.teamId === teamId);
    return list.sort(
      (a, b) =>
        memberPosition(b, team?.ownerId) - memberPosition(a, team?.ownerId) ||
        (a.displayName || a.email).localeCompare(b.displayName || b.email),
    );
  }, [allMembers, teamId, team?.ownerId]);

  const channels = useMemo(() => allChannels.filter((c) => c.teamId === teamId), [allChannels, teamId]);

  /** Roles the caller may assign or edit (strictly below them; never owner). */
  const manageableRoles = useMemo(
    () => (roles ?? []).filter((r) => r.systemKey !== "owner" && perms.outranks(r.position)),
    [roles, perms],
  );

  const roleOf = (m: TeamMember): Role | undefined =>
    roles?.find((r) => r.id === m.roleId) ?? roles?.find((r) => r.systemKey === m.role);

  const isOwnerMember = (m: TeamMember) => !!team?.ownerId && m.email?.toLowerCase() === team.ownerId.toLowerCase();

  return {
    teamId,
    team,
    currentUserId,
    members,
    channels,
    roles: roles ?? [],
    rolesLoaded: roles !== undefined,
    manageableRoles,
    catalog,
    roleOf,
    isOwnerMember,
    ...perms,
    /** Custom roles & overrides are editable (server runs AUTHZ_MODE=enforce). */
    customRoles: !!perms.access?.customRoles,
  };
}

export type TeamSettings = ReturnType<typeof useTeamSettings>;
