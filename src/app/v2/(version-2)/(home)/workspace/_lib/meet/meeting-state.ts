"use client";

import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "../chat-store";
import type { Meeting } from "../chat-types";

// ---------------------------------------------------------------------------
// What state is a meeting really in? The stored `status` alone is not enough: a meeting that was only *scheduled* is not "in
// progress", and one marked live that nobody ended hours ago is not either. This is the one place that decides, so the channel
// banner, the home page and the sidebar icons always agree.
// ---------------------------------------------------------------------------

export type MeetingPhase =
  /** Started (status live / in progress) and not long past its planned end. */
  | "live"
  /** Scheduled, and its time has come (from 10 minutes before the start until the planned end). */
  | "starting"
  /** Scheduled for later. */
  | "upcoming"
  /** Completed, cancelled, missed, or a "live" meeting that nobody ended long ago. */
  | "ended";

const STARTING_LEAD_MS = 10 * 60 * 1000;
/** A meeting still marked live this long after its planned end is treated as abandoned. */
const LIVE_GRACE_MS = 3 * 60 * 60 * 1000;

const time = (iso: string, fallback: number) => {
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function meetingPhase(meeting: Pick<Meeting, "status" | "startTime" | "endTime">, now: number = Date.now()): MeetingPhase {
  if (meeting.status === "completed" || meeting.status === "cancelled") return "ended";
  const start = time(meeting.startTime, now);
  const end = Math.max(time(meeting.endTime, start), start);
  const status = String(meeting.status);

  if (status === "live" || status === "in_progress") return now > end + LIVE_GRACE_MS ? "ended" : "live";
  // scheduled
  if (now > end) return "ended";
  if (now >= start - STARTING_LEAD_MS) return "starting";
  return "upcoming";
}

/** Re-renders every `intervalMs` so time-based phases (a scheduled meeting reaching its start) update on their own. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export interface ChannelMeeting {
  meeting: Meeting;
  phase: "live" | "starting";
}

/** The meeting to highlight for each channel that has one on right now (live wins over starting; the newest wins within a phase). */
export function useChannelMeetings(): Map<string, ChannelMeeting> {
  const meetings = useChatStore((s) => s.meetings);
  const now = useNow();
  return useMemo(() => {
    const byChannel = new Map<string, ChannelMeeting>();
    for (const meeting of meetings) {
      if (!meeting.channelId) continue;
      const phase = meetingPhase(meeting, now);
      if (phase !== "live" && phase !== "starting") continue;
      const current = byChannel.get(meeting.channelId);
      const better =
        !current ||
        (phase === "live" && current.phase === "starting") ||
        (phase === current.phase && Date.parse(meeting.startTime) > Date.parse(current.meeting.startTime));
      if (better) byChannel.set(meeting.channelId, { meeting, phase });
    }
    return byChannel;
  }, [meetings, now]);
}

/** Meetings that are live right now, anywhere in the workspace. */
export function useLiveMeetings(): Meeting[] {
  const meetings = useChatStore((s) => s.meetings);
  const now = useNow();
  return useMemo(() => meetings.filter((m) => meetingPhase(m, now) === "live"), [meetings, now]);
}
