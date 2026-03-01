"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";

// ---------------------------------------------------------------------------
// WorkspaceInit — fetches workspace data from the Go API on mount
// Placed in the workspace layout to run once for all workspace routes.
// Falls back to mock data if API is unavailable.
// ---------------------------------------------------------------------------

export default function WorkspaceInit() {
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const email = currAccount?.email ?? "";
  const { activeTeamId, fetchTeams, fetchChannels, fetchMembers, fetchDMs } =
    useChatStore();
  const didInit = useRef(false);

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

  return null; // render nothing — just side effects
}
