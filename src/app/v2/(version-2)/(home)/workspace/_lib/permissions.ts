// ============================================================================
// Workspace Permissions Engine — Discord & OpenFGA-inspired RBAC / Zanzibar
// ============================================================================

import type {
  Channel,
  MemberRole,
  ChannelPermissionKey,
  ChannelPermissions,
  ChannelRolePermissionOverrides,
  OpenFGATuple,
  TeamMember,
  DirectMessage,
} from "./chat-types";
import { useChatStore } from "./chat-store";

// ── Default permission values for @everyone ──

export const DEFAULT_CHANNEL_PERMISSIONS: ChannelPermissions = {
  send_messages: true,
  send_media: true,
  send_gifs: true,
  create_polls: true,
  add_reactions: true,
  use_emojis: true,
  reply_threads: true,
  mention_everyone: false, // only moderators and admins by default
  embed_links: true,
  read_history: true,
  connect_voice: true,
  speak_voice: true,
  start_calls: true,
  share_screen: true,
  video_camera: true,
  mute_participants: false, // only moderators and admins
  create_channels: true,
  manage_channel: false,
  manage_messages: false,
  manage_integrations: false,
  view_audit_logs: false,
};

// ── OpenFGA Zanzibar Role Hierarchy ──
// Higher roles implicitly inherit lower role capabilities

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 100,
  admin: 80,
  moderator: 60,
  member: 40,
  guest: 20,
};

// ── Permission Metadata for Discord-Style UI ──

export const PERMISSION_METADATA: Record<
  ChannelPermissionKey,
  {
    name: string;
    description: string;
    category: "text" | "voice" | "management";
    fgaRelation: string;
  }
> = {
  send_messages: {
    name: "Send Messages",
    description: "Allows members to send text messages in this channel.",
    category: "text",
    fgaRelation: "can_post",
  },
  send_media: {
    name: "Attach Files, Photos & Videos",
    description: "Allows uploading and sharing files, screenshots, and videos.",
    category: "text",
    fgaRelation: "can_attach_files",
  },
  send_gifs: {
    name: "Send GIFs",
    description: "Allows posting animated GIFs from Tenor or Giphy in chat.",
    category: "text",
    fgaRelation: "can_send_gifs",
  },
  create_polls: {
    name: "Create Polls",
    description: "Allows launching single or multiple-choice polls in this channel.",
    category: "text",
    fgaRelation: "can_create_polls",
  },
  add_reactions: {
    name: "Add Reactions",
    description: "Allows adding emoji reactions to messages.",
    category: "text",
    fgaRelation: "can_add_reactions",
  },
  use_emojis: {
    name: "Use Emojis & Stickers",
    description: "Allows using emoji picker and custom reactions.",
    category: "text",
    fgaRelation: "can_use_emojis",
  },
  reply_threads: {
    name: "Reply & Create Threads",
    description: "Allows starting conversation branches and inline replies.",
    category: "text",
    fgaRelation: "can_reply_threads",
  },
  mention_everyone: {
    name: "Mention @everyone & @channel",
    description: "Allows broadcast notifications that alert all channel members.",
    category: "text",
    fgaRelation: "can_mention_everyone",
  },
  embed_links: {
    name: "Embed Links",
    description: "Allows posted URLs to expand rich website cards and previews.",
    category: "text",
    fgaRelation: "can_embed_links",
  },
  read_history: {
    name: "Read Message History",
    description: "Allows viewing messages sent before joining this channel.",
    category: "text",
    fgaRelation: "can_read_history",
  },
  connect_voice: {
    name: "Connect to Voice",
    description: "Allows joining voice spaces and listening.",
    category: "voice",
    fgaRelation: "can_connect_voice",
  },
  speak_voice: {
    name: "Speak in Voice",
    description: "Allows unmuting and speaking in voice spaces and live rooms.",
    category: "voice",
    fgaRelation: "can_speak_voice",
  },
  start_calls: {
    name: "Start Video & Audio Calls",
    description: "Allows initiating live WebRTC video or audio calls in channel.",
    category: "voice",
    fgaRelation: "can_start_calls",
  },
  share_screen: {
    name: "Share Screen",
    description: "Allows broadcasting desktop or app windows during meetings.",
    category: "voice",
    fgaRelation: "can_share_screen",
  },
  video_camera: {
    name: "Broadcast Camera",
    description: "Allows streaming webcam video in calls and meetings.",
    category: "voice",
    fgaRelation: "can_use_video",
  },
  mute_participants: {
    name: "Mute Participants",
    description: "Allows muting other members in voice channels and calls.",
    category: "voice",
    fgaRelation: "can_mute_members",
  },
  create_channels: {
    name: "Create Channels",
    description: "Allows creating new public or private channels in the team.",
    category: "management",
    fgaRelation: "can_create_channels",
  },
  manage_channel: {
    name: "Manage Channel",
    description: "Allows editing channel name, topic, settings, or locking it.",
    category: "management",
    fgaRelation: "can_manage_channel",
  },
  manage_messages: {
    name: "Manage Messages",
    description: "Allows pinning, deleting, or moderating other members' messages.",
    category: "management",
    fgaRelation: "can_moderate_messages",
  },
  manage_integrations: {
    name: "Manage Webhooks & Bots",
    description: "Allows configuring automated webhooks, bots, and workflows.",
    category: "management",
    fgaRelation: "can_manage_integrations",
  },
  view_audit_logs: {
    name: "View Audit Logs",
    description: "Allows inspecting security events, role changes, and member logs.",
    category: "management",
    fgaRelation: "can_view_audit_logs",
  },
};

// ── Check if user has permission in a channel ──

export function canUserPerformInChannel(
  channel: Channel | undefined | null,
  userEmail: string | undefined | null,
  userRole: MemberRole = "member",
  permission: ChannelPermissionKey,
): boolean {
  if (!channel) return false;

  // 1. Channel Locked: MEETINGS & CALLS are completely disabled in locked channels
  if (
    channel.isLocked &&
    (permission === "start_calls" ||
      permission === "connect_voice" ||
      permission === "share_screen" ||
      permission === "video_camera" ||
      permission === "speak_voice")
  ) {
    return false;
  }

  // 2. Team Owners and Admins bypass other channel-level restrictions
  if (userRole === "owner" || userRole === "admin") return true;

  // 3. Channel Locked enforcement for other actions (messages, media, etc.)
  if (channel.isLocked) {
    // In locked channels, only owners, admins, and moderators can post / react / send media
    if (userRole !== "moderator") {
      return false;
    }
  }

  // 4. Meeting permission explicitly checked (if start_calls is turned off for this channel)
  if (permission === "start_calls") {
    if (channel.permissions && channel.permissions.start_calls === false) {
      return false;
    }
  }

  // 5. Channel Posting Permission policy
  if (channel.postingPermission === "admins_only" || channel.type === "announcement") {
    if (
      permission === "send_messages" ||
      permission === "send_media" ||
      permission === "send_gifs" ||
      permission === "create_polls" ||
      permission === "reply_threads"
    ) {
      if (userRole !== "moderator") {
        return false;
      }
    }
  }

  // 4. Role-specific overrides in this channel (Discord-style role overrides)
  if (channel.rolePermissions && channel.rolePermissions[userRole]) {
    const roleOverride = channel.rolePermissions[userRole]![permission];
    if (typeof roleOverride === "boolean") {
      return roleOverride;
    }
  }

  // 5. Channel-level default permissions (@everyone overrides)
  if (channel.permissions && typeof channel.permissions[permission] === "boolean") {
    return channel.permissions[permission]!;
  }

  // 6. Default fallbacks based on role
  switch (permission) {
    case "mention_everyone":
    case "manage_channel":
    case "manage_messages":
    case "mute_participants":
    case "manage_integrations":
    case "view_audit_logs":
      return userRole === "moderator";
    case "create_channels":
    case "share_screen":
    case "video_camera":
      return userRole !== "guest";
    default:
      return true; // regular members can send messages, media, gifs, polls, reactions, emojis, voice by default
  }
}

// ── Helper to resolve the user's role in a team ──

export function getUserRoleInTeam(
  members: TeamMember[],
  teamId: string | null | undefined,
  userEmail: string | null | undefined,
): MemberRole {
  if (!userEmail || !teamId) return "guest";
  const member = members.find(
    (m) =>
      m.teamId === teamId &&
      (m.email?.toLowerCase() === userEmail.toLowerCase() || m.userId === userEmail),
  );
  return member?.role ?? "member";
}

// ── OpenFGA Tuple Serialization Helpers ──

export function channelPermissionsToFGATuples(
  channelId: string,
  permissions?: Partial<ChannelPermissions>,
  rolePermissions?: ChannelRolePermissionOverrides,
): OpenFGATuple[] {
  const tuples: OpenFGATuple[] = [];

  // Channel default (@everyone) tuples
  if (permissions) {
    for (const [key, allowed] of Object.entries(permissions)) {
      if (allowed !== undefined) {
        const meta = PERMISSION_METADATA[key as ChannelPermissionKey];
        if (meta) {
          tuples.push({
            objectType: "channel",
            objectId: channelId,
            relation: allowed ? meta.fgaRelation : `deny_${meta.fgaRelation}`,
            userEmail: "@everyone",
          });
        }
      }
    }
  }

  // Role-specific overrides
  if (rolePermissions) {
    for (const [role, perms] of Object.entries(rolePermissions)) {
      if (perms) {
        for (const [key, allowed] of Object.entries(perms)) {
          if (allowed !== undefined) {
            const meta = PERMISSION_METADATA[key as ChannelPermissionKey];
            if (meta) {
              tuples.push({
                objectType: "channel",
                objectId: channelId,
                relation: allowed ? meta.fgaRelation : `deny_${meta.fgaRelation}`,
                userEmail: `role:${role}`,
              });
            }
          }
        }
      }
    }
  }

  return tuples;
}

// ── Helper to resolve the other participant in a DM conversation ──

export function getDMPartner(
  dm: DirectMessage | undefined | null,
  currentUserId?: string | null,
): { userId: string; username: string; displayName: string; status: TeamMember["status"] } {
  if (!dm || !dm.participants || dm.participants.length === 0) {
    return {
      userId: "unknown",
      username: "user",
      displayName: "Direct Message",
      status: "offline",
    };
  }

  const me = (currentUserId || "").toLowerCase().trim();

  // Find a participant that is NOT me, NOT "u-self", and NOT "you"
  const partner =
    dm.participants.find((p) => {
      const uId = (p.userId || "").toLowerCase().trim();
      const uName = (p.username || "").toLowerCase().trim();
      const dName = (p.displayName || "").toLowerCase().trim();
      if (me && uId === me) return false;
      if (uId === "u-self") return false;
      if (uName === "you" || dName === "you") return false;
      return true;
    }) ??
    dm.participants.find((p) => {
      const uId = (p.userId || "").toLowerCase().trim();
      if (me && uId === me) return false;
      if (uId === "u-self") return false;
      return true;
    }) ??
    dm.participants.find((p) => {
      const uId = (p.userId || "").toLowerCase().trim();
      if (me && uId === me) return false;
      return true;
    }) ??
    dm.participants[0];

  return partner;
}
