"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useUpcomingEvents } from "../../calender/_lib/use-upcoming-events";
import { usePhone } from "../phone/_lib/phone-context";
import { useChatStore } from "../_lib/chat-store";
import type { PresenceStatus } from "../_lib/chat-types";
import { workspaceApi } from "../_lib/api";
import { isAutoStatus } from "../_lib/presence";

const PUBLISH_DELAY_MS = 1200;
const IN_CALL_PHASES = new Set(["starting", "dialing", "connected"]);

function useInCalendarMeeting(email: string): boolean {
  const events = useUpcomingEvents({ limit: 6, horizonDays: 1 });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const me = email.toLowerCase();
  return events.some((event) => {
    if (event.start.getTime() > now || event.end.getTime() <= now) return false;
    const mine = event.attendees?.find((attendee) => attendee.email?.toLowerCase() === me);
    return !mine || mine.status?.toUpperCase() !== "DECLINED";
  });
}

export function resolvePresence(manual: PresenceStatus, inCall: boolean, inMeeting: boolean): PresenceStatus {
  if (manual === "dnd" || manual === "offline") return manual;
  if (inCall) return "in_call";
  if (inMeeting) return "in_meeting";
  return manual;
}

export default function PresenceSync({ enabled }: { enabled: boolean }) {
  const email = useAppSelector((s) => s.accounts?.currAccount?.email) ?? "";
  const phone = usePhone();
  const manual = useChatStore((s) => s.myStatus);
  const custom = useChatStore((s) => s.myCustomStatus);
  const storeTeams = useChatStore((s) => s.teams);
  const hydrate = useChatStore((s) => s.hydrateManualPresence);
  const setEffective = useChatStore((s) => s.setEffectiveStatus);
  const [fetchedTeamIds, setFetchedTeamIds] = useState<string[]>([]);
  const lastPublished = useRef("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const inCall = IN_CALL_PHASES.has(phone.state.phase);
  const inMeeting = useInCalendarMeeting(email);
  const effective = resolvePresence(manual, inCall, inMeeting);

  useEffect(() => {
    setEffective(effective);
  }, [effective, setEffective]);

  useEffect(() => {
    if (!enabled || !email || storeTeams.length > 0) return;
    let cancelled = false;
    workspaceApi
      .listTeams(email)
      .then((teams) => {
        if (!cancelled) setFetchedTeamIds(teams.map((team) => team.id));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled, email, storeTeams.length]);

  const teamIds = useMemo(
    () => (storeTeams.length > 0 ? storeTeams.map((team) => team.id) : fetchedTeamIds),
    [storeTeams, fetchedTeamIds],
  );

  useEffect(() => {
    if (!enabled || !email || teamIds.length === 0) return;
    const key = `${email}|${effective}|${custom}|${teamIds.join(",")}`;
    if (key === lastPublished.current) return;
    const timer = setTimeout(() => {
      lastPublished.current = key;
      for (const teamId of teamIds) {
        workspaceApi.updateMyStatus(teamId, effective, custom, email).catch(() => {
          lastPublished.current = "";
        });
      }
    }, PUBLISH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, email, effective, custom, teamIds]);

  useEffect(() => {
    if (!enabled || !email || teamIds.length === 0 || !isAutoStatus(effective)) return;
    const restore = () => {
      for (const teamId of teamIds) {
        workspaceApi.updateMyStatus(teamId, manual, custom, email, true).catch(() => {});
      }
    };
    window.addEventListener("pagehide", restore);
    return () => window.removeEventListener("pagehide", restore);
  }, [enabled, email, effective, manual, custom, teamIds]);

  return null;
}
