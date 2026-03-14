// ============================================================================
// useWorkspaceWS — WebSocket hook for real-time workspace updates
// ============================================================================

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "./chat-store";
import { useVoiceStore } from "./voice-store";
import { toMessage } from "./api";
import type { ServerMessage } from "./api";

const WS_BASE =
  (typeof window !== "undefined" && (window as any).__RUNTIME_CONFIG__?.WORKSPACE_WS_URL) ||
  process.env.NEXT_PUBLIC_WORKSPACE_WS_URL ||
  "ws://localhost:8090";

interface WSIncoming {
  event: string;
  channel?: string;
  data: any;
}

export function useWorkspaceWS(email: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!email || !mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = `${WS_BASE}/ws?email=${encodeURIComponent(email)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // Store WS ref in Zustand so sendMessage can use it
      useChatStore.getState().setWS(ws);

      // Subscribe to all teams and channels the user has
      const { teams, channels } = useChatStore.getState();
      teams.forEach((t) => {
        ws.send(JSON.stringify({ type: "subscribe.team", payload: { team_id: t.id } }));
      });
      channels.forEach((c) => {
        ws.send(JSON.stringify({ type: "subscribe.channel", payload: { channel_id: c.id } }));
      });
    };

    ws.onmessage = (ev) => {
      try {
        const msg: WSIncoming = JSON.parse(ev.data);
        handleWSEvent(msg);
      } catch {
        // ignore non-JSON
      }
    };

    ws.onclose = () => {
      useChatStore.getState().setWS(null);
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [email]);

  // Subscribe to new channels when they change
  const subscribeToChannels = useCallback((channelIds: string[]) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    channelIds.forEach((id) => {
      ws.send(JSON.stringify({ type: "subscribe.channel", payload: { channel_id: id } }));
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Re-subscribe when channels change
  useEffect(() => {
    let prevIds = useChatStore.getState().channels.map((c) => c.id).join(",");
    const unsub = useChatStore.subscribe((state) => {
      const ids = state.channels.map((c) => c.id).join(",");
      if (ids !== prevIds) {
        prevIds = ids;
        subscribeToChannels(state.channels.map((c) => c.id));
      }
    });
    return unsub;
  }, [subscribeToChannels]);

  return wsRef;
}

// ── Handle incoming WebSocket events ──

function handleWSEvent(msg: WSIncoming) {
  const store = useChatStore.getState();

  switch (msg.event) {
    case "message.ack": {
      // Server confirmed our message — replace temp with real
      const data = msg.data as { temp_id: string; message: ServerMessage };
      if (!data.message || !data.temp_id) break;
      const real = toMessage(data.message);
      useChatStore.setState((s) => ({
        messages: s.messages.map((m) => (m.id === data.temp_id ? real : m)),
      }));
      break;
    }

    case "message.error": {
      // Server rejected our message — remove temp
      const data = msg.data as { temp_id: string; error: string };
      if (data.temp_id) {
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
      // Skip if we already have it (optimistic send or ack already handled)
      if (store.messages.some((m) => m.id === newMsg.id)) break;
      // Skip if it's from current user (already added optimistically)
      if (newMsg.authorId === store.currentUserId) break;
      useChatStore.setState((s) => ({
        messages: [...s.messages, newMsg],
      }));
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
      const data = msg.data as { channel: any };
      if (data.channel) {
        const { toChannel } = require("./api");
        const ch = toChannel(data.channel);
        useChatStore.setState((s) => {
          if (s.channels.some((c) => c.id === ch.id)) return s;
          return { channels: [...s.channels, ch] };
        });
      }
      break;
    }

    case "channel.updated": {
      const data = msg.data as { channel: any };
      if (data.channel) {
        const { toChannel } = require("./api");
        const ch = toChannel(data.channel);
        useChatStore.setState((s) => ({
          channels: s.channels.map((c) => (c.id === ch.id ? ch : c)),
        }));
      }
      break;
    }

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
        const { toTeam } = require("./api");
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

    case "notification.mention": {
      // Could show a toast or increment unread
      break;
    }

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
