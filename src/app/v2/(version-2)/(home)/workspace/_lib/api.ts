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
  Meeting,
  CallRecord,
  LiveCallParticipant,
  WorkspaceFile,
  ChatTask,
  Role,
  TeamAccess,
  ChannelOverwrite,
  PermissionCatalog,
  CatalogPermission,
  PermissionKey,
  MemberRole,
} from "./chat-types"

export function getWorkspaceApiUrl(): string {
  let url = "";
  if (typeof window !== "undefined") {
    if ((window as any).__RUNTIME_CONFIG__?.WORKSPACE_API_URL) {
      url = (window as any).__RUNTIME_CONFIG__.WORKSPACE_API_URL;
    }
  }
  if (!url) {
    url =
      process.env.NEXT_PUBLIC_WORKSPACE_API_URL ||
      process.env.WORKSPACE_API_URL ||
      "http://localhost:8090";
  }

  // Normalize: remove trailing slash
  url = url.trim().replace(/\/+$/, "");

  // In browser: if the page is loaded over HTTPS, upgrade any http:// or // to https://
  // to prevent Mixed Content security blocking.
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (url.startsWith("http://")) {
      url = url.replace(/^http:\/\//, "https://");
    } else if (url.startsWith("//")) {
      url = `https:${url}`;
    }
  }

  return url;
}

export function getWorkspaceWsUrl(): string {
  const apiUrl = getWorkspaceApiUrl();
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

  let wsUrl = apiUrl.trim().replace(/\/+$/, "");

  if (wsUrl.startsWith("https://")) {
    wsUrl = wsUrl.replace(/^https:\/\//, "wss://");
  } else if (wsUrl.startsWith("http://")) {
    // Insecure WebSockets (ws://) are strictly blocked from HTTPS pages by modern browsers
    wsUrl = wsUrl.replace(/^http:\/\//, isHttps ? "wss://" : "ws://");
  } else if (wsUrl.startsWith("ws://") && isHttps) {
    wsUrl = wsUrl.replace(/^ws:\/\//, "wss://");
  } else if (wsUrl.startsWith("//")) {
    wsUrl = `${isHttps ? "wss:" : "ws:"}${wsUrl}`;
  } else if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
    wsUrl = `${isHttps ? "wss://" : "ws://"}${wsUrl}`;
  }

  return wsUrl.replace(/\/+$/, "");
}

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
  topic?: string
  type: string
  visibility: string
  posting_permission?: string
  is_default: boolean
  is_locked: boolean
  is_archived?: boolean
  permissions?: any
  role_permissions?: any
  effective_permissions?: any
  my_permissions?: Record<string, boolean>
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
  role_id?: string
  role_name?: string
  role_color?: string
  role_position?: number
  timed_out_until?: string
}

export interface ServerRole {
  id: string
  team_id: string
  name: string
  color?: string
  position: number
  system_key?: string
  administrator: boolean
  permissions: string[]
  customized: boolean
  member_count: number
  created_at: string
  updated_at: string
}

export interface ServerTeamAccess {
  team_id: string
  mode: "legacy" | "shadow" | "enforce"
  owner: boolean
  role_id?: string
  role: string
  position: number
  administrator: boolean
  permissions: string[]
  custom_roles: boolean
  timed_out_until?: string
}

export interface ServerOverwrite {
  id: string
  channel_id: string
  target_type: "everyone" | "role" | "user"
  target_id: string
  target_name?: string
  allow: string[]
  deny: string[]
  source: "legacy" | "api"
  updated_by?: string
  updated_at: string
}

export interface ServerAuthzCatalog {
  permissions: { key: string; category: string; scope: string; min_role: string }[]
  system_roles: { name: string; position: number; administrator: boolean; permissions: string[] }[]
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

export interface ServerMeetingAttendee {
  id: string
  meeting_id: string
  user_email: string
  display_name?: string
  status: "accepted" | "declined" | "tentative" | "pending"
  is_organizer: boolean
  responded_at?: string
}

export interface ServerMeeting {
  id: string
  title: string
  description?: string
  team_id: string
  channel_id?: string
  channel_name?: string
  organizer_email: string
  organizer_name?: string
  start_time: string
  end_time: string
  is_online: boolean
  meeting_url: string
  passcode?: string
  status: "scheduled" | "live" | "completed" | "cancelled"
  attendees?: ServerMeetingAttendee[]
  created_at: string
  updated_at: string
}

export interface ServerCallRecord {
  id: string
  caller_email: string
  caller_name?: string
  receiver_email: string
  receiver_name?: string
  call_type: "video" | "audio"
  direction: "incoming" | "outgoing" | "missed"
  duration_seconds: number
  team_id?: string
  created_at: string
}

export interface ServerCallRoomParticipant {
  id: string
  call_id: string
  user_email: string
  display_name: string
  is_muted: boolean
  is_camera_off: boolean
  is_screen_sharing: boolean
  is_hand_raised: boolean
  role: "host" | "presenter" | "attendee"
  joined_at: string
  left_at?: string
}

export interface ServerTask {
  id: string
  team_id: string
  channel_id?: string
  channel_name?: string
  title: string
  description?: string
  assignee_email?: string
  assignee_name?: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  due_date?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ServerWorkspaceFile {
  id: string
  name: string
  size: number
  mime_type: string
  extension: string
  category: "document" | "spreadsheet" | "presentation" | "media" | "code" | "archive" | "other"
  uploader_email: string
  uploader_name?: string
  team_id: string
  channel_id?: string
  channel_name?: string
  url: string
  download_count: number
  created_at: string
  updated_at: string
}

export interface ServerNotification {
  id: string
  recipient_email: string
  type: string
  title: string
  body?: string
  source_id?: string
  source_type?: string
  is_read: boolean
  created_at: string
}

// ── UUID validation helper ──

export function isValidUUID(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim())
}

// ── Authentication ──
//
// The workspace server verifies the HS256 session JWT issued at login. It is
// read from the `access_token` cookie (sent automatically with
// credentials: "include" on *.airsend.in) or from `Authorization: Bearer`,
// which we add whenever the cookie is readable so cross-site setups work too.
// Identity comes from the token only — never from a header we set.

export function getAuthToken(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  if (match) return decodeURIComponent(match[1])
  try {
    return window.localStorage.getItem("access_token") ?? ""
  } catch {
    return ""
  }
}

/** Authorization header for requests that build their own headers (uploads). */
export function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Error from the workspace API, with the HTTP status and server code. */
export class WorkspaceApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "WorkspaceApiError"
    this.status = status
    this.code = code
  }
  get isForbidden() {
    return this.status === 403
  }
  get isUnauthorized() {
    return this.status === 401
  }
}

// ── Generic fetch helper ──

// `email` is accepted for call-site compatibility but no longer sent: the
// server derives the caller from the token.
async function apiFetch<T>(path: string, init?: RequestInit & { email?: string }): Promise<T> {
  const { email: _email, ...fetchInit } = init ?? {}
  const baseUrl = getWorkspaceApiUrl()
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const token = getAuthToken()
  const res = await fetch(`${baseUrl}${normalizedPath}`, {
    ...fetchInit,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchInit?.headers ?? {}),
    },
  })
  let json: APIResponse<T> & { code?: string }
  try {
    json = await res.json()
  } catch {
    throw new WorkspaceApiError(`HTTP ${res.status}: ${res.statusText}`, res.status)
  }
  if (!res.ok || !json.success) {
    throw new WorkspaceApiError(json.error ?? json.message ?? `HTTP ${res.status}`, res.status, json.code)
  }
  return json.result as T
}

/** Human-readable message for a failed call (403s get a clear permission message). */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof WorkspaceApiError) {
    if (err.status === 403) return "You don't have permission to do that."
    if (err.status === 401) return "Your session has expired. Please sign in again."
    if (err.status === 409 && /enforce/i.test(err.message)) {
      return "Custom roles are not enabled on this server yet."
    }
    return err.message || fallback
  }
  return (err as Error)?.message || fallback
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

// Channel fields the UI holds in camelCase but the server expects in snake_case.
// `effectivePermissions` is server-computed and never sent back.
const CHANNEL_FIELD_TO_SERVER: Record<string, string> = {
  postingPermission: "posting_permission",
  isLocked: "is_locked",
  isArchived: "is_archived",
  rolePermissions: "role_permissions",
}

export function toServerChannelFields(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (key === "effectivePermissions" || value === undefined) continue
    out[CHANNEL_FIELD_TO_SERVER[key] ?? key] = value
  }
  return out
}

export interface ServerPermissionCatalog {
  roles: string[]
  permissions: { key: string; relation: string; min_role: string }[]
  defaults: {
    everyone: Record<string, boolean>
    roles: Record<string, Record<string, boolean>>
  }
}

export function toChannel(s: ServerChannel): Channel {
  return {
    id: s.id,
    teamId: s.team_id,
    name: s.name,
    description: s.description ?? "",
    topic: s.topic,
    type: s.type as Channel["type"],
    visibility: s.visibility as Channel["visibility"],
    postingPermission: (s.posting_permission as any) ?? "everyone",
    isPinned: false,
    isDefault: s.is_default,
    isLocked: s.is_locked ?? false,
    isArchived: s.is_archived ?? false,
    permissions: s.permissions,
    rolePermissions: s.role_permissions,
    effectivePermissions: s.effective_permissions,
    myPermissions: s.my_permissions as Channel["myPermissions"],
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
    roleId: s.role_id,
    roleName: s.role_name,
    roleColor: s.role_color,
    rolePosition: s.role_position,
    timedOutUntil: s.timed_out_until,
    status: (s.status ?? "offline") as TeamMember["status"],
    customStatus: s.custom_status ?? undefined,
    joinedAt: s.joined_at,
  }
}

export function toRole(s: ServerRole): Role {
  return {
    id: s.id,
    teamId: s.team_id,
    name: s.name,
    color: s.color ?? undefined,
    position: s.position,
    systemKey: (s.system_key as Role["systemKey"]) ?? undefined,
    administrator: s.administrator,
    permissions: (s.permissions ?? []) as PermissionKey[],
    customized: s.customized,
    memberCount: s.member_count ?? 0,
  }
}

export function toTeamAccess(s: ServerTeamAccess): TeamAccess {
  return {
    teamId: s.team_id,
    mode: s.mode,
    owner: s.owner,
    roleId: s.role_id,
    role: s.role,
    position: s.position,
    administrator: s.administrator,
    permissions: (s.permissions ?? []) as PermissionKey[],
    customRoles: s.custom_roles,
    timedOutUntil: s.timed_out_until,
  }
}

export function toOverwrite(s: ServerOverwrite): ChannelOverwrite {
  return {
    id: s.id,
    channelId: s.channel_id,
    targetType: s.target_type,
    targetId: s.target_id,
    targetName: s.target_name ?? s.target_id,
    allow: (s.allow ?? []) as PermissionKey[],
    deny: (s.deny ?? []) as PermissionKey[],
    source: s.source,
    updatedBy: s.updated_by,
    updatedAt: s.updated_at,
  }
}

export function toPermissionCatalog(s: ServerAuthzCatalog): PermissionCatalog {
  return {
    permissions: s.permissions.map((p) => ({
      key: p.key as PermissionKey,
      category: p.category as CatalogPermission["category"],
      scope: p.scope as CatalogPermission["scope"],
      minRole: p.min_role as CatalogPermission["minRole"],
    })),
    systemRoles: s.system_roles.map((r) => ({
      name: r.name as MemberRole,
      position: r.position,
      administrator: r.administrator,
      permissions: (r.permissions ?? []) as PermissionKey[],
    })),
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

export function toMeeting(s: ServerMeeting): Meeting {
  if (!s) {
    return {
      id: "unknown",
      title: "Untitled Meeting",
      teamId: "",
      organizerId: "",
      organizerName: "Organizer",
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      isOnline: true,
      meetingUrl: "",
      status: "scheduled",
      attendees: [],
    };
  }

  const organizerEmail = s.organizer_email || (s as any).organizerEmail || (s as any).organizer_id || "";
  const organizerName =
    s.organizer_name ?? (s as any).organizerName ?? organizerEmail ?? "Organizer";
  const meetingUrl =
    s.meeting_url || (s as any).meetingUrl || (s.id ? `/v2/workspace/calls/${s.id}` : "");

  return {
    id: s.id || "",
    title: s.title || "Untitled Meeting",
    description: s.description,
    teamId: s.team_id || (s as any).teamId || "",
    channelId: s.channel_id || (s as any).channelId,
    channelName: s.channel_name || (s as any).channelName,
    organizerId: organizerEmail,
    organizerName,
    startTime: s.start_time || (s as any).startTime || new Date().toISOString(),
    endTime: s.end_time || (s as any).endTime || new Date().toISOString(),
    isOnline: s.is_online ?? (s as any).isOnline ?? true,
    meetingUrl,
    passcode: s.passcode,
    status: s.status || "scheduled",
    attendees: (s.attendees ?? []).map((a: any) => ({
      id: a?.id || a?.user_id || a?.email || a?.user_email || "",
      name:
        a?.display_name ??
        a?.displayName ??
        a?.name ??
        a?.username ??
        a?.user_email ??
        a?.email ??
        "Attendee",
      email: a?.user_email ?? a?.email ?? "",
      status: a?.status || "accepted",
      isOrganizer: a?.is_organizer ?? a?.isOrganizer ?? false,
    })),
  };
}

export function toCallRecord(s: ServerCallRecord): CallRecord {
  return {
    id: s.id,
    callerId: s.caller_email,
    callerName: s.caller_name ?? s.caller_email,
    receiverId: s.receiver_email,
    receiverName: s.receiver_name ?? s.receiver_email,
    type: s.call_type,
    direction: s.direction,
    duration: s.duration_seconds,
    timestamp: s.created_at,
    teamId: s.team_id,
  }
}

export function toLiveCallParticipant(s: ServerCallRoomParticipant): LiveCallParticipant {
  return {
    id: s.id,
    name: s.display_name,
    email: s.user_email,
    isAudioMuted: s.is_muted,
    isVideoOff: s.is_camera_off,
    isScreenSharing: s.is_screen_sharing,
    isHandRaised: s.is_hand_raised,
    isSpeaking: false,
    role: s.role,
  }
}

export function toWorkspaceFile(s: ServerWorkspaceFile): WorkspaceFile {
  return {
    id: s.id,
    name: s.name,
    size: s.size,
    mimeType: s.mime_type,
    extension: s.extension,
    category: s.category,
    uploadedBy: s.uploader_email,
    uploaderName: s.uploader_name ?? s.uploader_email,
    teamId: s.team_id,
    channelId: s.channel_id,
    channelName: s.channel_name,
    url: s.url,
    downloadCount: s.download_count,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }
}

export function toChatTask(s: ServerTask): ChatTask {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    assigneeId: s.assignee_email ?? "",
    teamId: s.team_id,
    channelId: s.channel_id,
    status: s.status,
    priority: s.priority,
    dueDate: s.due_date,
    createdAt: s.created_at,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API Methods
// ═══════════════════════════════════════════════════════════════════════════

export const workspaceApi = {
  // ── Teams ──
  listTeams: (email: string) => {
    if (!email) return Promise.resolve([])
    return apiFetch<ServerTeam[]>("/api/v1/teams", { email })
  },

  getTeam: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<ServerTeam>(`/api/v1/teams/${teamId}`, { email })
  },

  createTeam: (data: { name: string; description?: string; is_private?: boolean }, email: string) =>
    apiFetch<ServerTeam>("/api/v1/teams", { method: "POST", body: JSON.stringify(data), email }),

  updateTeam: (teamId: string, fields: Record<string, unknown>, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<ServerTeam>(`/api/v1/teams/${teamId}`, { method: "PUT", body: JSON.stringify(fields), email })
  },

  deleteTeam: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<{ deleted: boolean }>(`/api/v1/teams/${teamId}`, { method: "DELETE", email })
  },

  // ── Channels ──
  listChannels: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<ServerChannel[]>(`/api/v1/teams/${teamId}/channels`, { email })
  },

  getChannelPermissionCatalog: (email: string) =>
    apiFetch<ServerPermissionCatalog>(`/api/v1/channel-permissions/catalog`, { email }),

  getChannel: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<ServerChannel>(`/api/v1/channels/${channelId}`, { email })
  },

  createChannel: (teamId: string, data: { name: string; type: string; visibility: string; description?: string; posting_permission?: string; is_locked?: boolean; permissions?: any; role_permissions?: any }, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<ServerChannel>(`/api/v1/teams/${teamId}/channels`, { method: "POST", body: JSON.stringify(toServerChannelFields(data)), email })
  },

  updateChannel: (channelId: string, fields: Record<string, unknown>, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<ServerChannel>(`/api/v1/channels/${channelId}`, { method: "PUT", body: JSON.stringify(toServerChannelFields(fields)), email })
  },

  deleteChannel: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<{ deleted: boolean }>(`/api/v1/channels/${channelId}`, { method: "DELETE", email })
  },

  // ── Messages ──
  listMessages: (channelId: string, email: string, limit = 100, cursor?: string) => {
    if (!isValidUUID(channelId)) {
      return Promise.resolve({
        items: [] as ServerMessage[],
        next_cursor: "",
        has_more: false,
        limit,
      })
    }
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set("cursor", cursor)
    return apiFetch<CursorPaginatedResponse<ServerMessage>>(`/api/v1/channels/${channelId}/messages?${params}`, { email })
  },

  sendMessage: (channelId: string, data: { content: string; type?: string; priority?: string; parent_id?: string; mentions?: string[] }, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<ServerMessage>(`/api/v1/channels/${channelId}/messages`, { method: "POST", body: JSON.stringify(data), email })
  },

  editMessage: (messageId: string, content: string, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<ServerMessage>(`/api/v1/messages/${messageId}`, { method: "PUT", body: JSON.stringify({ content }), email })
  },

  deleteMessage: (messageId: string, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<{ deleted: boolean }>(`/api/v1/messages/${messageId}`, { method: "DELETE", email })
  },

  pinMessage: (messageId: string, pin: boolean, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<{ pinned: boolean }>(`/api/v1/messages/${messageId}/pin`, { method: "PUT", body: JSON.stringify({ pin }), email })
  },

  addReaction: (messageId: string, emoji: string, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<{ added: boolean }>(`/api/v1/messages/${messageId}/reactions`, { method: "POST", body: JSON.stringify({ emoji }), email })
  },

  removeReaction: (messageId: string, emoji: string, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<{ removed: boolean }>(`/api/v1/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, { method: "DELETE", email })
  },

  getThread: (messageId: string, email: string) => {
    if (!isValidUUID(messageId)) return Promise.resolve([])
    return apiFetch<ServerMessage[]>(`/api/v1/messages/${messageId}/thread`, { email })
  },

  replyToThread: (messageId: string, data: { content: string; mentions?: string[] }, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<ServerMessage>(`/api/v1/messages/${messageId}/thread`, { method: "POST", body: JSON.stringify(data), email })
  },

  getPinnedMessages: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve([])
    return apiFetch<ServerMessage[]>(`/api/v1/channels/${channelId}/pinned`, { email })
  },

  // ── Members ──
  listMembers: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<ServerMember[]>(`/api/v1/teams/${teamId}/members`, { email })
  },

  addMember: (teamId: string, data: { email: string; role: string }, actorEmail: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<ServerMember>(`/api/v1/teams/${teamId}/members`, { method: "POST", body: JSON.stringify(data), email: actorEmail })
  },

  changeMemberRole: (teamId: string, memberEmail: string, role: string, actorEmail: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<{ updated: boolean }>(`/api/v1/teams/${teamId}/members/${encodeURIComponent(memberEmail)}/role`, { method: "PUT", body: JSON.stringify({ role }), email: actorEmail })
  },

  // ── Access, roles, timeouts, channel overrides (OpenFGA) ──
  getMyTeamAccess: (teamId: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<ServerTeamAccess>(`/api/v1/teams/${teamId}/me/permissions`)
  },

  getAuthzCatalog: () => apiFetch<ServerAuthzCatalog>(`/api/v1/permissions/catalog`),

  listRoles: (teamId: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([] as ServerRole[])
    return apiFetch<ServerRole[] | null>(`/api/v1/teams/${teamId}/roles`).then((r) => r ?? [])
  },

  createRole: (teamId: string, data: { name: string; color?: string; permissions?: string[]; position?: number }) =>
    apiFetch<ServerRole>(`/api/v1/teams/${teamId}/roles`, { method: "POST", body: JSON.stringify(data) }),

  updateRole: (teamId: string, roleId: string, data: { name?: string; color?: string; permissions?: string[]; position?: number; administrator?: boolean }) =>
    apiFetch<ServerRole>(`/api/v1/teams/${teamId}/roles/${roleId}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteRole: (teamId: string, roleId: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/teams/${teamId}/roles/${roleId}`, { method: "DELETE" }),

  assignRole: (teamId: string, memberEmail: string, roleId: string) =>
    apiFetch<{ updated: boolean }>(`/api/v1/teams/${teamId}/members/${encodeURIComponent(memberEmail)}/role`, { method: "PUT", body: JSON.stringify({ role_id: roleId }) }),

  /** minutes = 0 clears the timeout. */
  timeoutMember: (teamId: string, memberEmail: string, minutes: number, reason?: string) =>
    apiFetch<{ timed_out_until: string | null }>(`/api/v1/teams/${teamId}/members/${encodeURIComponent(memberEmail)}/timeout`, { method: "PUT", body: JSON.stringify({ minutes, reason: reason ?? "" }) }),

  listOverwrites: (channelId: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve([] as ServerOverwrite[])
    return apiFetch<ServerOverwrite[] | null>(`/api/v1/channels/${channelId}/overwrites`).then((r) => r ?? [])
  },

  /** Empty allow and deny remove the override. */
  setOverwrite: (channelId: string, data: { target_type: string; target_id: string; allow: string[]; deny: string[] }) =>
    apiFetch<{ updated: boolean }>(`/api/v1/channels/${channelId}/overwrites`, { method: "PUT", body: JSON.stringify(data) }),

  deleteOverwrite: (channelId: string, targetType: string, targetId: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/channels/${channelId}/overwrites/${targetType}/${encodeURIComponent(targetId)}`, { method: "DELETE" }),

  removeMember: (teamId: string, memberEmail: string, actorEmail: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<{ removed: boolean }>(`/api/v1/teams/${teamId}/members/${encodeURIComponent(memberEmail)}`, { method: "DELETE", email: actorEmail })
  },

  updateMyStatus: (teamId: string, status: string, customStatus: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve({ updated: false })
    return apiFetch<{ updated: boolean }>(`/api/v1/teams/${teamId}/members/me/status`, { method: "PUT", body: JSON.stringify({ status, custom_status: customStatus }), email })
  },

  // ── Direct Messages ──
  listDMs: (email: string) => {
    if (!email) return Promise.resolve([])
    return apiFetch<ServerDMConversation[]>("/api/v1/dms", { email })
  },

  createDM: (participantEmail: string, email: string) =>
    apiFetch<ServerDMConversation>("/api/v1/dms", { method: "POST", body: JSON.stringify({ participant_email: participantEmail }), email }),

  getDM: (dmId: string, email: string) => {
    if (!isValidUUID(dmId)) return Promise.reject(new Error("Invalid DM conversation UUID"))
    return apiFetch<ServerDMConversation>(`/api/v1/dms/${dmId}`, { email })
  },

  listDMMessages: (dmId: string, email: string, page = 1, limit = 50) => {
    if (!isValidUUID(dmId)) return Promise.resolve({ items: [], total: 0, page, limit, total_pages: 0 })
    return apiFetch<PaginatedResponse<ServerDMMessage>>(`/api/v1/dms/${dmId}/messages?page=${page}&limit=${limit}`, { email })
  },

  sendDMMessage: (dmId: string, content: string, email: string) => {
    if (!isValidUUID(dmId)) return Promise.reject(new Error("Invalid DM conversation UUID"))
    return apiFetch<ServerDMMessage>(`/api/v1/dms/${dmId}/messages`, { method: "POST", body: JSON.stringify({ content }), email })
  },

  // ── Events / Audit ──
  listEvents: (email: string, params?: { team_id?: string; action?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.team_id && isValidUUID(params.team_id)) q.set("team_id", params.team_id)
    if (params?.action) q.set("action", params.action)
    q.set("page", String(params?.page ?? 1))
    q.set("limit", String(params?.limit ?? 50))
    return apiFetch<PaginatedResponse<unknown>>(`/api/v1/events?${q}`, { email })
  },

  // ── Webhooks ──
  listWebhooks: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<unknown[]>(`/api/v1/teams/${teamId}/webhooks`, { email })
  },

  createWebhook: (teamId: string, data: { name: string; url: string; events: string[]; secret?: string }, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<unknown>(`/api/v1/teams/${teamId}/webhooks`, { method: "POST", body: JSON.stringify(data), email })
  },

  deleteWebhook: (teamId: string, webhookId: string, email: string) => {
    if (!isValidUUID(teamId) || !isValidUUID(webhookId)) return Promise.resolve({ deleted: false })
    return apiFetch<{ deleted: boolean }>(`/api/v1/teams/${teamId}/webhooks/${webhookId}`, { method: "DELETE", email })
  },

  // ── Channel Lock ──
  lockChannel: (channelId: string, locked: boolean, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<ServerChannel>(`/api/v1/channels/${channelId}/lock`, { method: "PUT", body: JSON.stringify({ locked }), email })
  },

  // ── Invitations ──
  listTeamInvitations: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<unknown[]>(`/api/v1/teams/${teamId}/invitations`, { email })
  },

  createInvitation: (teamId: string, inviteeEmail: string, role: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<unknown>(`/api/v1/teams/${teamId}/invitations`, { method: "POST", body: JSON.stringify({ invitee_email: inviteeEmail, role }), email })
  },

  revokeInvitation: (teamId: string, invitationId: string, email: string) => {
    if (!isValidUUID(teamId) || !isValidUUID(invitationId)) return Promise.resolve({ revoked: false })
    return apiFetch<{ revoked: boolean }>(`/api/v1/teams/${teamId}/invitations/${invitationId}`, { method: "DELETE", email })
  },

  listMyInvitations: (email: string) => {
    if (!email) return Promise.resolve([])
    return apiFetch<unknown[]>("/api/v1/invitations", { email })
  },

  acceptInvitation: (token: string, email: string) =>
    apiFetch<{ accepted: boolean }>("/api/v1/invitations/accept", { method: "POST", body: JSON.stringify({ token }), email }),

  declineInvitation: (token: string, email: string) =>
    apiFetch<{ declined: boolean }>("/api/v1/invitations/decline", { method: "POST", body: JSON.stringify({ token }), email }),

  // ── Polls ──
  createPoll: (channelId: string, data: { question: string; options: string[]; is_multi_select: boolean; is_anonymous: boolean; expires_at?: string }, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<ServerPoll>(`/api/v1/channels/${channelId}/polls`, { method: "POST", body: JSON.stringify(data), email })
  },

  listChannelPolls: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve([])
    return apiFetch<ServerPoll[]>(`/api/v1/channels/${channelId}/polls`, { email })
  },

  getPoll: (pollId: string, email: string) => {
    if (!isValidUUID(pollId)) return Promise.reject(new Error("Invalid poll UUID"))
    return apiFetch<{ poll: ServerPoll; my_votes: string[] }>(`/api/v1/polls/${pollId}`, { email })
  },

  votePoll: (pollId: string, optionIds: string[], email: string) => {
    if (!isValidUUID(pollId)) return Promise.reject(new Error("Invalid poll UUID"))
    return apiFetch<ServerPoll>(`/api/v1/polls/${pollId}/vote`, { method: "POST", body: JSON.stringify({ option_ids: optionIds }), email })
  },

  closePoll: (pollId: string, email: string) => {
    if (!isValidUUID(pollId)) return Promise.resolve({ closed: false })
    return apiFetch<{ closed: boolean }>(`/api/v1/polls/${pollId}/close`, { method: "PUT", email })
  },

  deletePoll: (pollId: string, email: string) => {
    if (!isValidUUID(pollId)) return Promise.resolve({ deleted: false })
    return apiFetch<{ deleted: boolean }>(`/api/v1/polls/${pollId}`, { method: "DELETE", email })
  },

  // ── Attachments ──
  uploadAttachment: (messageId: string, file: File, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${getWorkspaceApiUrl()}/api/v1/messages/${messageId}/attachments`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
      body: formData,
    }).then(async (res) => {
      const json: APIResponse<ServerAttachment> = await res.json()
      if (!json.success) throw new Error(json.error ?? json.message)
      return json.result!
    })
  },

  uploadAttachmentBase64: (messageId: string, fileName: string, fileType: string, base64Data: string, email: string) => {
    if (!isValidUUID(messageId)) return Promise.reject(new Error("Invalid message UUID"))
    return apiFetch<ServerAttachment>(`/api/v1/messages/${messageId}/attachments`, {
      method: "POST",
      body: JSON.stringify({ file_name: fileName, file_type: fileType, data: base64Data }),
      email,
    })
  },

  getAttachmentUrl: (attachmentId: string) =>
    `${getWorkspaceApiUrl()}/api/v1/attachments/${attachmentId}`,

  // ── Voice Channels ──
  joinVoice: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.reject(new Error("Invalid channel UUID"))
    return apiFetch<{ session: ServerVoiceSession; participants: ServerVoiceSession[] }>(`/api/v1/channels/${channelId}/voice/join`, { method: "POST", email })
  },

  leaveVoice: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve({ left: false })
    return apiFetch<{ left: boolean }>(`/api/v1/channels/${channelId}/voice/leave`, { method: "POST", email })
  },

  voiceParticipants: (channelId: string, email: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve([])
    return apiFetch<ServerVoiceSession[]>(`/api/v1/channels/${channelId}/voice/participants`, { email })
  },

  voiceSignal: (channelId: string, toEmail: string, signalType: string, payload: unknown, email: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve({ sent: false })
    return apiFetch<{ sent: boolean }>(`/api/v1/channels/${channelId}/voice/signal`, {
      method: "POST",
      body: JSON.stringify({ to_email: toEmail, signal_type: signalType, payload }),
      email,
    })
  },

  voiceMute: (channelId: string, isMuted: boolean, isDeafened: boolean, email: string) => {
    if (!isValidUUID(channelId)) return Promise.resolve({ updated: false })
    return apiFetch<{ updated: boolean }>(`/api/v1/channels/${channelId}/voice/mute`, {
      method: "PUT",
      body: JSON.stringify({ is_muted: isMuted, is_deafened: isDeafened }),
      email,
    })
  },

  // ── Meetings & Calendar ──
  listTeamMeetings: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<ServerMeeting[]>(`/api/v1/teams/${teamId}/meetings`, { email })
  },

  listMyMeetings: (email: string) => {
    if (!email) return Promise.resolve([])
    return apiFetch<ServerMeeting[]>("/api/v1/meetings/my", { email })
  },

  createMeeting: (
    teamId: string | null,
    data: {
      title: string
      description?: string
      channel_id?: string
      start_time: string
      end_time: string
      is_online?: boolean
      meeting_url?: string
      passcode?: string
      attendee_emails?: string[]
    },
    email: string
  ) =>
    teamId && isValidUUID(teamId)
      ? apiFetch<ServerMeeting>(`/api/v1/teams/${teamId}/meetings`, {
          method: "POST",
          body: JSON.stringify(data),
          email,
        })
      : apiFetch<ServerMeeting>("/api/v1/meetings", {
          method: "POST",
          body: JSON.stringify(data),
          email,
        }),

  getMeeting: (meetingId: string, email: string) => {
    if (!isValidUUID(meetingId)) return Promise.reject(new Error("Invalid meeting UUID"))
    return apiFetch<ServerMeeting>(`/api/v1/meetings/${meetingId}`, { email })
  },

  updateMeetingStatus: (meetingId: string, status: string, email: string) => {
    if (!isValidUUID(meetingId)) return Promise.reject(new Error("Invalid meeting UUID"))
    return apiFetch<ServerMeeting>(`/api/v1/meetings/${meetingId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      email,
    })
  },

  respondMeeting: (meetingId: string, status: string, email: string) => {
    if (!isValidUUID(meetingId)) return Promise.resolve({ status })
    return apiFetch<{ status: string }>(`/api/v1/meetings/${meetingId}/respond`, {
      method: "POST",
      body: JSON.stringify({ status }),
      email,
    })
  },

  deleteMeeting: (meetingId: string, email: string) => {
    if (!isValidUUID(meetingId)) return Promise.resolve({ deleted: false })
    return apiFetch<{ deleted: boolean }>(`/api/v1/meetings/${meetingId}`, { method: "DELETE", email })
  },

  // ── Calls & WebRTC Signaling ──
  listCallHistory: (email: string, direction?: string) => {
    if (!email) return Promise.resolve([])
    return apiFetch<ServerCallRecord[]>(`/api/v1/calls/history${direction ? `?direction=${direction}` : ""}`, { email })
  },

  logCall: (
    data: {
      receiver_email: string
      call_type: string
      direction: string
      duration_seconds?: number
      team_id?: string
    },
    email: string
  ) =>
    apiFetch<ServerCallRecord>("/api/v1/calls/log", {
      method: "POST",
      body: JSON.stringify(data),
      email,
    }),

  joinCallRoom: (callId: string, displayName: string, role: string, email: string) => {
    if (!isValidUUID(callId)) return Promise.reject(new Error("Invalid call UUID"))
    return apiFetch<{ session: ServerCallRoomParticipant; participants: ServerCallRoomParticipant[] }>(
      `/api/v1/calls/${callId}/join`,
      {
        method: "POST",
        body: JSON.stringify({ display_name: displayName, role }),
        email,
      }
    )
  },

  leaveCallRoom: (callId: string, email: string) => {
    if (!isValidUUID(callId)) return Promise.resolve({ left: false })
    return apiFetch<{ left: boolean }>(`/api/v1/calls/${callId}/leave`, { method: "POST", email })
  },

  getCallParticipants: (callId: string, email: string) => {
    if (!isValidUUID(callId)) return Promise.resolve([])
    return apiFetch<ServerCallRoomParticipant[]>(`/api/v1/calls/${callId}/participants`, { email })
  },

  updateCallState: (
    callId: string,
    state: { is_muted?: boolean; is_camera_off?: boolean; is_screen_sharing?: boolean; is_hand_raised?: boolean },
    email: string
  ) => {
    if (!isValidUUID(callId)) return Promise.resolve({ updated: false })
    return apiFetch<{ updated: boolean }>(`/api/v1/calls/${callId}/state`, {
      method: "PUT",
      body: JSON.stringify(state),
      email,
    })
  },

  sendCallSignal: (callId: string, toEmail: string, signalType: string, payload: unknown, email: string) => {
    if (!isValidUUID(callId)) return Promise.resolve({ signaled: false })
    return apiFetch<{ signaled: boolean }>(`/api/v1/calls/${callId}/signal`, {
      method: "POST",
      body: JSON.stringify({ to_email: toEmail, signal_type: signalType, payload }),
      email,
    })
  },

  // ── Tasks & Planner (Decoupled from workspace backend) ──
  listTeamTasks: async (_teamId: string, _email: string, _status?: string): Promise<ServerTask[]> => [],

  listMyTasks: async (_email: string, _status?: string): Promise<ServerTask[]> => [],

  createTask: async (
    teamId: string | null,
    data: {
      title: string
      description?: string
      channel_id?: string
      assignee_email?: string
      status?: string
      priority?: string
      due_date?: string
    },
    email: string
  ): Promise<ServerTask> => ({
    id: `task-${Date.now()}`,
    team_id: teamId || "",
    channel_id: data.channel_id,
    title: data.title,
    description: data.description,
    assignee_email: data.assignee_email,
    status: (data.status as any) || "todo",
    priority: (data.priority as any) || "medium",
    due_date: data.due_date,
    created_by: email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  getTask: async (_taskId: string, _email: string): Promise<ServerTask | null> => null,

  updateTask: async (
    taskId: string,
    data: Partial<{
      title: string
      description: string
      assignee_email: string
      status: string
      priority: string
      due_date: string
    }>,
    _email: string
  ): Promise<ServerTask> => ({
    id: taskId,
    team_id: "",
    title: data.title || "",
    status: (data.status as any) || "todo",
    priority: (data.priority as any) || "medium",
    created_by: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  updateTaskStatus: async (taskId: string, status: string, _email: string): Promise<ServerTask> => ({
    id: taskId,
    team_id: "",
    title: "",
    status: (status as any) || "todo",
    priority: "medium",
    created_by: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  deleteTask: async (_taskId: string, _email: string): Promise<{ deleted: boolean }> => ({ deleted: true }),

  // ── Files & Cloud Storage ──
  listTeamFiles: (teamId: string, email: string, category?: string, channelId?: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    const q = new URLSearchParams()
    if (category) q.set("category", category)
    if (channelId && isValidUUID(channelId)) q.set("channel_id", channelId)
    const qs = q.toString() ? `?${q.toString()}` : ""
    return apiFetch<ServerWorkspaceFile[]>(`/api/v1/teams/${teamId}/files${qs}`, { email })
  },

  uploadFile: (teamId: string, file: File, email: string, category?: string, channelId?: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    const formData = new FormData()
    formData.append("file", file)
    if (category) formData.append("category", category)
    if (channelId && isValidUUID(channelId)) formData.append("channel_id", channelId)
    return fetch(`${getWorkspaceApiUrl()}/api/v1/teams/${teamId}/files`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
      body: formData,
    }).then(async (res) => {
      const json: APIResponse<ServerWorkspaceFile> = await res.json()
      if (!json.success) throw new Error(json.error ?? json.message)
      return json.result!
    })
  },

  getFileStats: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve({ total_size: 0, total_count: 0, categories: {} })
    return apiFetch<{ total_size: number; total_count: number; categories: Record<string, number> }>(
      `/api/v1/teams/${teamId}/files/stats`,
      { email }
    )
  },

  deleteFile: (fileId: string, email: string) => {
    if (!isValidUUID(fileId)) return Promise.resolve({ deleted: false })
    return apiFetch<{ deleted: boolean }>(`/api/v1/files/${fileId}`, { method: "DELETE", email })
  },

  getFileDownloadUrl: (fileId: string) =>
    `${getWorkspaceApiUrl()}/api/v1/files/${fileId}/download`,

  // ── Notifications & Activity ──
  listNotifications: (email: string, unreadOnly?: boolean) => {
    if (!email) return Promise.resolve([])
    return apiFetch<ServerNotification[]>(`/api/v1/notifications${unreadOnly ? "?unread=true" : ""}`, { email })
  },

  getUnreadNotificationCount: (email: string) => {
    if (!email) return Promise.resolve({ unread_count: 0 })
    return apiFetch<{ unread_count: number }>("/api/v1/notifications/unread-count", { email })
  },

  markNotificationRead: (notificationId: string, email: string) => {
    if (!isValidUUID(notificationId)) return Promise.resolve({ read: false })
    return apiFetch<{ read: boolean }>(`/api/v1/notifications/${notificationId}/read`, { method: "PUT", email })
  },

  markAllNotificationsRead: (email: string) => {
    if (!email) return Promise.resolve({ all_read: false })
    return apiFetch<{ all_read: boolean }>("/api/v1/notifications/read-all", { method: "PUT", email })
  },

  // ── Workflows Engine (Parent of Webhooks) ──
  listWorkflows: (teamId: string, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<any[]>(`/api/v1/teams/${teamId}/workflows`, { email })
  },

  getWorkflow: (workflowId: string, email: string) => {
    if (!isValidUUID(workflowId)) return Promise.reject(new Error("Invalid workflow UUID"))
    return apiFetch<any>(`/api/v1/workflows/${workflowId}`, { email })
  },

  createWorkflow: (teamId: string, data: any, email: string) => {
    if (!isValidUUID(teamId)) return Promise.reject(new Error("Invalid team UUID"))
    return apiFetch<any>(`/api/v1/teams/${teamId}/workflows`, {
      method: "POST",
      body: JSON.stringify(data),
      email,
    })
  },

  updateWorkflow: (workflowId: string, teamId: string, data: any, email: string) => {
    if (!isValidUUID(workflowId) || !isValidUUID(teamId)) return Promise.reject(new Error("Invalid UUID"))
    return apiFetch<any>(`/api/v1/workflows/${workflowId}?teamId=${teamId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      email,
    })
  },

  deleteWorkflow: (workflowId: string, teamId: string, email: string) => {
    if (!isValidUUID(workflowId) || !isValidUUID(teamId)) return Promise.resolve({ message: "deleted" })
    return apiFetch<{ message: string }>(`/api/v1/workflows/${workflowId}?teamId=${teamId}`, {
      method: "DELETE",
      email,
    })
  },

  toggleWorkflow: (workflowId: string, teamId: string, email: string) => {
    if (!isValidUUID(workflowId) || !isValidUUID(teamId)) return Promise.reject(new Error("Invalid UUID"))
    return apiFetch<any>(`/api/v1/workflows/${workflowId}/toggle?teamId=${teamId}`, {
      method: "PUT",
      email,
    })
  },

  listWorkflowRuns: (workflowId: string, teamId: string, email: string, limit?: number) => {
    if (!isValidUUID(workflowId) || !isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<any[]>(`/api/v1/workflows/${workflowId}/runs?teamId=${teamId}&limit=${limit || 50}`, { email })
  },

  listTeamWorkflowRuns: (teamId: string, email: string, limit?: number) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<any[]>(`/api/v1/teams/${teamId}/workflows/runs?limit=${limit || 50}`, { email })
  },

  triggerWorkflow: (teamId: string, triggerType: string, data: Record<string, any>, email: string) => {
    if (!isValidUUID(teamId)) return Promise.resolve([])
    return apiFetch<any[]>(`/api/v1/teams/${teamId}/workflows/trigger`, {
      method: "POST",
      body: JSON.stringify({ trigger_type: triggerType, data }),
      email,
    })
  },
}

// ── Dedicated Meeting Backend Service (../meeting, meet.airsend.in) ──

export function getMeetApiUrl(): string {
  let url = "";
  if (typeof window !== "undefined") {
    if ((window as any).__RUNTIME_CONFIG__?.MEET_API_URL) {
      url = (window as any).__RUNTIME_CONFIG__.MEET_API_URL;
    }
  }
  if (!url) {
    url = process.env.MEET_API_URL || "http://localhost:8085";
  }
  url = url.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (url.startsWith("http://")) {
      url = url.replace(/^http:\/\//, "https://");
    } else if (url.startsWith("//")) {
      url = `https:${url}`;
    }
  }
  return url;
}

export function getMeetBaseUrl(): string {
  let url = "";
  if (typeof window !== "undefined") {
    if ((window as any).__RUNTIME_CONFIG__?.MEET_URL) {
      return (window as any).__RUNTIME_CONFIG__.MEET_URL;
    }
  }
  if (!url) {
    url = process.env.MEET_URL || "https://meet.airsend.in";
  }
  url = url.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (url.startsWith("http://")) {
      url = url.replace(/^http:\/\//, "https://");
    } else if (url.startsWith("//")) {
      url = `https:${url}`;
    }
  }
  return url;
}

export const meetingApi = {
  /** Creates room in meeting backend (../meeting server POST /api/rooms) */
  createRoom: async (title?: string, customRoomId?: string, email?: string): Promise<{ roomId: string; hostGrant: string }> => {
    const apiUrl = getMeetApiUrl().replace(/\/+$/, "");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (email) {
      headers["X-User-Email"] = email;
    }
    const res = await fetch(`${apiUrl}/api/rooms`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        title: title || "AirSend Meeting",
        customRoomId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create meeting room");
    }
    return res.json();
  },

  /** Gets room metadata from meeting backend */
  getRoomInfo: async (roomId: string): Promise<{ roomId: string; title?: string; status: string; hostEmail?: string }> => {
    const apiUrl = getMeetApiUrl().replace(/\/+$/, "");
    const res = await fetch(`${apiUrl}/api/rooms/${roomId}`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to get meeting room info");
    }
    return res.json();
  },

  /** Mints VideoSDK / WebRTC meeting token with host or guest role */
  mintToken: async (
    roomId: string,
    participantId?: string,
    hostGrant?: string,
    name?: string
  ): Promise<{ token: string; role: "host" | "guest" }> => {
    const apiUrl = getMeetApiUrl().replace(/\/+$/, "");
    const res = await fetch(`${apiUrl}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        roomId,
        participantId,
        hostGrant,
        name,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to mint meeting token");
    }
    return res.json();
  },
};

// ── Google Meet Link & Code Helpers (meet.airsend.in) ──

export function generateMeetCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${rand(3)}-${rand(4)}-${rand(3)}`
}

export function formatMeetUrl(code: string): string {
  const clean = code.trim().replace(/^https?:\/\//i, "").replace(/^meet\.airsend\.in\//i, "").replace(/^airsend\.in\/v2\/workspace\/calls\//i, "")
  const baseUrl = getMeetBaseUrl().replace(/\/+$/, "")
  return `${baseUrl}/${clean}`
}

export function parseMeetInput(input: string): string {
  const clean = input.trim()
  if (!clean) return ""
  // Handle https://meet.airsend.in/xxx-yyyy-zzz or meet.airsend.in/xxx-yyyy-zzz
  const meetMatch = clean.match(/(?:meet\.airsend\.in|airsend\.in\/v2\/workspace\/calls)\/([a-zA-Z0-9_-]+)/i)
  if (meetMatch && meetMatch[1]) {
    return meetMatch[1]
  }
  return clean.replace(/^\/+|\/+$/g, "")
}

export default workspaceApi
