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

// The workspace server (../workspace-server, internal/permissions/channel.go)
// is the single source of truth: it stores the toggles users switch here as
// OpenFGA tuples, applies the defaults (everything enabled for the roles
// entitled to it), enforces them, and returns the resolved result on every
// channel as `effectivePermissions`. This module holds UI metadata (labels)
// and reads that result — it decides nothing itself. Defaults come from the
// server catalog (see permission-catalog.ts).

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

/**
 * Whether `userRole` may perform `permission` in `channel`.
 *
 * The answer is computed by the workspace server (OpenFGA tuples + lock /
 * announcement / posting policy) and delivered as `channel.effectivePermissions`.
 * The server also enforces every action, so when no server data is present
 * yet (channel still loading) the UI stays permissive and the server has the
 * final say.
 */
export function canUserPerformInChannel(
  channel: Channel | undefined | null,
  userEmail: string | undefined | null,
  userRole: MemberRole = "member",
  permission: ChannelPermissionKey,
): boolean {
  if (!channel) return false;
  const resolved = channel.effectivePermissions?.[userRole]?.[permission];
  return typeof resolved === "boolean" ? resolved : true;
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
