// ============================================================================
// Teams & Chat Types — Slack/Discord/Teams-style messaging
// ============================================================================

// ---------------------------------------------------------------------------
// Core Models
// ---------------------------------------------------------------------------

export interface Team {
  id: string;
  name: string;
  description: string;
  logo?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  teamId: string;
  name: string;
  description: string;
  type: "text" | "voice" | "announcement";
  visibility: "public" | "private";
  isPinned: boolean;
  isDefault: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessageAt?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: PresenceStatus;
  customStatus?: string;
  joinedAt: string;
}

export type MemberRole = "owner" | "admin" | "moderator" | "member" | "guest";

export type PresenceStatus = "online" | "idle" | "dnd" | "offline" | "away" | "busy";

// ---------------------------------------------------------------------------
// Message Priority
// ---------------------------------------------------------------------------

export type MessagePriority = "normal" | "everyone" | "urgent" | "priority";

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isEdited: boolean;
  isPinned: boolean;
  isPinnedPublic: boolean;
  replyTo?: ReplyReference;
  mentions: string[]; // userIds
  reactions: Reaction[];
  attachments: MessageAttachment[];
  threadId?: string;
  threadReplyCount: number;
  threadLastReplyAt?: string;
  isDeleted: boolean;
}

export type MessageType = "text" | "system" | "join" | "leave" | "pin" | "file";

export interface ReplyReference {
  messageId: string;
  authorId: string;
  authorName: string;
  content: string; // truncated preview
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
  uploadProgress?: number;
}

// ---------------------------------------------------------------------------
// Direct Messages
// ---------------------------------------------------------------------------

export interface DirectMessage {
  id: string;
  participantIds: string[];
  participants: Pick<TeamMember, "userId" | "username" | "displayName" | "avatar" | "status">[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Notifications & Activity
// ---------------------------------------------------------------------------

export interface ChatNotification {
  id: string;
  type: NotificationType;
  teamId: string;
  channelId?: string;
  messageId?: string;
  fromUserId: string;
  fromUserName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | "mention"
  | "reply"
  | "reaction"
  | "dm"
  | "channel_invite"
  | "team_invite"
  | "system";

// ---------------------------------------------------------------------------
// Tasks (for productivity button)
// ---------------------------------------------------------------------------

export interface ChatTask {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  teamId: string;
  channelId?: string;
  messageId?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Polls (channels only)
// ---------------------------------------------------------------------------

export interface Poll {
  id: string;
  channelId: string;
  createdBy: string;
  creatorName?: string;
  question: string;
  isMultiSelect: boolean;
  isAnonymous: boolean;
  isClosed: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
  totalVotes: number;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  voteCount: number;
  voters?: string[]; // emails — omitted when anonymous
  position: number;
}

export interface CreatePollInput {
  question: string;
  options: string[];
  isMultiSelect: boolean;
  isAnonymous: boolean;
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// UI State
// ---------------------------------------------------------------------------

export type SidePanelView = "thread" | "profile" | "members" | "pinned" | "search" | "activity" | "tasks" | null;

export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Voice Channels
// ---------------------------------------------------------------------------

export interface VoiceParticipant {
  id: string;
  channelId: string;
  userEmail: string;
  displayName?: string;
  joinedAt: string;
  isMuted: boolean;
  isDeafened: boolean;
}

export interface VoiceState {
  channelId: string | null;
  participants: VoiceParticipant[];
  isMuted: boolean;
  isDeafened: boolean;
  isConnecting: boolean;
}
