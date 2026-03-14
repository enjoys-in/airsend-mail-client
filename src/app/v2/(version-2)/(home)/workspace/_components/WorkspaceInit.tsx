"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { useWorkspaceWS } from "../_lib/use-workspace-ws";

// ---------------------------------------------------------------------------
// WorkspaceInit — fetches workspace data from the Go API on mount
// Placed in the workspace layout to run once for all workspace routes.
// Also establishes WebSocket connection for real-time updates.
// ---------------------------------------------------------------------------

export default function WorkspaceInit() {
  const currAccount = useAppSelector((s:any) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const { activeTeamId, activeChannelId, fetchTeams, fetchChannels, fetchMembers, fetchMessages, fetchDMs } =
    useChatStore();
  const didInit = useRef(false);

  // WebSocket connection for real-time
  useWorkspaceWS(email || undefined);

  // Initial fetch: teams + DMs
  useEffect(() => {
    if (!email || didInit.current) return;
    didInit.current = true;

    fetchTeams(email).catch(() => {});
    fetchDMs(email).catch(() => {});
  }, [email, fetchTeams, fetchDMs]);

  // When activeTeamId changes, fetch channels + members for that team
  useEffect(() => {
    if (!email || !activeTeamId) return;

    fetchChannels(activeTeamId, email).catch(() => {});
    fetchMembers(activeTeamId, email).catch(() => {});
  }, [email, activeTeamId, fetchChannels, fetchMembers]);

  // When activeChannelId changes, fetch messages for that channel
  useEffect(() => {
    if (!email || !activeChannelId) return;
    fetchMessages(activeChannelId, email).catch(() => {});
  }, [email, activeChannelId, fetchMessages]);

  return null; // render nothing — just side effects
}
