"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import { initWorkspaceCache, resetRevalidation, revalidate, ROUTE_TTL_MS } from "../_lib/workspace-cache";
import { useAccessStore } from "../_lib/access-store";
import { useDrafts } from "../_lib/drafts";
import { hydrateTrash } from "../_lib/trash";
import { useWorkspaceWS } from "../_lib/use-workspace-ws";
import { getWorkspaceApiUrl, isValidUUID } from "../_lib/api";

// ---------------------------------------------------------------------------
// WorkspaceInit — fetches workspace data from the Go API on mount
// Placed in the workspace layout to run once for all workspace routes.
// Also establishes WebSocket connection for real-time updates.
// ---------------------------------------------------------------------------

export default function WorkspaceInit() {
  const currAccount = useAppSelector((s: any) => s.accounts.currAccount);
  const email = currAccount?.email || "mullayam06@airsend.in";
  const {
    activeTeamId,
    activeChannelId,
    setCurrentUserId,
    fetchTeams,
    fetchChannels,
    fetchMembers,
    fetchMessages,
    fetchDMs,
    fetchMeetings,
    fetchFiles,
    fetchCalls,
    fetchNotifications,
  } = useChatStore();
  const didInit = useRef(false);

  // Normalize and set runtime config if window is available
  if (typeof window !== "undefined") {
    const cleanUrl = getWorkspaceApiUrl();
    if ((window as any).__RUNTIME_CONFIG__?.WORKSPACE_API_URL !== cleanUrl) {
      (window as any).__RUNTIME_CONFIG__ = {
        ...(window as any).__RUNTIME_CONFIG__,
        WORKSPACE_API_URL: cleanUrl,
      };
    }
  }

  // WebSocket connection for real-time
  useWorkspaceWS(email || undefined);

  // Keep currentUserId synchronized with logged-in account
  useEffect(() => {
    if (email) {
      setCurrentUserId(email);
    }
  }, [email, setCurrentUserId]);

  // Fill the store from IndexedDB first so the workspace paints instantly; the fetches below then refresh it silently.
  const [cacheReady, setCacheReady] = useState(false);
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    setCacheReady(false);
    didInit.current = false;
    resetRevalidation();
    void initWorkspaceCache(email, useChatStore as never).finally(() => {
      if (!cancelled) setCacheReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  // Messages queued while offline (or left over from a previous session) are sent as soon as there is a connection.
  useEffect(() => {
    if (!email || !cacheReady) return;
    const flush = () => void useChatStore.getState().flushOutbox();
    flush();
    void useDrafts.getState().hydrate();
    void hydrateTrash();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [email, cacheReady]);

  // Coming back to the tab counts as reading the open conversation.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const { activeChannelId: ch, activeDmId: dm, markRead } = useChatStore.getState();
      if (ch) markRead(ch);
      else if (dm) markRead(dm);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Initial fetch: teams + DMs + notifications + calls + meetings
  useEffect(() => {
    if (!email || !cacheReady || didInit.current) return;
    didInit.current = true;
    setCurrentUserId(email);

    void revalidate("teams", () => fetchTeams(email));
    void revalidate("dms", () => fetchDMs(email));
    void revalidate("notifications", () => fetchNotifications());
    void revalidate("calls", () => fetchCalls());
    void revalidate("meetings:all", () => fetchMeetings());
  }, [email, cacheReady, fetchTeams, fetchDMs, fetchNotifications, fetchCalls, fetchMeetings]);

  // When activeTeamId changes, fetch channels + members + files + team meetings (once per minute per team)
  useEffect(() => {
    if (!email || !cacheReady || !activeTeamId || !isValidUUID(activeTeamId)) return;

    void revalidate(`channels:${activeTeamId}`, () => fetchChannels(activeTeamId, email));
    void revalidate(`members:${activeTeamId}`, () => fetchMembers(activeTeamId, email));
    // What I may do team-wide (gates menus, settings and the composer).
    void revalidate(`access:${activeTeamId}`, () => useAccessStore.getState().fetchAccess(activeTeamId));
    void revalidate(`files:${activeTeamId}`, () => fetchFiles(activeTeamId));
    void revalidate(`meetings:${activeTeamId}`, () => fetchMeetings(activeTeamId));
  }, [email, cacheReady, activeTeamId, fetchChannels, fetchMembers, fetchFiles, fetchMeetings]);

  // When activeChannelId changes, fetch messages for that channel (the cached ones show immediately)
  useEffect(() => {
    if (!email || !cacheReady || !activeChannelId || !isValidUUID(activeChannelId)) return;
    // New messages arrive over the WebSocket; switching back within ROUTE_TTL_MS reuses what is loaded.
    void revalidate(`messages:${activeChannelId}`, () => fetchMessages(activeChannelId, email), ROUTE_TTL_MS);
  }, [email, cacheReady, activeChannelId, fetchMessages]);

  return null; // render nothing — just side effects
}
