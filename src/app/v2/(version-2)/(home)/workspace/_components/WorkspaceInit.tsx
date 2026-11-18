"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { useWorkspaceWS } from "../_lib/use-workspace-ws";
import { getWorkspaceApiUrl } from "../_lib/api";

// ---------------------------------------------------------------------------
// WorkspaceInit — fetches workspace data from the Go API on mount
// Placed in the workspace layout to run once for all workspace routes.
// Also establishes WebSocket connection for real-time updates.
// ---------------------------------------------------------------------------

export default function WorkspaceInit() {
  const currAccount = useAppSelector((s: any) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const {
    activeTeamId,
    activeChannelId,
    fetchTeams,
    fetchChannels,
    fetchMembers,
    fetchMessages,
    fetchDMs,
    fetchMeetings,
    fetchTasks,
    fetchFiles,
    fetchCalls,
    fetchNotifications,
  } = useChatStore();
  const didInit = useRef(false);

  // Set runtime config if window is available
  if (typeof window !== "undefined" && !(window as any).__RUNTIME_CONFIG__?.WORKSPACE_API_URL) {
    (window as any).__RUNTIME_CONFIG__ = {
      ...(window as any).__RUNTIME_CONFIG__,
      WORKSPACE_API_URL: getWorkspaceApiUrl(),
    };
  }

  // WebSocket connection for real-time
  useWorkspaceWS(email || undefined);

  // Initial fetch: teams + DMs + notifications + calls + meetings
  useEffect(() => {
    if (!email || didInit.current) return;
    didInit.current = true;

    fetchTeams(email).catch(() => {});
    fetchDMs(email).catch(() => {});
    fetchNotifications().catch(() => {});
    fetchCalls().catch(() => {});
    fetchMeetings().catch(() => {});
  }, [email, fetchTeams, fetchDMs, fetchNotifications, fetchCalls, fetchMeetings]);

  // When activeTeamId changes, fetch channels + members + team tasks + files + team meetings
  useEffect(() => {
    if (!email || !activeTeamId) return;

    fetchChannels(activeTeamId, email).catch(() => {});
    fetchMembers(activeTeamId, email).catch(() => {});
    fetchTasks(activeTeamId).catch(() => {});
    fetchFiles(activeTeamId).catch(() => {});
    fetchMeetings(activeTeamId).catch(() => {});
  }, [email, activeTeamId, fetchChannels, fetchMembers, fetchTasks, fetchFiles, fetchMeetings]);

  // When activeChannelId changes, fetch messages for that channel
  useEffect(() => {
    if (!email || !activeChannelId) return;
    fetchMessages(activeChannelId, email).catch(() => {});
  }, [email, activeChannelId, fetchMessages]);

  return null; // render nothing — just side effects
}
