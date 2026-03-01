// ============================================================================
// Teams & Chat Zustand Store — with API integration
// ============================================================================

import { create, type StoreApi, type UseBoundStore } from "zustand";
import type {
  Team,
  Channel,
  TeamMember,
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
} from "./chat-types";
import {
  CURRENT_USER_ID,
  MOCK_TEAMS,
  MOCK_CHANNELS,
  MOCK_MEMBERS,
  MOCK_MESSAGES,
  MOCK_THREAD_REPLIES,
  MOCK_DMS,
  MOCK_NOTIFICATIONS,
  MOCK_TASKS,
} from "./mock-data";
import {
  workspaceApi,
  toTeam,
  toChannel,
  toMember,
  toMessage,
  toDM,
  toPoll,
} from "./api";

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface ChatStore {
  // Data
  teams: Team[];
  channels: Channel[];
  members: TeamMember[];
  messages: ChatMessage[];
  threadReplies: ChatMessage[];
  directMessages: DirectMessage[];
  notifications: ChatNotification[];
  tasks: ChatTask[];
  typingIndicators: TypingIndicator[];

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
  deleteMessage: (messageId: string) => void;
  pinMessage: (messageId: string, isPublic: boolean) => void;
  unpinMessage: (messageId: string) => void;
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
  setMyStatus: (status: PresenceStatus) => void;
  setMyCustomStatus: (text: string) => void;

  // Actions — API integration
  fetchTeams: (email: string) => Promise<void>;
  fetchChannels: (teamId: string, email: string) => Promise<void>;
  fetchMembers: (teamId: string, email: string) => Promise<void>;
  fetchMessages: (channelId: string, email: string) => Promise<void>;
  fetchDMs: (email: string) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;

  // Selectors
  getTeamChannels: (teamId: string) => Channel[];
  getChannelMessages: (channelId: string) => ChatMessage[];
  getTeamMembers: (teamId: string) => TeamMember[];
  getUnreadNotificationCount: () => number;
  getPendingTaskCount: () => number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type { ChatStore };

export const useChatStore: UseBoundStore<StoreApi<ChatStore>> = create<ChatStore>()((set, get) => ({
  // Data — initialized with mock data
  teams: MOCK_TEAMS,
  channels: MOCK_CHANNELS,
  members: MOCK_MEMBERS,
  messages: MOCK_MESSAGES,
  threadReplies: MOCK_THREAD_REPLIES,
  directMessages: MOCK_DMS,
  notifications: MOCK_NOTIFICATIONS,
  tasks: MOCK_TASKS,
  typingIndicators: [],

  // Selection
  activeTeamId: MOCK_TEAMS[0]?.id || null,
  activeChannelId: MOCK_CHANNELS[0]?.id || null,
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
  apiError: null,

  currentUserId: CURRENT_USER_ID,

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
  },

  addTeam: (team) =>
    set((s) => ({
      teams: [...s.teams, team],
      channels: [
        ...s.channels,
        {
          id: `ch-${Date.now()}-1`,
          teamId: team.id,
          name: "general",
          description: "General discussion",
          type: "text" as const,
          visibility: "public" as const,
          isPinned: false,
          isDefault: true,
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
        },
        {
          id: `ch-${Date.now()}-2`,
          teamId: team.id,
          name: "announcements",
          description: "Team announcements",
          type: "announcement" as const,
          visibility: "public" as const,
          isPinned: true,
          isDefault: true,
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
        },
      ],
    })),

  // -----------------------------------------------------------------------
  // Channel actions
  // -----------------------------------------------------------------------

  setActiveChannel: (channelId) =>
    set({
      activeChannelId: channelId,
      activeDmId: null,
      activeThreadMessageId: null,
      sidePanelView: null,
      replyingTo: null,
      editingMessageId: null,
    }),

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

  sendMessage: (content, mentions = [], attachments = [], priority = "normal") => {
    const { activeChannelId, currentUserId, messages: allMsgs } = get();
    if (!activeChannelId || !content.trim()) return;

    // Ensure the new message timestamp is always after the latest message in
    // the channel so it sorts to the bottom (mock data may have future UTC times).
    const channelMsgs = allMsgs.filter((m) => m.channelId === activeChannelId);
    const latestTs = channelMsgs.reduce(
      (max, m) => Math.max(max, new Date(m.createdAt).getTime()),
      0,
    );
    const now = Date.now();
    const createdAt = new Date(Math.max(now, latestTs + 1)).toISOString();

    const newMsg: ChatMessage = {
      id: `msg-${now}`,
      channelId: activeChannelId,
      authorId: currentUserId,
      authorName: "You",
      content: content.trim(),
      type: "text",
      priority,
      createdAt,
      isEdited: false,
      isPinned: false,
      isPinnedPublic: false,
      replyTo: get().replyingTo
        ? {
            messageId: get().replyingTo!.id,
            authorId: get().replyingTo!.authorId,
            authorName: get().replyingTo!.authorName,
            content:
              get().replyingTo!.content.length > 80
                ? get().replyingTo!.content.slice(0, 80) + "..."
                : get().replyingTo!.content,
          }
        : undefined,
      mentions,
      reactions: [],
      attachments,
      threadReplyCount: 0,
      isDeleted: false,
    };

    set((s) => ({
      messages: [...s.messages, newMsg],
      replyingTo: null,
    }));
  },

  editMessage: (messageId, newContent) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: newContent,
              isEdited: true,
              editedAt: new Date().toISOString(),
            }
          : m,
      ),
      editingMessageId: null,
    })),

  deleteMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, isDeleted: true, content: "This message has been deleted." }
          : m,
      ),
    })),

  pinMessage: (messageId, isPublic) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, isPinned: true, isPinnedPublic: isPublic }
          : m,
      ),
    })),

  unpinMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, isPinned: false, isPinnedPublic: false }
          : m,
      ),
    })),

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
  },

  setReplyingTo: (message) => set({ replyingTo: message, editingMessageId: null }),
  setEditingMessage: (messageId) => set({ editingMessageId: messageId, replyingTo: null }),

  // -----------------------------------------------------------------------
  // Thread actions
  // -----------------------------------------------------------------------

  openThread: (messageId) =>
    set({
      activeThreadMessageId: messageId,
      sidePanelView: "thread",
    }),

  closeThread: () =>
    set({
      activeThreadMessageId: null,
      sidePanelView: null,
    }),

  sendThreadReply: (content, mentions = []) => {
    const { activeThreadMessageId, activeChannelId, currentUserId } = get();
    if (!activeThreadMessageId || !activeChannelId || !content.trim()) return;

    const newReply: ChatMessage = {
      id: `tr-${Date.now()}`,
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
      threadReplies: [...s.threadReplies, newReply],
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
  },

  // -----------------------------------------------------------------------
  // DM actions
  // -----------------------------------------------------------------------

  setActiveDm: (dmId) =>
    set({
      activeDmId: dmId,
      activeChannelId: null,
      activeThreadMessageId: null,
      sidePanelView: null,
    }),

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

  markNotificationRead: (notificationId) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      ),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  // -----------------------------------------------------------------------
  // User status actions
  // -----------------------------------------------------------------------

  myStatus: "online" as PresenceStatus,
  myCustomStatus: "",

  setMyStatus: (status) => set({ myStatus: status }),
  setMyCustomStatus: (text) => set({ myCustomStatus: text }),

  // -----------------------------------------------------------------------
  // API fetch actions — load real data from Go workspace server
  // -----------------------------------------------------------------------

  fetchTeams: async (email) => {
    set({ isLoading: true, apiError: null });
    try {
      const serverTeams = await workspaceApi.listTeams(email);
      const teams = serverTeams.map(toTeam);
      set((s) => ({
        teams: teams.length > 0 ? teams : s.teams,
        activeTeamId: teams[0]?.id ?? s.activeTeamId,
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, apiError: (err as Error).message });
    }
  },

  fetchChannels: async (teamId, email) => {
    try {
      const serverChannels = await workspaceApi.listChannels(teamId, email);
      const channels = serverChannels.map(toChannel);
      set((s) => ({
        channels: [
          ...s.channels.filter((c) => c.teamId !== teamId),
          ...channels,
        ],
      }));
    } catch {
      // Keep existing channels on failure
    }
  },

  fetchMembers: async (teamId, email) => {
    try {
      const serverMembers = await workspaceApi.listMembers(teamId, email);
      const members = serverMembers.map(toMember);
      set((s) => ({
        members: [
          ...s.members.filter((m) => m.teamId !== teamId),
          ...members,
        ],
      }));
    } catch {
      // Keep existing members on failure
    }
  },

  fetchMessages: async (channelId, email) => {
    try {
      const res = await workspaceApi.listMessages(channelId, email);
      const msgs = res.items.map(toMessage);
      set((s) => ({
        messages: [
          ...s.messages.filter((m) => m.channelId !== channelId),
          ...msgs,
        ],
      }));
    } catch {
      // Keep existing messages on failure
    }
  },

  fetchDMs: async (email) => {
    try {
      const serverDMs = await workspaceApi.listDMs(email);
      const dms = serverDMs.map(toDM);
      set((s) => ({
        directMessages: dms.length > 0 ? dms : s.directMessages,
      }));
    } catch {
      // Keep existing DMs on failure
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

  getPendingTaskCount: () =>
    get().tasks.filter((t) => t.status !== "done").length,
}));
