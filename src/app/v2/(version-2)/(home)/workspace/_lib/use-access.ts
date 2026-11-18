"use client";

// ============================================================================
// Permission hooks — what the current user may do in a team, a channel and on
// a message. One place decides, so the context menu, hover toolbar, composer
// and settings pages always agree with each other (and with the server).
// ============================================================================

import { useEffect, useMemo } from "react";
import { useAccessStore } from "./access-store";
import { useChatStore } from "./chat-store";
import { getUserRoleInTeam, hasTeamPermission, resolveChannelPermission } from "./permissions";
import type { Channel, ChatMessage, PermissionKey, TeamAccess, TeamMember } from "./chat-types";

const OWNER_POSITION = 2147483647;

/** Effective rank of a member (owner above everything). */
export function memberPosition(m: TeamMember | undefined, ownerEmail?: string): number {
  if (!m) return 0;
  if (ownerEmail && m.email?.toLowerCase() === ownerEmail.toLowerCase()) return OWNER_POSITION;
  if (typeof m.rolePosition === "number") return m.rolePosition;
  return { owner: OWNER_POSITION, admin: 80, moderator: 60, member: 40, guest: 20 }[m.role] ?? 0;
}

export function isTimedOut(until?: string): boolean {
  return !!until && new Date(until).getTime() > Date.now();
}

// ── Team ──

export interface TeamPermissions {
  access: TeamAccess | null;
  loading: boolean;
  can: (key: PermissionKey) => boolean;
  /** Whether the caller ranks above `position` (Discord-style hierarchy). */
  outranks: (position: number) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  /** Can open team settings at all. */
  canOpenSettings: boolean;
}

export function useTeamAccess(teamId: string | null | undefined): TeamPermissions {
  const access = useAccessStore((s) => (teamId ? s.access[teamId] ?? null : null));
  const fetchAccess = useAccessStore((s) => s.fetchAccess);

  useEffect(() => {
    if (teamId) void fetchAccess(teamId);
  }, [teamId, fetchAccess]);

  return useMemo(() => {
    const can = (key: PermissionKey) => hasTeamPermission(access, key);
    const isOwner = !!access?.owner;
    const isAdmin = isOwner || !!access?.administrator;
    return {
      access,
      loading: !access,
      can,
      outranks: (position: number) => isOwner || (!!access && position < access.position),
      isOwner,
      isAdmin,
      // Every member can view settings (members list, roles); editing is gated per section.
      canOpenSettings: !!access,
    };
  }, [access]);
}

// ── Channel ──

export function useChannelPermissions(channel: Channel | null | undefined) {
  const teamId = channel?.teamId;
  const { access } = useTeamAccess(teamId);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const members = useChatStore((s) => s.members);
  const role = getUserRoleInTeam(members, teamId, currentUserId);

  return useMemo(() => {
    const can = (key: PermissionKey) => resolveChannelPermission(channel, role, key, access);
    return {
      can,
      /** Channel settings: general (manage_channel) or overrides (manage_roles). */
      canManage: can("manage_channel"),
      canEditOverrides: hasTeamPermission(access, "manage_roles"),
      timedOut: isTimedOut(access?.timedOutUntil),
      timedOutUntil: access?.timedOutUntil,
    };
  }, [channel, role, access]);
}

// ── Message ──

export interface MessagePermissions {
  isMine: boolean;
  canReact: boolean;
  canReplyThread: boolean;
  canReply: boolean;
  canEdit: boolean;
  canPin: boolean;
  canDelete: boolean;
  /** Deleting someone else's message (moderation, confirm first). */
  deletesAsModerator: boolean;
  canTimeoutAuthor: boolean;
  canKickAuthor: boolean;
  canChangeAuthorRole: boolean;
  author?: TeamMember;
  authorTimedOut: boolean;
  teamId?: string;
}

export function useMessagePermissions(message: ChatMessage): MessagePermissions {
  const currentUserId = useChatStore((s) => s.currentUserId);
  const channel = useChatStore((s) => s.channels.find((c) => c.id === message.channelId));
  const members = useChatStore((s) => s.members);
  const team = useChatStore((s) => (channel ? s.teams.find((t) => t.id === channel.teamId) : undefined));
  const { can } = useChannelPermissions(channel);
  const teamPerms = useTeamAccess(channel?.teamId);

  return useMemo(() => {
    const me = (currentUserId || "").toLowerCase();
    const isMine = !!me && message.authorId?.toLowerCase() === me;
    const live = !message.isDeleted && message.type !== "system";
    const author = channel
      ? members.find((m) => m.teamId === channel.teamId && m.email?.toLowerCase() === message.authorId?.toLowerCase())
      : undefined;
    const authorRank = memberPosition(author, team?.ownerId);
    const authorIsOwner = authorRank === OWNER_POSITION;
    const moderatable = !!author && !isMine && !authorIsOwner && teamPerms.outranks(authorRank);
    const canManageMessages = can("manage_messages");

    return {
      isMine,
      canReact: live && can("add_reactions"),
      canReplyThread: live && can("reply_threads"),
      canReply: live && can("send_messages"),
      canEdit: live && isMine && message.type === "text",
      canPin: live && canManageMessages,
      canDelete: live && (isMine || canManageMessages),
      deletesAsModerator: live && !isMine && canManageMessages,
      canTimeoutAuthor: moderatable && teamPerms.can("timeout_members") && !!teamPerms.access?.customRoles,
      canKickAuthor: moderatable && teamPerms.can("manage_members"),
      canChangeAuthorRole: moderatable && teamPerms.can("manage_roles"),
      author,
      authorTimedOut: isTimedOut(author?.timedOutUntil),
      teamId: channel?.teamId,
    };
  }, [currentUserId, message, channel, members, team, can, teamPerms]);
}

/** Routes for the settings pages. */
export const settingsPath = {
  team: (teamId: string, section = "") => `/v2/workspace/teams/${teamId}/settings${section ? `/${section}` : ""}`,
  role: (teamId: string, roleId: string) => `/v2/workspace/teams/${teamId}/settings/roles/${roleId}`,
  channel: (teamId: string, channelId: string) => `/v2/workspace/teams/${teamId}/settings/channels/${channelId}`,
  member: (teamId: string, email: string) =>
    `/v2/workspace/teams/${teamId}/settings/members?member=${encodeURIComponent(email)}`,
};
