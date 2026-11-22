// ============================================================================
// Teams & Chat Zustand Store — real API integration
// ============================================================================

import { create, type StoreApi, type UseBoundStore } from "zustand";
import {
  loadCachedChannelMessages,
  loadCachedDMMessages,
  newestChange,
  revalidate,
  upsertById,
} from "./workspace-cache";
import type {
  Team,
  Channel,
  TeamMember,
  MemberRole,
  ChatMessage,
  DirectMessage,
  ChatNotification,
  ChatTask,
  SidePanelView,
  TypingIndicator,
  MessagePriority,
  PresenceStatus,
  Poll,
  CreatePollInput,
  Meeting,
  CallRecord,
  LiveCallParticipant,
  WorkspaceFile,
  Workflow,
  WorkflowRun,
  MessageAttachment,
  PendingUpload,
} from "./chat-types";
import {
  MOCK_TEAMS,
  MOCK_MEMBERS,
  MOCK_CHANNELS,
  MOCK_MESSAGES,
  MOCK_DMS,
  MOCK_NOTIFICATIONS,
  MOCK_TASKS,
  MOCK_MEETINGS,
  MOCK_CALL_RECORDS,
  MOCK_LIVE_PARTICIPANTS,
  MOCK_FILES,
  MOCK_WORKFLOWS,
  MOCK_WORKFLOW_RUNS,
} from "./mock-data";
import {
  workspaceApi,
  isValidUUID,
  toTeam,
  toChannel,
  toMember,
  toMessage,
  toDM,
  toPoll,
  toMeeting,
  toCallRecord,
  toWorkspaceFile,
  toChatTask,
  toDMMessage,
  apiErrorMessage,
} from "./api";
import { uploadWorkspaceFile, deleteWorkspaceFile, filesErrorMessage } from "./files-api";
import { categoryFor, fileKind } from "./file-utils";
import { toast } from "sonner";
import { createOutbox, keepQuote, type ForwardTarget, type OutgoingFile } from "./outbox";
import { announceRead, useReadReceipts } from "./read-receipts";
import { notifyIncoming } from "./notify";

// ---------------------------------------------------------------------------
// File sending helpers
// ---------------------------------------------------------------------------

/** Abort handles of the uploads in flight, by pending-upload id. */
const uploadControllers = new Map<string, AbortController>();

/** Adds an attachment, replacing one with the same id or the same files-service file id (e.g. the local placeholder). */
function upsertAttachment(list: MessageAttachment[], att: MessageAttachment): MessageAttachment[] {
  const rest = list.filter((a) => a.id !== att.id && !(att.fileId && a.fileId === att.fileId));
  return [...rest, att];
}

function withAttachment(m: ChatMessage, messageId: string, att: MessageAttachment): ChatMessage {
  return m.id === messageId ? { ...m, type: "file", attachments: upsertAttachment(m.attachments ?? [], att) } : m;
}

/** Conversation kind of an id the store knows (channel or DM). */
function kindOf(s: ChatStore, id: string): "channel" | "dm" {
  return s.channels.some((c) => c.id === id) ? "channel" : "dm";
}

/** Title for a notification about `conversationId`. */
/** Messages the server has (not optimistic / outbox copies): only these decide between a delta and a full load. */
const serverOnly = (list: ChatMessage[]) => list.filter((m) => isValidUUID(m.id) && !m.sendStatus);

function conversationTitle(s: ChatStore, conversationId: string, fallback: string): string {
  const ch = s.channels.find((c) => c.id === conversationId);
  if (ch) return `#${ch.name}`;
  const dm = s.directMessages.find((d) => d.id === conversationId);
  return dm?.name || fallback;
}

/** Merge the server's DM page with what we already show (in-flight temp messages, attachments not yet confirmed). */
function dedupeById(list: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  return list.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
}

function mergeIncomingDM(local: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming.length) return local;
  const merged = incoming.map((m) => {
    const prev = local.find((x) => x.id === m.id);
    if (!prev) return m;
    const missing = prev.attachments.filter((a) => a.fileId && !m.attachments.some((x) => x.fileId === a.fileId));
    return missing.length ? { ...m, attachments: [...m.attachments, ...missing] } : m;
  });
  return upsertById(local, merged);
}

function mergeDMMessages(local: ChatMessage[], server: ChatMessage[]): ChatMessage[] {
  const localById = new Map(local.map((m) => [m.id, m]));
  const merged = server.map((m) => {
    const prev = localById.get(m.id);
    if (!prev) return m;
    const missing = prev.attachments.filter((a) => a.fileId && !m.attachments.some((x) => x.fileId === a.fileId));
    return missing.length ? { ...m, attachments: [...m.attachments, ...missing] } : m;
  });
  const serverIds = new Set(server.map((m) => m.id));
  const extra = local.filter((m) => !serverIds.has(m.id) && (m.id.startsWith("temp-") || m.attachments.some((a) => a.fileId)));
  return [...merged, ...extra].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface ChatStore {
  // Data
  teams: Team[];
  channels: Channel[];
  members: TeamMember[];
  messages: ChatMessage[];
  messageCursors: Record<string, string>; // channelId → next cursor
  messageHasMore: Record<string, boolean>; // channelId → has more pages
  isLoadingOlder: boolean;
  threadReplies: ChatMessage[];
  directMessages: DirectMessage[];
  /** Messages of each DM conversation (channelId holds the conversation id), oldest first. */
  dmMessages: Record<string, ChatMessage[]>;
  /** Files currently uploading to the files service (chat attachments and team Files). */
  pendingUploads: PendingUpload[];
  notifications: ChatNotification[];
  tasks: ChatTask[];
  typingIndicators: TypingIndicator[];

  // Microsoft Teams Features: Meetings, Calls, Files, Live Meeting Call Room
  meetings: Meeting[];
  callRecords: CallRecord[];
  files: WorkspaceFile[];
  callParticipants: LiveCallParticipant[];

  // Active Live Call state
  activeCallId: string | null;
  activeCallTitle: string | null;
  isMyCameraOn: boolean;
  isMyMicMuted: boolean;
  isMyScreenSharing: boolean;
  isMyHandRaised: boolean;

  // Actions — Tasks
  addTask: (task: Omit<ChatTask, "id" | "createdAt">) => void;
  updateTaskStatus: (taskId: string, status: ChatTask["status"]) => void;
  deleteTask: (taskId: string) => void;

  // Actions — Meetings
  addMeeting: (meeting: Omit<Meeting, "id">) => void;
  updateMeetingStatus: (id: string, status: Meeting["status"]) => void;
  deleteMeeting: (id: string) => void;

  // Actions — Calls
  addCallRecord: (call: Omit<CallRecord, "id" | "timestamp">) => void;
  startCall: (callId: string, title?: string, displayName?: string) => void;
  leaveCall: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => void;
  toggleHandRaise: () => void;

  // Actions — Files
  deleteFile: (fileId: string) => void;

  // Read tracking (client-side: the server does not compute unread counts) and the offline outbox
  readPositions: Record<string, string>;
  /** Mark read locally and announce it (read receipts). */
  markRead: (conversationId: string) => void;
  _markReadLocal: (conversationId: string) => void;
  /** `live`: arrived over the socket just now (notify); false for catch-up fetches. */
  noteIncoming: (conversationId: string, message: ChatMessage, live?: boolean) => void;
  receiveDMMessage: (conversationId: string, message: ChatMessage) => void;
  flushOutbox: () => Promise<void>;
  /** Failed sends: try again now / give up (removes the message, or undoes a half-sent file). */
  retrySend: (outboxId: string) => void;
  discardSend: (outboxId: string) => void;
  /** WebSocket results for a channel or DM send (temp id = outbox id). */
  noteSendAck: (tempId: string, real: ChatMessage, kind?: "channel" | "dm") => void;
  noteSendError: (tempId: string, error: string) => void;
  forwardMessages: (messages: ChatMessage[], targets: ForwardTarget[]) => Promise<void>;

  // WebSocket reference for sending messages
  _ws: WebSocket | null;
  setWS: (ws: WebSocket | null) => void;

  // Selection state
  activeTeamId: string | null;
  activeChannelId: string | null;
  activeDmId: string | null;
  activeThreadMessageId: string | null;
  sidePanelView: SidePanelView;

  // UI state
  isChannelSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  replyingTo: ChatMessage | null;
  editingMessageId: string | null;
  searchQuery: string;

  // Derived / computed helpers
  currentUserId: string;
  setCurrentUserId: (id: string) => void;

  // Actions — Teams
  setActiveTeam: (teamId: string) => void;
  addTeam: (team: Team) => void;

  // Actions — Channels
  setActiveChannel: (channelId: string) => void;
  addChannel: (channel: Channel) => void;
  toggleChannelPin: (channelId: string) => void;

  // Actions — Messages
  sendMessage: (content: string, mentions?: string[], attachments?: ChatMessage["attachments"], priority?: MessagePriority) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => Promise<boolean>;
  pinMessage: (messageId: string, isPublic: boolean) => Promise<boolean>;
  unpinMessage: (messageId: string) => Promise<boolean>;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  setReplyingTo: (message: ChatMessage | null) => void;
  setEditingMessage: (messageId: string | null) => void;

  // Actions — Threads
  openThread: (messageId: string) => void;
  closeThread: () => void;
  sendThreadReply: (content: string, mentions?: string[]) => void;

  // Actions — DMs
  setActiveDm: (dmId: string) => void;
  fetchDMMessages: (dmId: string) => Promise<void>;
  sendDMText: (content: string) => void;

  // Actions — Files (message first, then the bytes under the message id, then the reference; see outbox.ts)
  /** Send files (new or reused) to the open conversation; the first carries the caption and the reply. */
  sendFiles: (files: OutgoingFile[], caption?: string) => Promise<void>;
  uploadTeamFile: (file: File, opts?: { channelId?: string }) => Promise<boolean>;
  cancelUpload: (uploadId: string) => void;
  dismissUpload: (uploadId: string) => void;
  /** Add (or replace by id / file id) an attachment on a channel or DM message. */
  addMessageAttachment: (messageId: string, attachment: MessageAttachment) => void;

  // Actions — Polls (channels only)
  polls: Poll[];
  createPoll: (channelId: string, input: CreatePollInput, email: string) => Promise<void>;
  votePoll: (pollId: string, optionIds: string[], email: string) => Promise<void>;
  closePoll: (pollId: string, email: string) => Promise<void>;
  deletePoll: (pollId: string, email: string) => Promise<void>;
  fetchPolls: (channelId: string, email: string) => Promise<void>;
  getChannelPolls: (channelId: string) => Poll[];

  // Actions — Side panel
  setSidePanelView: (view: SidePanelView) => void;

  // Actions — UI
  toggleChannelSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Actions — Notifications
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  // Actions — User status
  myStatus: PresenceStatus;
  myCustomStatus: string;
  effectiveStatus: PresenceStatus;
  hydrateManualPresence: () => void;
  setEffectiveStatus: (status: PresenceStatus) => void;
  setMyStatus: (status: PresenceStatus) => void;
  setMyCustomStatus: (text: string) => void;

  // Actions — API integration
  fetchTeams: (email: string) => Promise<void>;
  fetchChannels: (teamId: string, email: string) => Promise<void>;
  fetchMembers: (teamId: string, email: string) => Promise<void>;
  fetchMessages: (channelId: string, email: string) => Promise<void>;
  fetchOlderMessages: (channelId: string, email: string) => Promise<void>;
  fetchDMs: (email: string) => Promise<void>;
  fetchMeetings: (teamId?: string) => Promise<void>;
  fetchTasks: (teamId?: string) => Promise<void>;
  fetchFiles: (teamId?: string) => Promise<void>;
  fetchCalls: () => Promise<void>;
  fetchNotifications: () => Promise<void>;

  // Workflows & Automations Engine
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  fetchWorkflows: (teamId?: string) => Promise<void>;
  fetchWorkflowRuns: (teamId?: string) => Promise<void>;
  addWorkflow: (workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "runCount">) => Promise<void>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  toggleWorkflow: (id: string) => Promise<void>;
  addWorkflowRun: (run: WorkflowRun) => void;

  // Channel & Team Management
  updateChannel: (channelId: string, updates: Partial<Channel>) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  updateMemberRole: (teamId: string, memberEmail: string, role: MemberRole, actorEmail?: string) => Promise<boolean>;
  removeMember: (teamId: string, memberEmail: string, actorEmail?: string) => Promise<boolean>;

  isLoading: boolean;
  isLoadingTeams: boolean;
  isLoadingChannels: boolean;
  isLoadingMessages: boolean;
  apiError: string | null;

  // Selectors
  getTeamChannels: (teamId: string) => Channel[];
  getChannelMessages: (channelId: string) => ChatMessage[];
  getTeamMembers: (teamId: string) => TeamMember[];
  getUnreadNotificationCount: () => number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type { ChatStore };

const MANUAL_PRESENCE_KEY = "airsend:workspace:presence";
const MANUAL_STATUSES: PresenceStatus[] = ["online", "idle", "dnd", "offline", "away", "busy"];

function loadManualPresence(): { status: PresenceStatus; custom: string } {
  try {
    if (typeof window === "undefined") return { status: "online", custom: "" };
    const raw = JSON.parse(window.localStorage.getItem(MANUAL_PRESENCE_KEY) ?? "{}") as { status?: string; custom?: string };
    const status = MANUAL_STATUSES.includes(raw.status as PresenceStatus) ? (raw.status as PresenceStatus) : "online";
    return { status, custom: typeof raw.custom === "string" ? raw.custom : "" };
  } catch {
    return { status: "online", custom: "" };
  }
}

function saveManualPresence(status: PresenceStatus, custom: string): void {
  try {
    window.localStorage.setItem(MANUAL_PRESENCE_KEY, JSON.stringify({ status, custom }));
  } catch {
    return;
  }
}

export const useChatStore: UseBoundStore<StoreApi<ChatStore>> = create<ChatStore>()((set, get) => {
  const outbox = createOutbox(set, get);
  return {
  // Data — initialized empty, loaded from live backend API
  teams: [],
  channels: [],
  members: [],
  messages: [],
  messageCursors: {},
  messageHasMore: {},
  readPositions: {},
  isLoadingOlder: false,
  threadReplies: [],
  directMessages: [],
  dmMessages: {},
  pendingUploads: [],
  notifications: [],
  tasks: [],
  typingIndicators: [],

  // Microsoft Teams Features
  meetings: [],
  callRecords: [],
  files: [],
  callParticipants: [],

  // Workflows & Automations Engine
  workflows: [],
  workflowRuns: [],

  // Active Live Call state
  activeCallId: null,
  activeCallTitle: null,
  isMyCameraOn: true,
  isMyMicMuted: false,
  isMyScreenSharing: false,
  isMyHandRaised: false,

  // WebSocket
  _ws: null,
  setWS: (ws) => set({ _ws: ws }),

  // Selection
  activeTeamId: null,
  activeChannelId: null,
  activeDmId: null,
  activeThreadMessageId: null,
  sidePanelView: null,

  // UI
  isChannelSidebarOpen: true,
  isMobileSidebarOpen: false,
  replyingTo: null,
  editingMessageId: null,
  searchQuery: "",

  // API state
  isLoading: false,
  isLoadingTeams: false,
  isLoadingChannels: false,
  isLoadingMessages: false,
  apiError: null,

  currentUserId: "",
  setCurrentUserId: (id) => set({ currentUserId: id }),

  // -----------------------------------------------------------------------
  // Team actions
  // -----------------------------------------------------------------------

  setActiveTeam: (teamId) => {
    const channels = get().channels.filter((c) => c.teamId === teamId);
    const defaultChannel = channels.find((c) => c.isDefault) || channels[0];
    set({
      activeTeamId: teamId,
      activeChannelId: defaultChannel?.id || null,
      activeDmId: null,
      activeThreadMessageId: null,
      sidePanelView: null,
    });
    if (defaultChannel) get().markRead(defaultChannel.id);
  },

  markRead: (conversationId) => {
    get()._markReadLocal(conversationId);
    const s = get();
    const position = s.readPositions[conversationId];
    if (position) announceRead(s._ws, kindOf(s, conversationId), conversationId, position);
  },

  _markReadLocal: (conversationId) =>
    set((s) => {
      const known = s.messages.some((m) => m.channelId === conversationId)
        ? s.messages.filter((m) => m.channelId === conversationId)
        : (s.dmMessages[conversationId] ?? []);
      let latest = Date.parse(s.readPositions[conversationId] ?? "") || 0;
      for (const m of known) {
        const t = Date.parse(m.createdAt);
        if (Number.isFinite(t) && t > latest) latest = t;
      }
      const position = new Date(latest || Date.now()).toISOString();
      const hasChannelUnread = s.channels.some((c) => c.id === conversationId && c.unreadCount > 0);
      const hasDmUnread = s.directMessages.some((d) => d.id === conversationId && d.unreadCount > 0);
      if (s.readPositions[conversationId] === position && !hasChannelUnread && !hasDmUnread) return s;
      return {
        readPositions: { ...s.readPositions, [conversationId]: position },
        channels: hasChannelUnread ? s.channels.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)) : s.channels,
        directMessages: hasDmUnread
          ? s.directMessages.map((d) => (d.id === conversationId ? { ...d, unreadCount: 0 } : d))
          : s.directMessages,
      };
    }),

  noteIncoming: (conversationId, message, live = false) => {
    const s = get();
    const viewingNow =
      (s.activeChannelId === conversationId || s.activeDmId === conversationId) &&
      (typeof document === "undefined" || document.visibilityState === "visible");
    if (live && !viewingNow && !message.isDeleted && message.authorId !== s.currentUserId) {
      const open = () =>
        kindOf(get(), conversationId) === "channel" ? get().setActiveChannel(conversationId) : get().setActiveDm(conversationId);
      notifyIncoming(message, conversationTitle(s, conversationId, message.authorName || message.authorId), open);
    }
    if (message.isDeleted || message.authorId === s.currentUserId) return;
    const sentAt = Date.parse(message.createdAt);
    const viewing =
      (s.activeChannelId === conversationId || s.activeDmId === conversationId) &&
      (typeof document === "undefined" || document.visibilityState === "visible");
    if (viewing) {
      get().markRead(conversationId);
      return;
    }
    const readAt = Date.parse(s.readPositions[conversationId] ?? "");
    if (Number.isFinite(readAt) && Number.isFinite(sentAt) && sentAt <= readAt) return;
    set((st) => ({
      channels: st.channels.some((c) => c.id === conversationId)
        ? st.channels.map((c) => (c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c))
        : st.channels,
      directMessages: st.directMessages.some((d) => d.id === conversationId)
        ? st.directMessages.map((d) => (d.id === conversationId ? { ...d, unreadCount: d.unreadCount + 1 } : d))
        : st.directMessages,
    }));
  },

  receiveDMMessage: (conversationId, message) => {
    const existing = get().dmMessages[conversationId] ?? [];
    if (existing.some((m) => m.id === message.id)) return;
    set((s) => ({
      dmMessages: { ...s.dmMessages, [conversationId]: [...(s.dmMessages[conversationId] ?? []), message] },
      directMessages: s.directMessages.map((d) =>
        d.id === conversationId ? { ...d, lastMessage: message, updatedAt: message.createdAt } : d,
      ),
    }));
    get().noteIncoming(conversationId, message, true);
  },

  // Sending, retries, uploads and forwards live in outbox.ts.
  flushOutbox: () => outbox.flush(),
  retrySend: (id) => void outbox.retry(id),
  discardSend: (id) => void outbox.discard(id),
  forwardMessages: (messages, targets) => outbox.forward(messages, targets),

  // Channel acks swap in `messages`; DM acks in that conversation's list (real.channelId is the conversation id).
  noteSendAck: (tempId, real, kind = "channel") => {
    outbox.acked(tempId);
    const swap = (list: ChatMessage[]) =>
      list.some((m) => m.id === real.id)
        ? list.filter((m) => m.id !== tempId)
        : list.map((m) => (m.id === tempId ? keepQuote(real, m) : m));
    set((s) =>
      kind === "channel"
        ? { messages: swap(s.messages) }
        : { dmMessages: { ...s.dmMessages, [real.channelId]: swap(s.dmMessages[real.channelId] ?? []) } },
    );
  },

  noteSendError: (tempId, error) => void outbox.wsFailed(tempId, error),

  addTeam: (team) => {
    set((s) => ({ teams: [...s.teams, team] }));
  },

  // -----------------------------------------------------------------------
  // Channel actions
  // -----------------------------------------------------------------------

  setActiveChannel: (channelId) => {
    set({
      activeChannelId: channelId,
      activeDmId: null,
      activeThreadMessageId: null,
      sidePanelView: null,
      replyingTo: null,
      editingMessageId: null,
    });
    if (!channelId) return;
    get().markRead(channelId);
    void useReadReceipts.getState().load("channel", channelId, get().currentUserId);
  },

  addChannel: (channel) =>
    set((s) => ({ channels: [...s.channels, channel] })),

  toggleChannelPin: (channelId) =>
    set((s) => ({
      channels: s.channels.map((c) =>
        c.id === channelId ? { ...c, isPinned: !c.isPinned } : c,
      ),
    })),

  // -----------------------------------------------------------------------
  // Message actions
  // -----------------------------------------------------------------------

  // The reply target is read BEFORE it is cleared (it used to be read after, so replies lost their target).
  sendMessage: (content, mentions = [], _attachments = [], priority = "normal") => {
    const { activeChannelId, currentUserId, replyingTo } = get();
    const text = content.trim();
    if (!activeChannelId || !isValidUUID(activeChannelId) || !text || !currentUserId) return;
    set({ replyingTo: null });
    void outbox.queueText("channel", activeChannelId, text, { mentions, priority, replyTo: replyingTo });
  },

  editMessage: (messageId, newContent) => {
    const { currentUserId } = get();
    // Optimistic update
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
          : m,
      ),
      editingMessageId: null,
    }));
    workspaceApi.editMessage(messageId, newContent, currentUserId).catch(() => {
      // Revert on failure — refetch
      const channelId = get().messages.find((m) => m.id === messageId)?.channelId;
      if (channelId) get().fetchMessages(channelId, currentUserId);
    });
  },

  deleteMessage: async (messageId) => {
    const { currentUserId } = get();
    const msg = get().messages.find((m) => m.id === messageId);
    // Optimistic
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, isDeleted: true, content: "This message has been deleted." }
          : m,
      ),
    }));
    try {
      await workspaceApi.deleteMessage(messageId, currentUserId);
      return true;
    } catch {
      // Restore the original message (e.g. 403).
      if (msg) set((s) => ({ messages: s.messages.map((m) => (m.id === messageId ? msg : m)) }));
      return false;
    }
  },

  pinMessage: async (messageId, isPublic) => {
    const { currentUserId } = get();
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: true, isPinnedPublic: isPublic } : m,
      ),
    }));
    try {
      await workspaceApi.pinMessage(messageId, true, currentUserId);
      return true;
    } catch {
      set((s) => ({ messages: s.messages.map((m) => (m.id === messageId ? { ...m, isPinned: false } : m)) }));
      return false;
    }
  },

  unpinMessage: async (messageId) => {
    const { currentUserId } = get();
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: false, isPinnedPublic: false } : m,
      ),
    }));
    try {
      await workspaceApi.pinMessage(messageId, false, currentUserId);
      return true;
    } catch {
      set((s) => ({ messages: s.messages.map((m) => (m.id === messageId ? { ...m, isPinned: true } : m)) }));
      return false;
    }
  },

  addReaction: (messageId, emoji) => {
    const { currentUserId } = get();
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          if (existing.userIds.includes(currentUserId)) return m;
          return {
            ...m,
            reactions: m.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, userIds: [...r.userIds, currentUserId] }
                : r,
            ),
          };
        }
        return {
          ...m,
          reactions: [...m.reactions, { emoji, count: 1, userIds: [currentUserId] }],
        };
      }),
    }));
    workspaceApi.addReaction(messageId, emoji, currentUserId).catch(() => {});
  },

  removeReaction: (messageId, emoji) => {
    const { currentUserId } = get();
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== messageId) return m;
        return {
          ...m,
          reactions: m.reactions
            .map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count - 1, userIds: r.userIds.filter((id) => id !== currentUserId) }
                : r,
            )
            .filter((r) => r.count > 0),
        };
      }),
    }));
    workspaceApi.removeReaction(messageId, emoji, currentUserId).catch(() => {});
  },

  setReplyingTo: (message) => set({ replyingTo: message, editingMessageId: null }),
  setEditingMessage: (messageId) => set({ editingMessageId: messageId, replyingTo: null }),

  // -----------------------------------------------------------------------
  // Thread actions
  // -----------------------------------------------------------------------

  openThread: (messageId) => {
    set({
      activeThreadMessageId: messageId,
      sidePanelView: "thread",
    });
    // Fetch thread replies from API
    const { currentUserId } = get();
    if (currentUserId) {
      workspaceApi.getThread(messageId, currentUserId).then((serverMsgs) => {
        const replies = serverMsgs.map((m) => {
          const msg = toMessage(m);
          msg.threadId = messageId;
          return msg;
        });
        set({ threadReplies: replies });
      }).catch(() => {});
    }
  },

  closeThread: () =>
    set({
      activeThreadMessageId: null,
      sidePanelView: null,
    }),

  sendThreadReply: (content, mentions = []) => {
    const { activeThreadMessageId, activeChannelId, currentUserId } = get();
    if (!activeThreadMessageId || !activeChannelId || !content.trim() || !currentUserId) return;

    const tempId = `tr-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      channelId: activeChannelId,
      authorId: currentUserId,
      authorName: "You",
      content: content.trim(),
      type: "text",
      priority: "normal",
      createdAt: new Date().toISOString(),
      isEdited: false,
      isPinned: false,
      isPinnedPublic: false,
      mentions,
      reactions: [],
      attachments: [],
      threadId: activeThreadMessageId,
      threadReplyCount: 0,
      isDeleted: false,
    };

    set((s) => ({
      threadReplies: [...s.threadReplies, optimistic],
      messages: s.messages.map((m) =>
        m.id === activeThreadMessageId
          ? {
              ...m,
              threadReplyCount: m.threadReplyCount + 1,
              threadLastReplyAt: new Date().toISOString(),
            }
          : m,
      ),
    }));

    workspaceApi
      .replyToThread(activeThreadMessageId, { content: content.trim(), mentions }, currentUserId)
      .then((serverMsg) => {
        const real = toMessage(serverMsg);
        real.threadId = activeThreadMessageId;
        set((s) => ({
          threadReplies: s.threadReplies.map((r) => (r.id === tempId ? real : r)),
        }));
      })
      .catch(() => {
        set((s) => ({
          threadReplies: s.threadReplies.filter((r) => r.id !== tempId),
        }));
      });
  },

  // -----------------------------------------------------------------------
  // DM actions
  // -----------------------------------------------------------------------

  setActiveDm: (dmId) => {
    set({
      activeDmId: dmId,
      activeChannelId: null,
      activeThreadMessageId: null,
      sidePanelView: null,
      replyingTo: null,
      editingMessageId: null,
    });
    if (!dmId) return;
    get().markRead(dmId);
    void useReadReceipts.getState().load("dm", dmId, get().currentUserId);
  },

  fetchDMMessages: async (dmId) => {
    const email = get().currentUserId;
    if (!isValidUUID(dmId) || !email) return;
    if (!serverOnly(get().dmMessages[dmId] ?? []).length) {
      const cached = await loadCachedDMMessages(dmId);
      if (cached.length && !serverOnly(get().dmMessages[dmId] ?? []).length) {
        set((s) => ({ dmMessages: { ...s.dmMessages, [dmId]: mergeDMMessages(s.dmMessages[dmId] ?? [], cached) } }));
      }
    }
    try {
      const since = newestChange(serverOnly(get().dmMessages[dmId] ?? []));
      if (since) {
        let cursor = since;
        for (let round = 0; round < 5; round++) {
          const res = await workspaceApi.listDMMessagesSince(dmId, email, cursor);
          const incoming = (res?.items ?? []).map(toDMMessage);
          const seen = new Set((get().dmMessages[dmId] ?? []).map((m) => m.id));
          set((s) => ({
            dmMessages: { ...s.dmMessages, [dmId]: mergeIncomingDM(s.dmMessages[dmId] ?? [], incoming) },
          }));
          for (const m of incoming) if (!seen.has(m.id)) get().noteIncoming(dmId, m);
          if (!res?.has_more || !incoming.length) break;
          cursor = newestChange(incoming) ?? cursor;
        }
      } else {
        const res = await workspaceApi.listLatestDMMessages(dmId, email);
        const server = (res?.items ?? []).map(toDMMessage);
        set((s) => ({
          dmMessages: { ...s.dmMessages, [dmId]: mergeDMMessages(s.dmMessages[dmId] ?? [], server) },
        }));
      }
      if (get().activeDmId === dmId) get().markRead(dmId);
    } catch {
      // Silent: the DM view keeps what it has and refreshes on the next event or delta poll.
    }
  },

  sendDMText: (content) => {
    const { activeDmId, currentUserId, replyingTo } = get();
    const text = content.trim();
    if (!activeDmId || !isValidUUID(activeDmId) || !text || !currentUserId) return;
    set({ replyingTo: null });
    void outbox.queueText("dm", activeDmId, text, { replyTo: replyingTo });
  },

  // -----------------------------------------------------------------------
  // Files: upload to the files service first, then reference the file id
  // -----------------------------------------------------------------------

  addMessageAttachment: (messageId, attachment) =>
    set((s) => ({
      messages: s.messages.map((m) => withAttachment(m, messageId, attachment)),
      threadReplies: s.threadReplies.map((m) => withAttachment(m, messageId, attachment)),
      dmMessages: Object.fromEntries(
        Object.entries(s.dmMessages).map(([id, list]) => [id, list.map((m) => withAttachment(m, messageId, attachment))]),
      ),
    })),

  // Team Files uploads keep their own controllers; chat uploads belong to the outbox.
  cancelUpload: (uploadId) => {
    if (!uploadControllers.has(uploadId)) return void outbox.discard(uploadId);
    uploadControllers.get(uploadId)?.abort();
    uploadControllers.delete(uploadId);
    set((s) => ({ pendingUploads: s.pendingUploads.filter((u) => u.id !== uploadId) }));
  },

  dismissUpload: (uploadId) => {
    if (!uploadControllers.has(uploadId)) return void outbox.discard(uploadId);
    uploadControllers.delete(uploadId);
    set((s) => ({ pendingUploads: s.pendingUploads.filter((u) => u.id !== uploadId) }));
  },

  // Queued in IndexedDB first, then sent in the background (at most 5 uploads at once); switching conversations
  // does not stop it. See outbox.ts.
  sendFiles: async (files, caption) => {
    const { activeChannelId, activeDmId, currentUserId, replyingTo } = get();
    const target =
      activeChannelId && isValidUUID(activeChannelId)
        ? ({ kind: "channel", id: activeChannelId } as const)
        : activeDmId && isValidUUID(activeDmId)
          ? ({ kind: "dm", id: activeDmId } as const)
          : null;
    if (!target || !currentUserId || !files.length) return;
    set({ replyingTo: null });
    await outbox.queueFiles(target.kind, target.id, files, caption, replyingTo);
  },

  uploadTeamFile: async (file, opts) => {
    const { activeTeamId, currentUserId } = get();
    if (!activeTeamId || !isValidUUID(activeTeamId) || !currentUserId) return false;
    const teamId = activeTeamId;
    const uploadId = `up-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const controller = new AbortController();
    uploadControllers.set(uploadId, controller);
    const patch = (p: Partial<PendingUpload>) =>
      set((s) => ({ pendingUploads: s.pendingUploads.map((u) => (u.id === uploadId ? { ...u, ...p } : u)) }));
    set((s) => ({
      pendingUploads: [
        ...s.pendingUploads,
        { id: uploadId, contextType: "team", contextId: teamId, name: file.name, size: file.size, progress: 0, status: "uploading" },
      ],
    }));

    try {
      const meta = await uploadWorkspaceFile(file, "team", teamId, {
        onProgress: (progress) => patch({ progress }),
        signal: controller.signal,
      });
      patch({ progress: 100, status: "sending" });
      const created = await workspaceApi.addTeamFileRef(
        teamId,
        {
          file_id: meta.id,
          name: meta.name || file.name,
          size: meta.size,
          mime_type: meta.mimeType,
          extension: meta.extension,
          category: categoryFor(fileKind(meta.extension, meta.mimeType)),
          channel_id: opts?.channelId && isValidUUID(opts.channelId) ? opts.channelId : undefined,
        },
        currentUserId,
      );
      const f = toWorkspaceFile(created);
      set((s) => ({
        files: s.files.some((x) => x.id === f.id) ? s.files : [f, ...s.files],
        pendingUploads: s.pendingUploads.filter((u) => u.id !== uploadId),
      }));
      uploadControllers.delete(uploadId);
      return true;
    } catch (err) {
      if (!uploadControllers.has(uploadId)) return false; // cancelled
      const message = err instanceof Error && err.name === "FilesApiError" ? filesErrorMessage(err, "Upload failed") : apiErrorMessage(err, "Upload failed");
      patch({ status: "error", error: message });
      toast.error(`${file.name}: ${message}`);
      return false;
    }
  },

  // -----------------------------------------------------------------------
  // Polls
  // -----------------------------------------------------------------------

  polls: [],

  createPoll: async (channelId, input, email) => {
    try {
      const serverPoll = await workspaceApi.createPoll(channelId, {
        question: input.question,
        options: input.options,
        is_multi_select: input.isMultiSelect,
        is_anonymous: input.isAnonymous,
        expires_at: input.expiresAt,
      }, email);
      set((s) => ({ polls: [toPoll(serverPoll), ...s.polls] }));
    } catch (e: any) {
      set({ apiError: e.message });
    }
  },

  votePoll: async (pollId, optionIds, email) => {
    try {
      const updated = await workspaceApi.votePoll(pollId, optionIds, email);
      set((s) => ({
        polls: s.polls.map((p) => (p.id === pollId ? toPoll(updated) : p)),
      }));
    } catch (e: any) {
      set({ apiError: e.message });
    }
  },

  closePoll: async (pollId, email) => {
    try {
      await workspaceApi.closePoll(pollId, email);
      set((s) => ({
        polls: s.polls.map((p) => (p.id === pollId ? { ...p, isClosed: true } : p)),
      }));
    } catch (e: any) {
      set({ apiError: e.message });
    }
  },

  deletePoll: async (pollId, email) => {
    try {
      await workspaceApi.deletePoll(pollId, email);
      set((s) => ({
        polls: s.polls.filter((p) => p.id !== pollId),
      }));
    } catch (e: any) {
      set({ apiError: e.message });
    }
  },

  fetchPolls: async (channelId, email) => {
    try {
      const serverPolls = await workspaceApi.listChannelPolls(channelId, email);
      const polls = (serverPolls ?? []).map(toPoll);
      set((s) => {
        // Merge: replace polls for this channel, keep others
        const otherPolls = s.polls.filter((p) => p.channelId !== channelId);
        return { polls: [...polls, ...otherPolls] };
      });
    } catch (e: any) {
      set({ apiError: e.message });
    }
  },

  getChannelPolls: (channelId) => {
    return useChatStore.getState().polls.filter((p) => p.channelId === channelId);
  },

  // -----------------------------------------------------------------------
  // Side panel
  // -----------------------------------------------------------------------

  setSidePanelView: (view) =>
    set((s) => ({
      sidePanelView: s.sidePanelView === view ? null : view,
      activeThreadMessageId: view !== "thread" ? null : s.activeThreadMessageId,
    })),

  // -----------------------------------------------------------------------
  // UI actions
  // -----------------------------------------------------------------------

  toggleChannelSidebar: () =>
    set((s) => ({ isChannelSidebarOpen: !s.isChannelSidebarOpen })),

  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  // -----------------------------------------------------------------------
  // Notification actions
  // -----------------------------------------------------------------------

  markNotificationRead: (notificationId) => {
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      ),
    }));
    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.markNotificationRead(notificationId, email).catch(() => {});
  },

  markAllNotificationsRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.markAllNotificationsRead(email).catch(() => {});
  },

  // -----------------------------------------------------------------------
  // Microsoft Teams Features: Tasks, Meetings, Calls, Files
  // -----------------------------------------------------------------------

  addTask: (taskInput) => {
    const tempId = `task-${Date.now()}`;
    const newTask: ChatTask = {
      ...taskInput,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ tasks: [newTask, ...s.tasks] }));
  },

  updateTaskStatus: (taskId, status) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));
  },

  deleteTask: (taskId) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },

  addMeeting: (meetingInput) => {
    const tempId = `meet-${Date.now()}`;
    const newMeeting: Meeting = {
      ...meetingInput,
      id: tempId,
    };
    set((s) => ({ meetings: [newMeeting, ...s.meetings] }));

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi
      .createMeeting(
        meetingInput.teamId || null,
        {
          title: meetingInput.title,
          description: meetingInput.description,
          channel_id: meetingInput.channelId,
          start_time: meetingInput.startTime,
          end_time: meetingInput.endTime,
          is_online: meetingInput.isOnline,
          meeting_url: meetingInput.meetingUrl,
          passcode: meetingInput.passcode,
          attendee_emails: (meetingInput.attendees || []).map((a) => a.email),
        },
        email
      )
      .then((serverMeeting) => {
        set((s) => ({
          meetings: s.meetings.map((m) => (m.id === tempId ? toMeeting(serverMeeting) : m)),
        }));
      })
      .catch((err) => {
        console.warn("[Workspace] Meeting creation fallback to local:", err);
      });
  },

  updateMeetingStatus: (id, status) => {
    set((s) => ({
      meetings: s.meetings.map((m) => (m.id === id ? { ...m, status } : m)),
    }));

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.updateMeetingStatus(id, status, email).catch((err) => {
      console.warn("[Workspace] Meeting status update fallback to local:", err);
    });
  },

  deleteMeeting: (id) => {
    set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.deleteMeeting(id, email).catch((err) => {
      console.warn("[Workspace] Meeting delete fallback to local:", err);
    });
  },

  addCallRecord: (callInput) => {
    const tempId = `call-rec-${Date.now()}`;
    const newRecord: CallRecord = {
      ...callInput,
      id: tempId,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ callRecords: [newRecord, ...s.callRecords] }));

    const email = get().currentUserId || "alex@airsend.io";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(callInput.receiverId)) return;
    workspaceApi
      .logCall(
        {
          receiver_email: callInput.receiverId,
          call_type: callInput.type,
          direction: callInput.direction,
          duration_seconds: callInput.duration,
          team_id: callInput.teamId,
        },
        email
      )
      .then((rec) => {
        set((s) => ({
          callRecords: s.callRecords.map((c) => (c.id === tempId ? toCallRecord(rec) : c)),
        }));
      })
      .catch((err) => {
        console.warn("[Workspace] Call log fallback to local:", err);
      });
  },

  startCall: (callId, title, displayName) => {
    set({
      activeCallId: callId,
      activeCallTitle: title || "Live Meeting Call",
      isMyCameraOn: true,
      isMyMicMuted: false,
      isMyScreenSharing: false,
      isMyHandRaised: false,
    });

    const email = get().currentUserId || "alex@airsend.io";
    const name = displayName?.trim() || (email ? email.split("@")[0] : "Guest");
    workspaceApi.joinCallRoom(callId, name, "attendee", email).catch(() => {});
  },

  leaveCall: () => {
    const activeCallId = get().activeCallId;
    if (activeCallId) {
      const email = get().currentUserId || "alex@airsend.io";
      workspaceApi.leaveCallRoom(activeCallId, email).catch(() => {});
    }
    set({
      activeCallId: null,
      activeCallTitle: null,
      isMyScreenSharing: false,
      isMyHandRaised: false,
    });
  },

  toggleCamera: () =>
    set((s) => {
      const next = !s.isMyCameraOn;
      if (s.activeCallId) {
        const email = s.currentUserId || "alex@airsend.io";
        workspaceApi.updateCallState(s.activeCallId, { is_camera_off: !next }, email).catch(() => {});
      }
      return { isMyCameraOn: next };
    }),

  toggleMic: () =>
    set((s) => {
      const next = !s.isMyMicMuted;
      if (s.activeCallId) {
        const email = s.currentUserId || "alex@airsend.io";
        workspaceApi.updateCallState(s.activeCallId, { is_muted: next }, email).catch(() => {});
      }
      return { isMyMicMuted: next };
    }),

  toggleScreenShare: () =>
    set((s) => {
      const next = !s.isMyScreenSharing;
      if (s.activeCallId) {
        const email = s.currentUserId || "alex@airsend.io";
        workspaceApi.updateCallState(s.activeCallId, { is_screen_sharing: next }, email).catch(() => {});
      }
      return { isMyScreenSharing: next };
    }),

  toggleHandRaise: () =>
    set((s) => {
      const next = !s.isMyHandRaised;
      if (s.activeCallId) {
        const email = s.currentUserId || "alex@airsend.io";
        workspaceApi.updateCallState(s.activeCallId, { is_hand_raised: next }, email).catch(() => {});
      }
      return { isMyHandRaised: next };
    }),

  deleteFile: (fileId) => {
    const removed = get().files.find((f) => f.id === fileId);
    set((s) => ({ files: s.files.filter((f) => f.id !== fileId) }));
    // Files in the files service: also remove the stored bytes (best effort; the record is removed below).
    if (removed?.fileId) {
      deleteWorkspaceFile(removed.fileId).catch(() => {});
    }

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.deleteFile(fileId, email).catch((err) => {
      console.warn("[Workspace] File delete fallback to local:", err);
    });
  },

  // -----------------------------------------------------------------------
  // User status actions
  // -----------------------------------------------------------------------

  myStatus: "online" as PresenceStatus,
  myCustomStatus: "",
  effectiveStatus: "online" as PresenceStatus,

  hydrateManualPresence: () => {
    const saved = loadManualPresence();
    set({ myStatus: saved.status, myCustomStatus: saved.custom });
  },
  setEffectiveStatus: (status) => set({ effectiveStatus: status }),
  setMyStatus: (status) => {
    set({ myStatus: status });
    saveManualPresence(status, get().myCustomStatus);
  },
  setMyCustomStatus: (text) => {
    set({ myCustomStatus: text });
    saveManualPresence(get().myStatus, text);
  },

  // -----------------------------------------------------------------------
  // API fetch actions — load real data from Go workspace server
  // -----------------------------------------------------------------------

  fetchTeams: async (email) => {
    const userEmail = email || get().currentUserId || "mullayam06@airsend.in";
    const hasTeams = get().teams.length > 0;
    set({ isLoading: !hasTeams, isLoadingTeams: !hasTeams, apiError: null, currentUserId: userEmail });
    try {
      const serverTeams = await workspaceApi.listTeams(userEmail);
      const teams = (serverTeams || []).map(toTeam);
      set((s) => {
        const nextActiveTeamId = teams.length > 0
          ? (teams.some((t) => t.id === s.activeTeamId) ? s.activeTeamId : teams[0].id)
          : null;
        return {
          teams,
          activeTeamId: nextActiveTeamId,
          isLoading: false,
          isLoadingTeams: false,
        };
      });

      if (teams.length > 0) {
        const activeId = get().activeTeamId ?? teams[0].id;
        void revalidate(`channels:${activeId}`, () => get().fetchChannels(activeId, userEmail));
        void revalidate(`members:${activeId}`, () => get().fetchMembers(activeId, userEmail));
        void revalidate(`meetings:${activeId}`, () => get().fetchMeetings(activeId));
        void revalidate(`files:${activeId}`, () => get().fetchFiles(activeId));
      }
    } catch (err) {
      set({ isLoading: false, isLoadingTeams: false, apiError: (err as Error).message });
    }
  },

  fetchChannels: async (teamId, email) => {
    if (!isValidUUID(teamId)) {
      set({ isLoadingChannels: false });
      return;
    }
    const userEmail = email || get().currentUserId || "mullayam06@airsend.in";
    set({ isLoadingChannels: !get().channels.some((c) => c.teamId === teamId) });
    try {
      const serverChannels = await workspaceApi.listChannels(teamId, userEmail);
      const channels = (serverChannels || []).map(toChannel);
      set((s) => {
        const currentActiveChannelId = s.activeChannelId;
        const channelBelongsToTeam = channels.some((c) => c.id === currentActiveChannelId);
        let nextActiveChannelId = currentActiveChannelId;
        if ((!channelBelongsToTeam || !isValidUUID(currentActiveChannelId)) && channels.length > 0) {
          const defaultChannel = channels.find((c) => c.isDefault) || channels[0];
          nextActiveChannelId = defaultChannel?.id || null;
        }

        const merged = channels.map((c) => {
          const prev = s.channels.find((x) => x.id === c.id);
          return prev ? { ...c, unreadCount: prev.unreadCount, isPinned: prev.isPinned } : c;
        });

        return {
          channels: [
            ...s.channels.filter((c) => c.teamId !== teamId),
            ...merged,
          ],
          activeChannelId: nextActiveChannelId,
          isLoadingChannels: false,
        };
      });
    } catch {
      set({ isLoadingChannels: false });
    }
  },

  fetchMembers: async (teamId, email) => {
    if (!isValidUUID(teamId)) return;
    const userEmail = email || get().currentUserId || "mullayam06@airsend.in";
    try {
      const serverMembers = await workspaceApi.listMembers(teamId, userEmail);
      const members = (serverMembers || []).map(toMember);
      set((s) => ({
        members: [
          ...s.members.filter((m) => m.teamId !== teamId),
          ...members,
        ],
      }));
    } catch {
      // Empty members
    }
  },

  updateMemberRole: async (teamId, memberEmail, role, actorEmail) => {
    set((s) => ({
      members: s.members.map((m) =>
        m.teamId === teamId &&
        (m.email?.toLowerCase() === memberEmail.toLowerCase() || m.userId === memberEmail)
          ? { ...m, role }
          : m
      ),
    }));

    if (isValidUUID(teamId) && actorEmail) {
      try {
        await workspaceApi.changeMemberRole(teamId, memberEmail, role, actorEmail);
        return true;
      } catch (err) {
        console.error("Failed to update member role on server", err);
        return false;
      }
    }
    return true;
  },

  removeMember: async (teamId, memberEmail, actorEmail) => {
    set((s) => ({
      members: s.members.filter(
        (m) =>
          !(
            m.teamId === teamId &&
            (m.email?.toLowerCase() === memberEmail.toLowerCase() || m.userId === memberEmail)
          )
      ),
    }));

    if (isValidUUID(teamId) && actorEmail) {
      try {
        await workspaceApi.removeMember(teamId, memberEmail, actorEmail);
        return true;
      } catch (err) {
        console.error("Failed to remove member on server", err);
        return false;
      }
    }
    return true;
  },

  fetchMessages: async (channelId, email) => {
    if (!isValidUUID(channelId)) {
      set({ isLoadingMessages: false });
      return;
    }
    let hasLocal = serverOnly(get().messages).some((m) => m.channelId === channelId);
    if (!hasLocal) {
      const cached = await loadCachedChannelMessages(channelId);
      if (cached.length && !serverOnly(get().messages).some((m) => m.channelId === channelId)) {
        set((s) => ({ messages: [...s.messages, ...cached] }));
        hasLocal = true;
      }
    }
    set({ isLoadingMessages: !hasLocal });
    try {
      const since = hasLocal ? newestChange(serverOnly(get().messages.filter((m) => m.channelId === channelId))) : null;
      if (since) {
        let cursor = since;
        let caughtUp = false;
        for (let round = 0; round < 5; round++) {
          const res = await workspaceApi.listMessagesSince(channelId, email, cursor);
          const incoming = (res.items ?? []).map(toMessage);
          const seen = new Set(get().messages.filter((m) => m.channelId === channelId).map((m) => m.id));
          set((s) => ({
            messages: [
              ...s.messages.filter((m) => m.channelId !== channelId),
              // Keeps attachments still uploading (placeholders) on messages the server has without them yet.
              ...mergeIncomingDM(s.messages.filter((m) => m.channelId === channelId), incoming),
            ],
          }));
          for (const m of incoming) if (!seen.has(m.id)) get().noteIncoming(channelId, m);
          if (!res.has_more || !incoming.length) {
            caughtUp = true;
            break;
          }
          cursor = newestChange(incoming) ?? cursor;
        }
        if (caughtUp) {
          set({ isLoadingMessages: false });
          if (get().activeChannelId === channelId) get().markRead(channelId);
          return;
        }
      }
      const res = await workspaceApi.listMessages(channelId, email, 100);
      const msgs = (res.items ?? []).map(toMessage);
      set((s) => ({
        messages: [
          ...s.messages.filter((m) => m.channelId !== channelId),
          // Unsent (outbox) messages and in-flight uploads survive the refresh.
          ...mergeDMMessages(s.messages.filter((m) => m.channelId === channelId), msgs),
        ],
        messageCursors: { ...s.messageCursors, [channelId]: res.next_cursor ?? "" },
        messageHasMore: { ...s.messageHasMore, [channelId]: res.has_more ?? false },
        isLoadingMessages: false,
      }));
      if (get().activeChannelId === channelId) get().markRead(channelId);
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  fetchOlderMessages: async (channelId, email) => {
    if (!isValidUUID(channelId)) return;
    const { messageCursors, messageHasMore, isLoadingOlder } = get();
    if (isLoadingOlder) return;
    if (!messageHasMore[channelId]) return;
    const cursor = messageCursors[channelId];
    if (!cursor) return;
    set({ isLoadingOlder: true });
    try {
      const res = await workspaceApi.listMessages(channelId, email, 100, cursor);
      const older = (res.items ?? []).map(toMessage);
      const olderIds = new Set(older.map((o) => o.id));
      set((s) => {
        const existing = s.messages.filter((m) => m.channelId !== channelId || !olderIds.has(m.id));
        const merged = [...older, ...existing].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return {
          messages: merged,
          messageCursors: { ...s.messageCursors, [channelId]: res.next_cursor ?? "" },
          messageHasMore: { ...s.messageHasMore, [channelId]: res.has_more ?? false },
          isLoadingOlder: false,
        };
      });
    } catch {
      set({ isLoadingOlder: false });
    }
  },

  fetchDMs: async (email) => {
    const userEmail = email || get().currentUserId || "mullayam06@airsend.in";
    try {
      const serverDMs = await workspaceApi.listDMs(userEmail);
      const dms = (serverDMs || []).map(toDM);
      set((s) => ({
        directMessages: dms.map((d) => {
          const prev = s.directMessages.find((x) => x.id === d.id);
          return prev ? { ...d, unreadCount: prev.unreadCount } : d;
        }),
      }));
    } catch {
      return;
    }
  },

  fetchMeetings: async (teamId) => {
    const email = get().currentUserId || "mullayam06@airsend.in";
    if (teamId && !isValidUUID(teamId)) return;
    try {
      const res = teamId
        ? await workspaceApi.listTeamMeetings(teamId, email)
        : await workspaceApi.listMyMeetings(email);
      const meetings = (res || []).map(toMeeting);
      set({ meetings });
    } catch {
      return;
    }
  },

  fetchTasks: async (_teamId) => {
    // Tasks are handled in a dedicated tasks service/repo; workspace backend calls decoupled
  },

  fetchFiles: async (teamId) => {
    const targetTeam = teamId || get().activeTeamId;
    if (!targetTeam || !isValidUUID(targetTeam)) return;
    const email = get().currentUserId || "mullayam06@airsend.in";
    try {
      const res = await workspaceApi.listTeamFiles(targetTeam, email);
      const files = (res || []).map(toWorkspaceFile);
      set({ files });
    } catch {
      return;
    }
  },

  fetchCalls: async () => {
    const email = get().currentUserId || "mullayam06@airsend.in";
    try {
      const res = await workspaceApi.listCallHistory(email);
      const callRecords = (res || []).map(toCallRecord);
      set({ callRecords });
    } catch {
      return;
    }
  },

  fetchNotifications: async () => {
    const email = get().currentUserId || "mullayam06@airsend.in";
    try {
      const res = await workspaceApi.listNotifications(email);
      set({
        notifications: (res || []).map((n) => ({
          id: n.id,
          type: (n.type === "meeting.invite" ? "meeting_invite" : n.type === "call.missed" ? "call_missed" : n.type === "task.assigned" ? "task_assigned" : "system") as ChatNotification["type"],
          teamId: get().activeTeamId || "026bd7c8-beb7-4a3d-96b6-6b3e162ead91",
          fromUserId: n.recipient_email,
          fromUserName: n.title,
          content: n.body || n.title,
          isRead: n.is_read,
          createdAt: n.created_at,
        })),
      });
    } catch {
      return;
    }
  },

  // -----------------------------------------------------------------------
  // Workflows & Automations Engine
  // -----------------------------------------------------------------------

  fetchWorkflows: async (teamId) => {
    const tId = teamId || get().activeTeamId;
    if (!tId || !isValidUUID(tId)) return;
    const email = get().currentUserId;
    if (!email) return;
    try {
      const res = await workspaceApi.listWorkflows(tId, email);
      if (Array.isArray(res) && res.length > 0) {
        set({
          workflows: res.map((w: any) => ({
            id: w.id,
            teamId: w.team_id,
            name: w.name,
            description: w.description,
            triggerType: w.trigger_type,
            triggerConfig: w.trigger_config || {},
            actions: w.actions || [],
            isActive: w.is_active,
            webhookToken: w.webhook_token,
            runCount: w.run_count || 0,
            lastRunAt: w.last_run_at,
            createdBy: w.created_by,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          })),
        });
      }
    } catch {
      // Fallback kept
    }
  },

  fetchWorkflowRuns: async (teamId) => {
    const tId = teamId || get().activeTeamId || "t-1";
    const email = get().currentUserId || "alex@airsend.io";
    try {
      const res = await workspaceApi.listTeamWorkflowRuns(tId, email);
      if (Array.isArray(res) && res.length > 0) {
        set({
          workflowRuns: res.map((r: any) => ({
            id: r.id,
            workflowId: r.workflow_id,
            teamId: r.team_id,
            triggerType: r.trigger_type,
            triggerPayload: r.trigger_payload || {},
            status: r.status,
            actionsExecuted: r.actions_executed || [],
            logs: r.logs || "",
            durationMs: r.duration_ms || 0,
            executedAt: r.executed_at,
          })),
        });
      }
    } catch {
      // Fallback kept
    }
  },

  addWorkflow: async (wfData) => {
    const tId = wfData.teamId || get().activeTeamId || "t-1";
    const email = get().currentUserId || "alex@airsend.io";
    const tempId = `wf-temp-${Date.now()}`;
    const newWf: Workflow = {
      id: tempId,
      teamId: tId,
      name: wfData.name,
      description: wfData.description,
      triggerType: wfData.triggerType,
      triggerConfig: wfData.triggerConfig || {},
      actions: wfData.actions || [],
      isActive: wfData.isActive !== false,
      runCount: 0,
      createdBy: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ workflows: [newWf, ...s.workflows] }));
    try {
      const res = await workspaceApi.createWorkflow(tId, {
        name: wfData.name,
        description: wfData.description,
        trigger_type: wfData.triggerType,
        trigger_config: wfData.triggerConfig,
        actions: wfData.actions,
        is_active: wfData.isActive !== false,
      }, email);
      if (res && res.id) {
        set((s) => ({
          workflows: s.workflows.map((w) => (w.id === tempId ? {
            ...w,
            id: res.id,
            webhookToken: res.webhook_token,
          } : w)),
        }));
      }
    } catch {
      // Keep optimistic
    }
  },

  updateWorkflow: async (id, updates) => {
    const tId = get().activeTeamId || "t-1";
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({
      workflows: s.workflows.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w)),
    }));
    try {
      await workspaceApi.updateWorkflow(id, tId, {
        name: updates.name,
        description: updates.description,
        trigger_type: updates.triggerType,
        trigger_config: updates.triggerConfig,
        actions: updates.actions,
        is_active: updates.isActive,
      }, email);
    } catch {
      // Keep optimistic
    }
  },

  deleteWorkflow: async (id) => {
    const tId = get().activeTeamId || "t-1";
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({ workflows: s.workflows.filter((w) => w.id !== id) }));
    try {
      await workspaceApi.deleteWorkflow(id, tId, email);
    } catch {
      // Keep optimistic
    }
  },

  toggleWorkflow: async (id) => {
    const tId = get().activeTeamId || "t-1";
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({
      workflows: s.workflows.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w)),
    }));
    try {
      await workspaceApi.toggleWorkflow(id, tId, email);
    } catch {
      // Keep optimistic
    }
  },

  addWorkflowRun: (run) => {
    set((s) => ({ workflowRuns: [run, ...s.workflowRuns] }));
  },

  updateChannel: async (channelId, updates) => {
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({
      channels: s.channels.map((c) => (c.id === channelId ? { ...c, ...updates } : c)),
    }));
    try {
      const saved = await workspaceApi.updateChannel(channelId, updates, email);
      if (saved) {
        // Adopt what the server resolved (OpenFGA tuples + channel policy) so
        // permission gating never runs on stale optimistic data.
        const c = toChannel(saved);
        set((s) => ({
          channels: s.channels.map((ch) =>
            ch.id === channelId
              ? {
                  ...ch,
                  isLocked: c.isLocked,
                  isArchived: c.isArchived,
                  postingPermission: c.postingPermission,
                  permissions: c.permissions ?? ch.permissions,
                  rolePermissions: c.rolePermissions ?? ch.rolePermissions,
                  effectivePermissions: c.effectivePermissions ?? ch.effectivePermissions,
                  updatedAt: c.updatedAt,
                }
              : ch,
          ),
        }));
      }
    } catch {
      // Keep optimistic
    }
  },

  deleteChannel: async (channelId) => {
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({
      channels: s.channels.filter((c) => c.id !== channelId),
    }));
    try {
      await workspaceApi.deleteChannel(channelId, email);
    } catch {
      // Keep optimistic
    }
  },

  updateTeam: async (teamId, updates) => {
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
    }));
    try {
      await workspaceApi.updateTeam(teamId, updates, email);
    } catch {
      // Keep optimistic
    }
  },

  deleteTeam: async (teamId) => {
    const email = get().currentUserId || "alex@airsend.io";
    set((s) => ({
      teams: s.teams.filter((t) => t.id !== teamId),
    }));
    try {
      await workspaceApi.deleteTeam(teamId, email);
    } catch {
      // Keep optimistic
    }
  },

  // -----------------------------------------------------------------------
  // Selectors
  // -----------------------------------------------------------------------

  getTeamChannels: (teamId) =>
    get().channels.filter((c) => c.teamId === teamId),

  getChannelMessages: (channelId) =>
    get()
      .messages.filter((m) => m.channelId === channelId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),

  getTeamMembers: (teamId) =>
    get().members.filter((m) => m.teamId === teamId),

  getUnreadNotificationCount: () =>
    get().notifications.filter((n) => !n.isRead).length,

  };
});
