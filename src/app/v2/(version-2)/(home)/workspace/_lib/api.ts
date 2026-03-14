// ============================================================================
// Workspace API Service — typed fetch layer for the Go workspace server
// ============================================================================

import type {
  Team,
  Channel,
  TeamMember,
  ChatMessage,
  DirectMessage,
  Poll,
  PollOption,
} from "./chat-types"

const BASE = (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__?.WORKSPACE_API_URL) || process.env.WORKSPACE_API_URL || "http://localhost:8090"

// ── Types mirroring Go models.PaginatedResponse ──

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CursorPaginatedResponse<T> {
  items: T[]
  next_cursor: string
  has_more: boolean
  limit: number
}

export interface APIResponse<T> {
  success: boolean
  result: T | null
  message: string
  error?: string
}

// ── Server-shape types (matching Go JSON) ──

export interface ServerMessage {
  id: string
  channel_id: string
  sender_email: string
  sender_name?: string
  content: string
  type: string
  priority: string
  parent_id?: string
  is_pinned: boolean
  is_edited: boolean
  is_deleted: boolean
  mentions: string[]
  reactions: { emoji: string; count: number; users: string[] }[]
  attachments: { id: string; message_id: string; file_name: string; file_url: string; file_type?: string; file_size: number; created_at: string }[]
  reply_count: number
  created_at: string
  updated_at: string
}

export interface ServerTeam {
  id: string
  name: string
  description?: string
  logo_url?: string
  owner_email: string
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface ServerChannel {
  id: string
  team_id: string
  name: string
  description?: string
  type: string
  visibility: string
  is_default: boolean
  is_locked: boolean
  created_by?: string
  created_at: string
  updated_at: string
  unread_count: number
}

export interface ServerMember {
  id: string
  team_id: string
  email: string
  role: string
  display_name?: string
  status: string
  custom_status?: string
  joined_at: string
  account_name?: string
}

export interface ServerDMConversation {
  id: string
  participants: { email: string; display_name?: string; status: string; account_name?: string }[]
  last_message?: ServerDMMessage
  unread_count: number
  created_at: string
  updated_at: string
}

export interface ServerDMMessage {
  id: string
  conversation_id: string
  sender_email: string
  sender_name?: string
  content: string
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ServerPollOption {
  id: string
  poll_id: string
  text: string
  vote_count: number
  voters?: string[]
  position: number
}

export interface ServerPoll {
  id: string
  channel_id: string
  created_by: string
  creator_name?: string
  question: string
  is_multi_select: boolean
  is_anonymous: boolean
  is_closed: boolean
  expires_at?: string
  created_at: string
  updated_at: string
  options: ServerPollOption[]
  total_votes: number
}

export interface ServerAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type?: string
  file_size: number
  created_at: string
}

export interface ServerVoiceSession {
  id: string
  channel_id: string
  user_email: string
  joined_at: string
  left_at?: string
  is_muted: boolean
  is_deafened: boolean
  display_name?: string
}

// ── Generic fetch helper ──

async function apiFetch<T>(path: string, init?: RequestInit & { email?: string }): Promise<T> {
  const email = init?.email ?? ""
  const { email: _, ...fetchInit } = init ?? {}
  const res = await fetch(`${BASE}${path}`, {
    ...fetchInit,
    headers: {
      "Content-Type": "application/json",
      "X-User-Email": email,
      ...(fetchInit?.headers ?? {}),
    },
  })
  const json: APIResponse<T> = await res.json()
  if (!json.success) throw new Error(json.error ?? json.message ?? "unknown error")
  return json.result as T
}

// ── Transformers: server shape → client shape ──

export function toTeam(s: ServerTeam): Team {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? "",
    logo: s.logo_url ?? undefined,
    ownerId: s.owner_email,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export function toChannel(s: ServerChannel): Channel {
  return {
    id: s.id,
    teamId: s.team_id,
    name: s.name,
    description: s.description ?? "",
    type: s.type as Channel["type"],
    visibility: s.visibility as Channel["visibility"],
    isPinned: false,
    isDefault: s.is_default,
    isLocked: s.is_locked ?? false,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    unreadCount: s.unread_count ?? 0,
  }
}

export function toMember(s: ServerMember): TeamMember {
  return {
    id: s.id,
    userId: s.email,
    teamId: s.team_id,
    username: s.email.split("@")[0],
    displayName: s.display_name ?? s.account_name ?? s.email,
    email: s.email,
    role: s.role as TeamMember["role"],
    status: (s.status ?? "offline") as TeamMember["status"],
    customStatus: s.custom_status ?? undefined,
    joinedAt: s.joined_at,
  }
}

export function toMessage(s: ServerMessage): ChatMessage {
  return {
    id: s.id,
    channelId: s.channel_id,
    authorId: s.sender_email,
    authorName: s.sender_name ?? s.sender_email,
    content: s.content,
    type: s.type as ChatMessage["type"],
    priority: (s.priority ?? "normal") as ChatMessage["priority"],
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    isEdited: s.is_edited,
    isPinned: s.is_pinned,
    isPinnedPublic: false,
    mentions: s.mentions ?? [],
    reactions: (s.reactions ?? []).map(r => ({ emoji: r.emoji, count: r.count, userIds: r.users })),
    attachments: (s.attachments ?? []).map(a => ({
      id: a.id,
      name: a.file_name,
      url: a.file_url,
      mimeType: a.file_type ?? "application/octet-stream",
      size: a.file_size,
    })),
    threadReplyCount: s.reply_count ?? 0,
    isDeleted: s.is_deleted,
    replyTo: s.parent_id ? { messageId: s.parent_id, authorId: "", authorName: "", content: "" } : undefined,
  }
}

export function toDM(s: ServerDMConversation): DirectMessage {
  return {
    id: s.id,
    participantIds: s.participants.map(p => p.email),
    participants: s.participants.map(p => ({
      userId: p.email,
      username: p.email.split("@")[0],
      displayName: p.display_name ?? p.account_name ?? p.email,
      status: (p.status ?? "offline") as TeamMember["status"],
    })),
    lastMessage: undefined, // simplified — populated separately if needed
    unreadCount: s.unread_count ?? 0,
    updatedAt: s.updated_at,
  }
}

export function toPoll(s: ServerPoll): Poll {
  return {
    id: s.id,
    channelId: s.channel_id,
    createdBy: s.created_by,
    creatorName: s.creator_name,
    question: s.question,
    isMultiSelect: s.is_multi_select,
    isAnonymous: s.is_anonymous,
    isClosed: s.is_closed,
    expiresAt: s.expires_at,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    options: (s.options ?? []).map(o => ({
      id: o.id,
      pollId: o.poll_id,
      text: o.text,
      voteCount: o.vote_count,
      voters: o.voters,
      position: o.position,
    })),
    totalVotes: s.total_votes,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API Methods
// ═══════════════════════════════════════════════════════════════════════════

export const workspaceApi = {
  // ── Teams ──
  listTeams: (email: string) =>
    apiFetch<ServerTeam[]>("/api/v1/teams", { email }),

  getTeam: (teamId: string, email: string) =>
    apiFetch<ServerTeam>(`/api/v1/teams/${teamId}`, { email }),

  createTeam: (data: { name: string; description?: string; is_private?: boolean }, email: string) =>
    apiFetch<ServerTeam>("/api/v1/teams", { method: "POST", body: JSON.stringify(data), email }),

  updateTeam: (teamId: string, fields: Record<string, unknown>, email: string) =>
    apiFetch<ServerTeam>(`/api/v1/teams/${teamId}`, { method: "PUT", body: JSON.stringify(fields), email }),

  deleteTeam: (teamId: string, email: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/teams/${teamId}`, { method: "DELETE", email }),

  // ── Channels ──
  listChannels: (teamId: string, email: string) =>
    apiFetch<ServerChannel[]>(`/api/v1/teams/${teamId}/channels`, { email }),

  getChannel: (channelId: string, email: string) =>
    apiFetch<ServerChannel>(`/api/v1/channels/${channelId}`, { email }),

  createChannel: (teamId: string, data: { name: string; type: string; visibility: string; description?: string }, email: string) =>
    apiFetch<ServerChannel>(`/api/v1/teams/${teamId}/channels`, { method: "POST", body: JSON.stringify(data), email }),

  updateChannel: (channelId: string, fields: Record<string, unknown>, email: string) =>
    apiFetch<ServerChannel>(`/api/v1/channels/${channelId}`, { method: "PUT", body: JSON.stringify(fields), email }),

  deleteChannel: (channelId: string, email: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/channels/${channelId}`, { method: "DELETE", email }),

  // ── Messages ──
  listMessages: (channelId: string, email: string, limit = 100, cursor?: string) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set("cursor", cursor)
    return apiFetch<CursorPaginatedResponse<ServerMessage>>(`/api/v1/channels/${channelId}/messages?${params}`, { email })
  },

  sendMessage: (channelId: string, data: { content: string; type?: string; priority?: string; parent_id?: string; mentions?: string[] }, email: string) =>
    apiFetch<ServerMessage>(`/api/v1/channels/${channelId}/messages`, { method: "POST", body: JSON.stringify(data), email }),

  editMessage: (messageId: string, content: string, email: string) =>
    apiFetch<ServerMessage>(`/api/v1/messages/${messageId}`, { method: "PUT", body: JSON.stringify({ content }), email }),

  deleteMessage: (messageId: string, email: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/messages/${messageId}`, { method: "DELETE", email }),

  pinMessage: (messageId: string, pin: boolean, email: string) =>
    apiFetch<{ pinned: boolean }>(`/api/v1/messages/${messageId}/pin`, { method: "PUT", body: JSON.stringify({ pin }), email }),

  addReaction: (messageId: string, emoji: string, email: string) =>
    apiFetch<{ added: boolean }>(`/api/v1/messages/${messageId}/reactions`, { method: "POST", body: JSON.stringify({ emoji }), email }),

  removeReaction: (messageId: string, emoji: string, email: string) =>
    apiFetch<{ removed: boolean }>(`/api/v1/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, { method: "DELETE", email }),

  getThread: (messageId: string, email: string) =>
    apiFetch<ServerMessage[]>(`/api/v1/messages/${messageId}/thread`, { email }),

  replyToThread: (messageId: string, data: { content: string; mentions?: string[] }, email: string) =>
    apiFetch<ServerMessage>(`/api/v1/messages/${messageId}/thread`, { method: "POST", body: JSON.stringify(data), email }),

  getPinnedMessages: (channelId: string, email: string) =>
    apiFetch<ServerMessage[]>(`/api/v1/channels/${channelId}/pinned`, { email }),

  // ── Members ──
  listMembers: (teamId: string, email: string) =>
    apiFetch<ServerMember[]>(`/api/v1/teams/${teamId}/members`, { email }),

  addMember: (teamId: string, data: { email: string; role: string }, actorEmail: string) =>
    apiFetch<ServerMember>(`/api/v1/teams/${teamId}/members`, { method: "POST", body: JSON.stringify(data), email: actorEmail }),

  changeMemberRole: (teamId: string, memberEmail: string, role: string, actorEmail: string) =>
    apiFetch<{ updated: boolean }>(`/api/v1/teams/${teamId}/members/${encodeURIComponent(memberEmail)}/role`, { method: "PUT", body: JSON.stringify({ role }), email: actorEmail }),

  removeMember: (teamId: string, memberEmail: string, actorEmail: string) =>
    apiFetch<{ removed: boolean }>(`/api/v1/teams/${teamId}/members/${encodeURIComponent(memberEmail)}`, { method: "DELETE", email: actorEmail }),

  updateMyStatus: (teamId: string, status: string, customStatus: string, email: string) =>
    apiFetch<{ updated: boolean }>(`/api/v1/teams/${teamId}/members/me/status`, { method: "PUT", body: JSON.stringify({ status, custom_status: customStatus }), email }),

  // ── Direct Messages ──
  listDMs: (email: string) =>
    apiFetch<ServerDMConversation[]>("/api/v1/dms", { email }),

  createDM: (participantEmail: string, email: string) =>
    apiFetch<ServerDMConversation>("/api/v1/dms", { method: "POST", body: JSON.stringify({ participant_email: participantEmail }), email }),

  getDM: (dmId: string, email: string) =>
    apiFetch<ServerDMConversation>(`/api/v1/dms/${dmId}`, { email }),

  listDMMessages: (dmId: string, email: string, page = 1, limit = 50) =>
    apiFetch<PaginatedResponse<ServerDMMessage>>(`/api/v1/dms/${dmId}/messages?page=${page}&limit=${limit}`, { email }),

  sendDMMessage: (dmId: string, content: string, email: string) =>
    apiFetch<ServerDMMessage>(`/api/v1/dms/${dmId}/messages`, { method: "POST", body: JSON.stringify({ content }), email }),

  // ── Events / Audit ──
  listEvents: (email: string, params?: { team_id?: string; action?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.team_id) q.set("team_id", params.team_id)
    if (params?.action) q.set("action", params.action)
    q.set("page", String(params?.page ?? 1))
    q.set("limit", String(params?.limit ?? 50))
    return apiFetch<PaginatedResponse<unknown>>(`/api/v1/events?${q}`, { email })
  },

  // ── Webhooks ──
  listWebhooks: (teamId: string, email: string) =>
    apiFetch<unknown[]>(`/api/v1/teams/${teamId}/webhooks`, { email }),

  createWebhook: (teamId: string, data: { name: string; url: string; events: string[]; secret?: string }, email: string) =>
    apiFetch<unknown>(`/api/v1/teams/${teamId}/webhooks`, { method: "POST", body: JSON.stringify(data), email }),

  deleteWebhook: (teamId: string, webhookId: string, email: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/teams/${teamId}/webhooks/${webhookId}`, { method: "DELETE", email }),

  // ── Channel Lock ──
  lockChannel: (channelId: string, locked: boolean, email: string) =>
    apiFetch<ServerChannel>(`/api/v1/channels/${channelId}/lock`, { method: "PUT", body: JSON.stringify({ locked }), email }),

  // ── Invitations ──
  listTeamInvitations: (teamId: string, email: string) =>
    apiFetch<unknown[]>(`/api/v1/teams/${teamId}/invitations`, { email }),

  createInvitation: (teamId: string, inviteeEmail: string, role: string, email: string) =>
    apiFetch<unknown>(`/api/v1/teams/${teamId}/invitations`, { method: "POST", body: JSON.stringify({ invitee_email: inviteeEmail, role }), email }),

  revokeInvitation: (teamId: string, invitationId: string, email: string) =>
    apiFetch<{ revoked: boolean }>(`/api/v1/teams/${teamId}/invitations/${invitationId}`, { method: "DELETE", email }),

  listMyInvitations: (email: string) =>
    apiFetch<unknown[]>("/api/v1/invitations", { email }),

  acceptInvitation: (token: string, email: string) =>
    apiFetch<{ accepted: boolean }>("/api/v1/invitations/accept", { method: "POST", body: JSON.stringify({ token }), email }),

  declineInvitation: (token: string, email: string) =>
    apiFetch<{ declined: boolean }>("/api/v1/invitations/decline", { method: "POST", body: JSON.stringify({ token }), email }),

  // ── Polls ──
  createPoll: (channelId: string, data: { question: string; options: string[]; is_multi_select: boolean; is_anonymous: boolean; expires_at?: string }, email: string) =>
    apiFetch<ServerPoll>(`/api/v1/channels/${channelId}/polls`, { method: "POST", body: JSON.stringify(data), email }),

  listChannelPolls: (channelId: string, email: string) =>
    apiFetch<ServerPoll[]>(`/api/v1/channels/${channelId}/polls`, { email }),

  getPoll: (pollId: string, email: string) =>
    apiFetch<{ poll: ServerPoll; my_votes: string[] }>(`/api/v1/polls/${pollId}`, { email }),

  votePoll: (pollId: string, optionIds: string[], email: string) =>
    apiFetch<ServerPoll>(`/api/v1/polls/${pollId}/vote`, { method: "POST", body: JSON.stringify({ option_ids: optionIds }), email }),

  closePoll: (pollId: string, email: string) =>
    apiFetch<{ closed: boolean }>(`/api/v1/polls/${pollId}/close`, { method: "PUT", email }),

  deletePoll: (pollId: string, email: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/polls/${pollId}`, { method: "DELETE", email }),

  // ── Attachments ──
  uploadAttachment: (messageId: string, file: File, email: string) => {
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${BASE}/api/v1/messages/${messageId}/attachments`, {
      method: "POST",
      headers: { "X-User-Email": email },
      body: formData,
    }).then(async (res) => {
      const json: APIResponse<ServerAttachment> = await res.json()
      if (!json.success) throw new Error(json.error ?? json.message)
      return json.result!
    })
  },

  uploadAttachmentBase64: (messageId: string, fileName: string, fileType: string, base64Data: string, email: string) =>
    apiFetch<ServerAttachment>(`/api/v1/messages/${messageId}/attachments`, {
      method: "POST",
      body: JSON.stringify({ file_name: fileName, file_type: fileType, data: base64Data }),
      email,
    }),

  getAttachmentUrl: (attachmentId: string) =>
    `${BASE}/api/v1/attachments/${attachmentId}`,

  // ── Voice Channels ──
  joinVoice: (channelId: string, email: string) =>
    apiFetch<{ session: ServerVoiceSession; participants: ServerVoiceSession[] }>(`/api/v1/channels/${channelId}/voice/join`, { method: "POST", email }),

  leaveVoice: (channelId: string, email: string) =>
    apiFetch<{ left: boolean }>(`/api/v1/channels/${channelId}/voice/leave`, { method: "POST", email }),

  voiceParticipants: (channelId: string, email: string) =>
    apiFetch<ServerVoiceSession[]>(`/api/v1/channels/${channelId}/voice/participants`, { email }),

  voiceSignal: (channelId: string, toEmail: string, signalType: string, payload: unknown, email: string) =>
    apiFetch<{ sent: boolean }>(`/api/v1/channels/${channelId}/voice/signal`, {
      method: "POST",
      body: JSON.stringify({ to_email: toEmail, signal_type: signalType, payload }),
      email,
    }),

  voiceMute: (channelId: string, isMuted: boolean, isDeafened: boolean, email: string) =>
    apiFetch<{ updated: boolean }>(`/api/v1/channels/${channelId}/voice/mute`, {
      method: "PUT",
      body: JSON.stringify({ is_muted: isMuted, is_deafened: isDeafened }),
      email,
    }),
}

export default workspaceApi
