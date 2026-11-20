// ============================================================================
// useWorkspaceWS — WebSocket hook for real-time workspace updates
// ============================================================================

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "./chat-store";
import { useVoiceStore } from "./voice-store";
import { useAccessStore } from "./access-store";
import {
  getWorkspaceWsUrl,
  getAuthToken,
  isValidUUID,
  toMessage,
  toDMMessage,
  toAttachment,
  toTeam,
  toChannel,
  toMeeting,
  toCallRecord,
  toLiveCallParticipant,
  toWorkspaceFile,
  toChatTask,
} from "./api";
import type { ServerMessage, ServerDMMessage, ServerAttachment } from "./api";
import { removeOutbox } from "./workspace-cache";
import { refreshMyTasks } from "../../tasks/_lib/my-tasks-store";

interface WSIncoming {
  event: string;
  channel?: string;
  team?: string; // set on team broadcasts
  data: any;
}

export function useWorkspaceWS(email: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(true);
  const everOpenedRef = useRef(false);

  const connect = useCallback(() => {
    if (!email || !mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // The server authenticates the upgrade with the access_token cookie;
      // browsers can't set headers on WebSockets, so the token also goes in
      // the query when it is readable (never the email — identity comes
      // from the token).
      const baseWs = getWorkspaceWsUrl().replace(/\/+$/, "");
      const token = getAuthToken();
      const url = token ? `${baseWs}/ws?token=${encodeURIComponent(token)}` : `${baseWs}/ws`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Store WS ref in Zustand so sendMessage can use it
        useChatStore.getState().setWS(ws);

        // Subscribe to all teams and channels the user has (the server
        // checks each one and answers subscribe.denied when not allowed).
        const { teams, channels } = useChatStore.getState();
        subscribeAll(ws, "team", teams.map((t) => t.id));
        subscribeAll(ws, "channel", channels.map((c) => c.id));

        // After a reconnect, anything sent while the socket was down is missing: pull the open conversation's delta
        // and send whatever was queued offline.
        const chat = useChatStore.getState();
        if (everOpenedRef.current) {
          if (chat.activeChannelId) void chat.fetchMessages(chat.activeChannelId, chat.currentUserId);
          if (chat.activeDmId) void chat.fetchDMMessages(chat.activeDmId);
          refreshAfterReconnect();
        }
        everOpenedRef.current = true;
        void chat.flushOutbox();
      };

      ws.onmessage = (ev) => {
        try {
          const msg: WSIncoming = JSON.parse(ev.data);
          handleWSEvent(msg);
        } catch {
          // ignore non-JSON
        }
      };

      ws.onclose = (ev) => {
        useChatStore.getState().setWS(null);
        if (mountedRef.current) {
          // 4001: the session token expired — reconnect right away with
          // the refreshed cookie, and refetch what may have changed.
          const expired = ev.code === 4001;
          if (expired) refreshAfterReconnect();
          reconnectRef.current = setTimeout(connect, expired ? 500 : 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.error("[Workspace WS] Connection error:", err);
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, 5000);
      }
    }
  }, [email]);

  // Subscribe to new channels / teams when they change
  const subscribeTo = useCallback((kind: "team" | "channel", ids: string[]) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    subscribeAll(ws, kind, ids);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      const ws = wsRef.current;
      wsRef.current = null;
      if (!ws) return;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      if (useChatStore.getState()._ws === ws) useChatStore.getState().setWS(null);
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close();
      } else {
        ws.close();
      }
    };
  }, [connect]);

  // Re-subscribe when channels or teams change (teams usually load after
  // the socket opens, so team events would otherwise never arrive).
  useEffect(() => {
    const initial = useChatStore.getState();
    let prevChannels = initial.channels.map((c) => c.id).join(",");
    let prevTeams = initial.teams.map((t) => t.id).join(",");
    const unsub = useChatStore.subscribe((state) => {
      const channelIds = state.channels.map((c) => c.id).join(",");
      if (channelIds !== prevChannels) {
        prevChannels = channelIds;
        subscribeTo("channel", state.channels.map((c) => c.id));
      }
      const teamIds = state.teams.map((t) => t.id).join(",");
      if (teamIds !== prevTeams) {
        prevTeams = teamIds;
        subscribeTo("team", state.teams.map((t) => t.id));
      }
    });
    return unsub;
  }, [subscribeTo]);

  return wsRef;
}

function subscribeAll(ws: WebSocket, kind: "team" | "channel", ids: string[]) {
  const key = kind === "team" ? "team_id" : "channel_id";
  for (const id of ids) {
    if (!isValidUUID(id)) continue; // mock data
    ws.send(JSON.stringify({ type: `subscribe.${kind}`, payload: { [key]: id } }));
  }
}

// ── Permission & membership changes ──
//
// The server broadcasts *that* something changed, never anyone's resolved
// permissions; each client refetches its own. Refetches are debounced per
// team so a burst of changes (e.g. editing a role) costs one round trip.

const pendingTeamRefresh = new Map<string, ReturnType<typeof setTimeout>>();

function refreshTeamAccess(teamId: string | undefined, opts: { members?: boolean; channels?: boolean } = {}) {
  if (!teamId || !isValidUUID(teamId)) return;
  clearTimeout(pendingTeamRefresh.get(teamId));
  pendingTeamRefresh.set(
    teamId,
    setTimeout(() => {
      pendingTeamRefresh.delete(teamId);
      const chat = useChatStore.getState();
      const email = chat.currentUserId;
      useAccessStore.getState().invalidateTeam(teamId);
      if (opts.members !== false) void chat.fetchMembers(teamId, email);
      if (opts.channels !== false && teamId === chat.activeTeamId) void chat.fetchChannels(teamId, email);
    }, 250 + Math.random() * 500), // jitter spreads the refetch load across clients
  );
}

function refreshAfterReconnect() {
  const { activeTeamId } = useChatStore.getState();
  refreshTeamAccess(activeTeamId ?? undefined);
}

const isMe = (email?: string) =>
  !!email && email.toLowerCase() === (useChatStore.getState().currentUserId || "").toLowerCase();

// ── Handle incoming WebSocket events ──

function handleWSEvent(msg: WSIncoming) {
  const store = useChatStore.getState();

  switch (msg.event) {
    case "message.ack": {
      const data = msg.data as { temp_id: string; message: ServerMessage };
      if (!data.message || !data.temp_id) break;
      const real = toMessage(data.message);
      void removeOutbox(data.temp_id);
      useChatStore.setState((s) => ({
        messages: s.messages.map((m) => (m.id === data.temp_id ? real : m)),
      }));
      break;
    }

    case "message.error": {
      const data = msg.data as { temp_id: string; error: string };
      if (data.temp_id) {
        void removeOutbox(data.temp_id);
        useChatStore.setState((s) => ({
          messages: s.messages.filter((m) => m.id !== data.temp_id),
          apiError: data.error || "Failed to send message",
        }));
      }
      break;
    }

    case "message.created": {
      const data = msg.data as { message: ServerMessage; channel_id: string };
      if (!data.message) break;
      const newMsg = toMessage(data.message);
      if (store.messages.some((m) => m.id === newMsg.id)) break;
      if (newMsg.authorId === store.currentUserId) break;
      useChatStore.setState((s) => ({
        messages: [...s.messages, newMsg],
      }));
      store.noteIncoming(newMsg.channelId, newMsg);
      break;
    }

    case "dm.message.created": {
      const data = msg.data as { message?: ServerDMMessage; conversation_id?: string };
      if (!data?.message) break;
      const conversationId = data.conversation_id ?? data.message.conversation_id;
      if (!conversationId) break;
      store.receiveDMMessage(conversationId, toDMMessage(data.message));
      if (!store.directMessages.some((d) => d.id === conversationId)) {
        void store.fetchDMs(store.currentUserId);
      }
      break;
    }

    // A file was attached to a message (channel or DM). The bytes live in the files service; this carries the reference.
    case "message.attachment": {
      const data = msg.data as { message_id: string; attachment: ServerAttachment };
      if (!data?.message_id || !data.attachment) break;
      store.addMessageAttachment(data.message_id, toAttachment(data.attachment));
      break;
    }

    case "dm.created":
    case "dm.updated":
    case "dm.member.added":
    case "dm.member.removed":
    case "dm.member.role_changed": {
      void useChatStore.getState().fetchDMs(useChatStore.getState().currentUserId);
      break;
    }

    case "call.started":
    case "call.ended": {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("airsend:call-event"));
      break;
    }

    case "dm.message.attachment": {
      const data = msg.data as { conversation_id: string; message_id: string; attachment: ServerAttachment };
      if (!data?.message_id || !data.attachment) break;
      store.addMessageAttachment(data.message_id, toAttachment(data.attachment));
      // The message itself may not be loaded yet (another tab / the partner's file): pull the conversation.
      if (data.conversation_id && !(useChatStore.getState().dmMessages[data.conversation_id] ?? []).some((m) => m.id === data.message_id)) {
        void useChatStore.getState().fetchDMMessages(data.conversation_id);
      }
      break;
    }

    case "message.updated": {
      const data = msg.data as { message: ServerMessage };
      if (!data.message) break;
      const updated = toMessage(data.message);
      useChatStore.setState((s) => ({
        messages: s.messages.map((m) => (m.id === updated.id ? updated : m)),
      }));
      break;
    }

    case "message.deleted": {
      const data = msg.data as { message_id: string };
      useChatStore.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === data.message_id
            ? { ...m, isDeleted: true, content: "This message has been deleted." }
            : m,
        ),
      }));
      break;
    }

    case "message.pinned":
    case "message.unpinned": {
      const data = msg.data as { message_id: string; pinned: boolean };
      useChatStore.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === data.message_id ? { ...m, isPinned: data.pinned } : m,
        ),
      }));
      break;
    }

    case "channel.created": {
      // Private channels arrive as an id only: refetch, the server lists
      // them only for members who can see them.
      const data = msg.data as { channel?: any; team_id?: string };
      if (data.channel) {
        const ch = toChannel(data.channel);
        useChatStore.setState((s) => {
          if (s.channels.some((c) => c.id === ch.id)) return s;
          return { channels: [...s.channels, ch] };
        });
      }
      // My exact permissions in it come with the refetch.
      refreshTeamAccess(data.team_id ?? msg.team, { members: false });
      break;
    }

    case "channel.updated": {
      // Lock / announcement / visibility changes alter what I may do there:
      // keep my last known permissions until the refetch replaces them.
      const data = msg.data as { channel?: any; team_id?: string };
      if (data.channel) {
        const ch = toChannel(data.channel);
        useChatStore.setState((s) => ({
          channels: s.channels.map((c) =>
            c.id === ch.id ? { ...ch, myPermissions: c.myPermissions, isPinned: c.isPinned, unreadCount: c.unreadCount } : c,
          ),
        }));
      }
      refreshTeamAccess(data.team_id ?? msg.team, { members: false });
      break;
    }

    case "channel.permissions_changed": {
      const data = msg.data as { channel_id: string };
      if (data.channel_id) useAccessStore.getState().invalidateChannel(data.channel_id);
      refreshTeamAccess(msg.team, { members: false });
      break;
    }

    // ── Roles, role assignments, timeouts ──
    case "role.created":
    case "role.updated":
    case "role.deleted": {
      // Anyone holding the role may have gained or lost permissions.
      refreshTeamAccess(msg.team ?? msg.data?.team_id);
      break;
    }

    case "member.role_changed":
    case "member.role_assigned": {
      const data = msg.data as { email?: string };
      // Others' role changes only affect the member list; mine affect everything.
      refreshTeamAccess(msg.team, { channels: isMe(data.email) });
      break;
    }

    case "member.timeout_set":
    case "member.timeout_cleared": {
      // The member list carries timed_out_until; a timeout on me also
      // changes what I may do in every channel.
      const data = msg.data as { id?: string };
      refreshTeamAccess(msg.team ?? msg.data?.team_id, { channels: isMe(data.id) });
      break;
    }

    case "member.joined":
    case "member.removed": {
      refreshTeamAccess(msg.team, { channels: false });
      break;
    }

    case "subscribe.denied":
      break; // the server refused a stream we may not see; nothing to do

    case "channel.deleted": {
      const data = msg.data as { channel_id: string };
      useChatStore.setState((s) => ({
        channels: s.channels.filter((c) => c.id !== data.channel_id),
      }));
      break;
    }

    case "team.updated": {
      const data = msg.data as { team: any };
      if (data.team) {
        const team = toTeam(data.team);
        useChatStore.setState((s) => ({
          teams: s.teams.map((t) => (t.id === team.id ? team : t)),
        }));
      }
      break;
    }

    case "typing.start":
    case "typing.stop": {
      const data = msg.data as { channel_id: string; email: string; name: string; is_typing: boolean };
      if (data.email === store.currentUserId) break;
      useChatStore.setState((s) => {
        const filtered = s.typingIndicators.filter(
          (t) => !(t.userId === data.email && t.channelId === data.channel_id),
        );
        if (data.is_typing) {
          return {
            typingIndicators: [
              ...filtered,
              { userId: data.email, userName: data.name, channelId: data.channel_id, timestamp: Date.now() },
            ],
          };
        }
        return { typingIndicators: filtered };
      });
      break;
    }

    // ── Member Status & Presence ──
    case "member.status_changed": {
      const data = msg.data as { email: string; status: string; custom_status?: string };
      if (data.email) {
        useChatStore.setState((s) => ({
          members: s.members.map((m) =>
            m.email === data.email || m.userId === data.email
              ? {
                  ...m,
                  status: (data.status as any) || m.status,
                  customStatus: data.custom_status ?? m.customStatus,
                }
              : m
          ),
          directMessages: s.directMessages.map((dm) =>
            dm.participants.some((p) => p.userId?.toLowerCase() === data.email.toLowerCase())
              ? {
                  ...dm,
                  participants: dm.participants.map((p) =>
                    p.userId?.toLowerCase() === data.email.toLowerCase() && !p.unavailable
                      ? { ...p, status: (data.status as any) || p.status }
                      : p
                  ),
                }
              : dm
          ),
        }));
      }
      break;
    }

    // ── Calls & Video Conferencing ──
    case "call.joined": {
      const data = msg.data as { call_id: string; participant: any };
      if (data.participant) {
        const p = toLiveCallParticipant(data.participant);
        useChatStore.setState((s) => {
          const exists = s.callParticipants.some(
            (existing) => existing.id === p.id || existing.email === p.email
          );
          if (exists) {
            return {
              callParticipants: s.callParticipants.map((existing) =>
                existing.id === p.id || existing.email === p.email ? p : existing
              ),
            };
          }
          return { callParticipants: [...s.callParticipants, p] };
        });
      }
      break;
    }

    case "call.left": {
      const data = msg.data as { call_id: string; user_email: string };
      if (data.user_email) {
        useChatStore.setState((s) => ({
          callParticipants: s.callParticipants.filter((p) => p.email !== data.user_email),
        }));
      }
      break;
    }

    case "call.state_changed": {
      const data = msg.data as { call_id: string; user_email: string; state: any };
      if (data.user_email) {
        useChatStore.setState((s) => ({
          callParticipants: s.callParticipants.map((p) => {
            if (p.email !== data.user_email) return p;
            return {
              ...p,
              isAudioMuted: data.state?.is_muted !== undefined ? data.state.is_muted : p.isAudioMuted,
              isVideoOff: data.state?.is_camera_off !== undefined ? data.state.is_camera_off : p.isVideoOff,
              isScreenSharing:
                data.state?.is_screen_sharing !== undefined ? data.state.is_screen_sharing : p.isScreenSharing,
              isHandRaised:
                data.state?.is_hand_raised !== undefined ? data.state.is_hand_raised : p.isHandRaised,
            };
          }),
        }));
      }
      break;
    }

    case "call.signal": {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("airsend:call-signal", { detail: msg.data }));
      }
      break;
    }

    case "call.missed": {
      const data = msg.data as { call: any };
      if (data.call) {
        const rec = toCallRecord(data.call);
        useChatStore.setState((s) => ({
          callRecords: [rec, ...s.callRecords],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              type: "call_missed",
              teamId: rec.teamId || "team-1",
              fromUserId: rec.callerId,
              fromUserName: rec.callerName,
              content: `Missed call from ${rec.callerName}`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        }));
      }
      break;
    }

    // ── Meetings & Calendar ──
    case "meeting.created":
    case "meeting.channel_live":
    case "meeting.invited": {
      const data = msg.data as { meeting: any };
      if (data.meeting) {
        const m = toMeeting(data.meeting);
        useChatStore.setState((s) => {
          const exists = s.meetings.some((item) => item.id === m.id);
          const updated = exists
            ? s.meetings.map((item) => (item.id === m.id ? m : item))
            : [m, ...s.meetings];
          return { meetings: updated };
        });
      }
      break;
    }

    case "meeting.updated": {
      const data = msg.data as { meeting: any };
      if (data.meeting) {
        const m = toMeeting(data.meeting);
        useChatStore.setState((s) => ({
          meetings: s.meetings.map((item) => (item.id === m.id ? m : item)),
        }));
      }
      break;
    }

    case "meeting.deleted": {
      const data = msg.data as { meeting_id: string };
      if (data.meeting_id) {
        useChatStore.setState((s) => ({
          meetings: s.meetings.filter((m) => m.id !== data.meeting_id),
        }));
      }
      break;
    }

    // ── Tasks & Planner ──
    case "task.created":
    case "task.assigned": {
      refreshMyTasks();
      const data = msg.data as { task: any };
      if (data.task) {
        const t = toChatTask(data.task);
        useChatStore.setState((s) => {
          if (s.tasks.some((item) => item.id === t.id)) return s;
          return { tasks: [t, ...s.tasks] };
        });
      }
      break;
    }

    case "task.updated": {
      refreshMyTasks();
      const data = msg.data as { task: any };
      if (data.task) {
        const t = toChatTask(data.task);
        useChatStore.setState((s) => ({
          tasks: s.tasks.map((item) => (item.id === t.id ? t : item)),
        }));
      }
      break;
    }

    case "task.deleted": {
      refreshMyTasks();
      const data = msg.data as { task_id: string };
      if (data.task_id) {
        useChatStore.setState((s) => ({
          tasks: s.tasks.filter((t) => t.id !== data.task_id),
        }));
      }
      break;
    }

    // ── Files & Cloud Storage ──
    case "file.uploaded": {
      const data = msg.data as { file: any };
      if (data.file) {
        const f = toWorkspaceFile(data.file);
        useChatStore.setState((s) => {
          if (s.files.some((item) => item.id === f.id)) return s;
          return { files: [f, ...s.files] };
        });
      }
      break;
    }

    case "file.deleted": {
      const data = msg.data as { file_id: string };
      if (data.file_id) {
        useChatStore.setState((s) => ({
          files: s.files.filter((f) => f.id !== data.file_id),
        }));
      }
      break;
    }

    // ── Activity Feed Notifications ──
    case "notification.new": {
      const data = msg.data as { notification: any };
      if (data.notification) {
        const n = data.notification;
        useChatStore.setState((s) => ({
          notifications: [
            {
              id: n.id || `notif-${Date.now()}`,
              type: (n.type === "meeting.invite"
                ? "meeting_invite"
                : n.type === "call.missed"
                  ? "call_missed"
                  : n.type === "task.assigned"
                    ? "task_assigned"
                    : "system") as any,
              teamId: s.activeTeamId || "team-1",
              fromUserId: n.recipient_email,
              fromUserName: n.title,
              content: n.body || n.title,
              isRead: false,
              createdAt: n.created_at || new Date().toISOString(),
            },
            ...s.notifications,
          ],
        }));
      }
      break;
    }

    // ── Workflows & Automations ──
    case "workflow.created": {
      const data = msg.data as { workflow: any };
      if (data?.workflow) {
        const wf = data.workflow;
        useChatStore.setState((s) => {
          if (s.workflows.some((w) => w.id === wf.id)) return s;
          return {
            workflows: [
              {
                id: wf.id,
                teamId: wf.team_id,
                name: wf.name,
                description: wf.description,
                triggerType: wf.trigger_type,
                triggerConfig: wf.trigger_config || {},
                actions: wf.actions || [],
                isActive: wf.is_active,
                webhookToken: wf.webhook_token,
                runCount: wf.run_count || 0,
                lastRunAt: wf.last_run_at,
                createdBy: wf.created_by,
                createdAt: wf.created_at,
                updatedAt: wf.updated_at,
              },
              ...s.workflows,
            ],
          };
        });
      }
      break;
    }

    case "workflow.updated": {
      const data = msg.data as { workflow: any };
      if (data?.workflow) {
        const wf = data.workflow;
        useChatStore.setState((s) => ({
          workflows: s.workflows.map((item) =>
            item.id === wf.id
              ? {
                  ...item,
                  name: wf.name,
                  description: wf.description,
                  triggerType: wf.trigger_type,
                  triggerConfig: wf.trigger_config || {},
                  actions: wf.actions || [],
                  isActive: wf.is_active,
                  webhookToken: wf.webhook_token,
                  runCount: wf.run_count ?? item.runCount,
                  lastRunAt: wf.last_run_at ?? item.lastRunAt,
                  updatedAt: wf.updated_at,
                }
              : item
          ),
        }));
      }
      break;
    }

    case "workflow.deleted": {
      const data = msg.data as { workflow_id: string };
      if (data?.workflow_id) {
        useChatStore.setState((s) => ({
          workflows: s.workflows.filter((w) => w.id !== data.workflow_id),
        }));
      }
      break;
    }

    case "workflow.run": {
      const data = msg.data as { run: any };
      if (data?.run) {
        const r = data.run;
        useChatStore.getState().addWorkflowRun({
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
        });
      }
      break;
    }

    // ── Voice channels ──
    case "voice.joined": {
      const data = msg.data as { channel_id: string; user_email: string; session: any };
      const voiceState = useVoiceStore.getState();
      if (voiceState.channelId === data.channel_id && data.user_email !== store.currentUserId) {
        useVoiceStore.getState().addParticipant({
          id: data.session?.id ?? "",
          channelId: data.channel_id,
          userEmail: data.user_email,
          joinedAt: new Date().toISOString(),
          isMuted: false,
          isDeafened: false,
        });
      }
      break;
    }

    case "voice.left": {
      const data = msg.data as { channel_id: string; user_email: string };
      const voiceState = useVoiceStore.getState();
      if (voiceState.channelId === data.channel_id) {
        voiceState.removeParticipant(data.user_email);
      }
      break;
    }

    case "voice.signal": {
      const data = msg.data as { channel_id: string; from_email: string; signal_type: string; payload: any };
      const voiceState = useVoiceStore.getState();
      if (voiceState.channelId === data.channel_id) {
        voiceState.handleSignal(data.from_email, data.signal_type, data.payload, store.currentUserId);
      }
      break;
    }

    case "voice.mute_update": {
      const data = msg.data as { channel_id: string; user_email: string; is_muted: boolean; is_deafened: boolean };
      const voiceState = useVoiceStore.getState();
      if (voiceState.channelId === data.channel_id) {
        useVoiceStore.setState((s) => ({
          participants: s.participants.map((p) =>
            p.userEmail === data.user_email
              ? { ...p, isMuted: data.is_muted, isDeafened: data.is_deafened }
              : p,
          ),
        }));
      }
      break;
    }

    case "pong":
      break;

    default:
      break;
  }
}
