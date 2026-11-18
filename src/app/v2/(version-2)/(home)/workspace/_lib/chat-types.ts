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
  topic?: string;
  type: "text" | "voice" | "announcement";
  visibility: "public" | "private";
  postingPermission?: "everyone" | "admins_only";
  isPinned: boolean;
  isDefault: boolean;
  isLocked: boolean;
  isArchived?: boolean;
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

export type MessageType = "text" | "system" | "join" | "leave" | "pin" | "file" | "announcement";

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
  | "meeting_invite"
  | "call_missed"
  | "task_assigned"
  | "file_shared"
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

// ---------------------------------------------------------------------------
// Microsoft Teams Clone Features: Meetings, Calls, Files & Advanced Tasks
// ---------------------------------------------------------------------------

export interface MeetingAttendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "accepted" | "declined" | "tentative" | "pending";
  isOrganizer?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  teamId: string;
  channelId?: string;
  channelName?: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  isOnline: boolean;
  meetingUrl: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  attendees: MeetingAttendee[];
  passcode?: string;
}

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  type: "video" | "audio";
  direction: "incoming" | "outgoing" | "missed";
  duration: number; // in seconds
  timestamp: string; // ISO
  teamId?: string;
}

export interface LiveCallParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  role: "host" | "presenter" | "attendee";
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  category: "document" | "spreadsheet" | "presentation" | "media" | "code" | "archive" | "other";
  uploadedBy: string;
  uploaderName: string;
  uploaderAvatar?: string;
  teamId: string;
  channelId?: string;
  channelName?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
}

// ---------------------------------------------------------------------------
// Workflows & Automations Engine (Parent of Webhooks)
// ---------------------------------------------------------------------------

export type WorkflowTriggerType =
  | "on_mail_received"
  | "on_calendar_event"
  | "on_file_uploaded"
  | "on_message_sent"
  | "webhook_received"
  | "task_status_changed";

export type WorkflowActionType =
  | "send_message"
  | "create_task"
  | "post_webhook"
  | "send_email";

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, any>;
  actions: WorkflowAction[];
  isActive: boolean;
  webhookToken?: string;
  runCount: number;
  lastRunAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  teamId: string;
  triggerType: WorkflowTriggerType;
  triggerPayload: Record<string, any>;
  status: "success" | "failed" | "partial" | "running";
  actionsExecuted: Array<{
    index: number;
    type: string;
    status: "success" | "failed";
    error?: string;
  }>;
  logs: string;
  durationMs: number;
  executedAt: string;
}

