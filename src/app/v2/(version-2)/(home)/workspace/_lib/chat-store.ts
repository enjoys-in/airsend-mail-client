// ============================================================================
// Teams & Chat Zustand Store — real API integration
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
  Meeting,
  CallRecord,
  LiveCallParticipant,
  WorkspaceFile,
  Workflow,
  WorkflowRun,
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
  messageCursors: Record<string, string>; // channelId → next cursor
  messageHasMore: Record<string, boolean>; // channelId → has more pages
  isLoadingOlder: boolean;
  threadReplies: ChatMessage[];
  directMessages: DirectMessage[];
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
  startCall: (callId: string, title?: string) => void;
  leaveCall: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => void;
  toggleHandRaise: () => void;

  // Actions — Files
  addFile: (file: Omit<WorkspaceFile, "id" | "createdAt" | "updatedAt" | "downloadCount">) => void;
  deleteFile: (fileId: string) => void;

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
  getPendingTaskCount: () => number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type { ChatStore };

export const useChatStore: UseBoundStore<StoreApi<ChatStore>> = create<ChatStore>()((set, get) => ({
  // Data — initialized with rich workspace data, enhanced by live API
  teams: MOCK_TEAMS,
  channels: MOCK_CHANNELS,
  members: MOCK_MEMBERS,
  messages: MOCK_MESSAGES,
  messageCursors: {},
  messageHasMore: {},
  isLoadingOlder: false,
  threadReplies: [],
  directMessages: MOCK_DMS,
  notifications: MOCK_NOTIFICATIONS,
  tasks: MOCK_TASKS,
  typingIndicators: [],

  // Microsoft Teams Features
  meetings: MOCK_MEETINGS,
  callRecords: MOCK_CALL_RECORDS,
  files: MOCK_FILES,
  callParticipants: MOCK_LIVE_PARTICIPANTS,

  // Workflows & Automations Engine
  workflows: MOCK_WORKFLOWS,
  workflowRuns: MOCK_WORKFLOW_RUNS,

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
  activeTeamId: "t-1",
  activeChannelId: "ch-1",
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

  addTeam: (team) => {
    set((s) => ({ teams: [...s.teams, team] }));
  },

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
    const { activeChannelId, currentUserId, _ws } = get();
    if (!activeChannelId || !content.trim() || !currentUserId) return;

    // Optimistic local message
    const now = Date.now();
    const tempId = `temp-${now}`;
    const optimistic: ChatMessage = {
      id: tempId,
      channelId: activeChannelId,
      authorId: currentUserId,
      authorName: "You",
      content: content.trim(),
      type: "text",
      priority,
      createdAt: new Date(now).toISOString(),
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
      messages: [...s.messages, optimistic],
      replyingTo: null,
    }));

    const parentId = get().replyingTo?.id;

    // Send via WebSocket (preferred) or fallback to HTTP
    if (_ws && _ws.readyState === WebSocket.OPEN) {
      _ws.send(
        JSON.stringify({
          type: "message.send",
          payload: {
            channel_id: activeChannelId,
            content: content.trim(),
            type: "text",
            priority,
            parent_id: parentId ?? null,
            mentions,
            temp_id: tempId,
          },
        }),
      );
      // message.ack from server will replace the temp message
    } else {
      // Fallback: HTTP POST
      workspaceApi
        .sendMessage(
          activeChannelId,
          {
            content: content.trim(),
            type: "text",
            priority,
            parent_id: parentId,
            mentions,
          },
          currentUserId,
        )
        .then((serverMsg) => {
          const real = toMessage(serverMsg);
          set((s) => ({
            messages: s.messages.map((m) => (m.id === tempId ? real : m)),
          }));
        })
        .catch(() => {
          set((s) => ({
            messages: s.messages.filter((m) => m.id !== tempId),
            apiError: "Failed to send message",
          }));
        });
    }
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

  deleteMessage: (messageId) => {
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
    workspaceApi.deleteMessage(messageId, currentUserId).catch(() => {
      if (msg?.channelId) get().fetchMessages(msg.channelId, currentUserId);
    });
  },

  pinMessage: (messageId, isPublic) => {
    const { currentUserId } = get();
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: true, isPinnedPublic: isPublic } : m,
      ),
    }));
    workspaceApi.pinMessage(messageId, true, currentUserId).catch(() => {});
  },

  unpinMessage: (messageId) => {
    const { currentUserId } = get();
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: false, isPinnedPublic: false } : m,
      ),
    }));
    workspaceApi.pinMessage(messageId, false, currentUserId).catch(() => {});
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

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi
      .createTask(
        taskInput.teamId || null,
        {
          title: taskInput.title,
          description: taskInput.description,
          channel_id: taskInput.channelId,
          assignee_email: taskInput.assigneeId,
          status: taskInput.status,
          priority: taskInput.priority,
          due_date: taskInput.dueDate,
        },
        email
      )
      .then((serverTask) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === tempId ? toChatTask(serverTask) : t)),
        }));
      })
      .catch((err) => {
        console.warn("[Workspace] Task creation fallback to local:", err);
      });
  },

  updateTaskStatus: (taskId, status) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.updateTaskStatus(taskId, status, email).catch((err) => {
      console.warn("[Workspace] Task status update fallback to local:", err);
    });
  },

  deleteTask: (taskId) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.deleteTask(taskId, email).catch((err) => {
      console.warn("[Workspace] Task delete fallback to local:", err);
    });
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

  startCall: (callId, title) => {
    set({
      activeCallId: callId,
      activeCallTitle: title || "Live Meeting Call",
      isMyCameraOn: true,
      isMyMicMuted: false,
      isMyScreenSharing: false,
      isMyHandRaised: false,
    });

    const email = get().currentUserId || "alex@airsend.io";
    workspaceApi.joinCallRoom(callId, "Alex Rivera", "attendee", email).catch(() => {});
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

  addFile: (fileInput) => {
    const now = new Date().toISOString();
    const newFile: WorkspaceFile = {
      ...fileInput,
      id: `file-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      downloadCount: 0,
    };
    set((s) => ({ files: [newFile, ...s.files] }));
  },

  deleteFile: (fileId) => {
    set((s) => ({ files: s.files.filter((f) => f.id !== fileId) }));

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

  setMyStatus: (status) => {
    set({ myStatus: status });
    const { activeTeamId, currentUserId, myCustomStatus } = get();
    if (activeTeamId && currentUserId) {
      workspaceApi.updateMyStatus(activeTeamId, status, myCustomStatus, currentUserId).catch(() => {});
    }
  },
  setMyCustomStatus: (text) => {
    set({ myCustomStatus: text });
    const { activeTeamId, currentUserId, myStatus } = get();
    if (activeTeamId && currentUserId) {
      workspaceApi.updateMyStatus(activeTeamId, myStatus, text, currentUserId).catch(() => {});
    }
  },

  // -----------------------------------------------------------------------
  // API fetch actions — load real data from Go workspace server
  // -----------------------------------------------------------------------

  fetchTeams: async (email) => {
    set({ isLoading: true, isLoadingTeams: true, apiError: null, currentUserId: email });
    try {
      const serverTeams = await workspaceApi.listTeams(email);
      const teams = serverTeams.map(toTeam);
      set((s) => ({
        teams: teams.length > 0 ? teams : s.teams,
        activeTeamId: teams[0]?.id ?? s.activeTeamId,
        isLoading: false,
        isLoadingTeams: false,
      }));
    } catch (err) {
      set({ isLoading: false, isLoadingTeams: false, apiError: (err as Error).message });
    }
  },

  fetchChannels: async (teamId, email) => {
    set({ isLoadingChannels: true });
    try {
      const serverChannels = await workspaceApi.listChannels(teamId, email);
      const channels = serverChannels.map(toChannel);
      set((s) => ({
        channels: [
          ...s.channels.filter((c) => c.teamId !== teamId),
          ...channels,
        ],
        isLoadingChannels: false,
      }));
    } catch {
      set({ isLoadingChannels: false });
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
    set({ isLoadingMessages: true });
    try {
      const res = await workspaceApi.listMessages(channelId, email, 100);
      const msgs = (res.items ?? []).map(toMessage);
      set((s) => ({
        messages: [
          ...s.messages.filter((m) => m.channelId !== channelId),
          ...msgs,
        ],
        messageCursors: { ...s.messageCursors, [channelId]: res.next_cursor ?? "" },
        messageHasMore: { ...s.messageHasMore, [channelId]: res.has_more ?? false },
        isLoadingMessages: false,
      }));
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  fetchOlderMessages: async (channelId, email) => {
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

  fetchMeetings: async (teamId) => {
    const email = get().currentUserId || "alex@airsend.io";
    try {
      const res = teamId
        ? await workspaceApi.listTeamMeetings(teamId, email)
        : await workspaceApi.listMyMeetings(email);
      const meetings = res.map(toMeeting);
      if (meetings.length > 0) {
        set({ meetings });
      }
    } catch {
      // Fallback kept
    }
  },

  fetchTasks: async (teamId) => {
    const email = get().currentUserId || "alex@airsend.io";
    try {
      const res = teamId
        ? await workspaceApi.listTeamTasks(teamId, email)
        : await workspaceApi.listMyTasks(email);
      const tasks = res.map(toChatTask);
      if (tasks.length > 0) {
        set({ tasks });
      }
    } catch {
      // Fallback kept
    }
  },

  fetchFiles: async (teamId) => {
    const targetTeam = teamId || get().activeTeamId || "team-1";
    const email = get().currentUserId || "alex@airsend.io";
    try {
      const res = await workspaceApi.listTeamFiles(targetTeam, email);
      const files = res.map(toWorkspaceFile);
      if (files.length > 0) {
        set({ files });
      }
    } catch {
      // Fallback kept
    }
  },

  fetchCalls: async () => {
    const email = get().currentUserId || "alex@airsend.io";
    try {
      const res = await workspaceApi.listCallHistory(email);
      const callRecords = res.map(toCallRecord);
      if (callRecords.length > 0) {
        set({ callRecords });
      }
    } catch {
      // Fallback kept
    }
  },

  fetchNotifications: async () => {
    const email = get().currentUserId || "alex@airsend.io";
    try {
      const res = await workspaceApi.listNotifications(email);
      if (res.length > 0) {
        set({
          notifications: res.map((n) => ({
            id: n.id,
            type: (n.type === "meeting.invite" ? "meeting_invite" : n.type === "call.missed" ? "call_missed" : n.type === "task.assigned" ? "task_assigned" : "system") as ChatNotification["type"],
            teamId: get().activeTeamId || "team-1",
            fromUserId: n.recipient_email,
            fromUserName: n.title,
            content: n.body || n.title,
            isRead: n.is_read,
            createdAt: n.created_at,
          })),
        });
      }
    } catch {
      // Fallback kept
    }
  },

  // -----------------------------------------------------------------------
  // Workflows & Automations Engine
  // -----------------------------------------------------------------------

  fetchWorkflows: async (teamId) => {
    const tId = teamId || get().activeTeamId || "t-1";
    const email = get().currentUserId || "alex@airsend.io";
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
      await workspaceApi.updateChannel(channelId, updates, email);
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

  getPendingTaskCount: () =>
    get().tasks.filter((t) => t.status !== "done").length,
}));
