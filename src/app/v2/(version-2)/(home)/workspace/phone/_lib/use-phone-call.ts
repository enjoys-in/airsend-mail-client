"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalVideoTrack, Participant, RemoteVideoTrack, Room } from "livekit-client";
import { isInternalTarget, reasonText } from "./number";
import type { CallContext, CallKind, CallMedia, CallPhase, IncomingCall, IntercomCall, IntercomParticipant, JoinInfo, PhoneCall } from "./types";
import { intercomApi, voiceApi, VoiceApiError } from "./voice-api";

export interface VideoEntry {
  id: string;
  identity: string;
  name: string;
  local: boolean;
  screen: boolean;
  track: LocalVideoTrack | RemoteVideoTrack;
}

export interface StartOptions {
  trunkId?: string;
  from?: string;
  conversationId?: string;
  media?: CallMedia;
  title?: string;
}

export interface PhoneCallState {
  media: CallMedia;
  context: CallContext | undefined;
  videos: VideoEntry[];
  cameraOn: boolean;
  sharing: boolean;
  phase: CallPhase;
  kind: CallKind;
  callId: string | undefined;
  call: PhoneCall | undefined;
  number: string;
  target: string;
  message: string;
  muted: boolean;
  seconds: number;
  participants: IntercomParticipant[];
}

const idle: PhoneCallState = {
  media: "audio",
  context: undefined,
  videos: [],
  cameraOn: false,
  sharing: false,
  phase: "idle",
  kind: "pstn",
  callId: undefined,
  call: undefined,
  number: "",
  target: "",
  message: "",
  muted: false,
  seconds: 0,
  participants: [],
};
const pollMs = 1000;

const dtmfCodes: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "*": 10, "#": 11,
};

const internalEnded: Record<string, string> = {
  missed: "No answer",
  declined: "The call was declined",
};

const endedByReason: Record<string, string> = {
  disconnected: "The connection was lost",
  room_closed: "Call ended",
};

const participantKey = (participants: IntercomParticipant[]) =>
  participants.map((person) => `${person.email}:${person.state}`).join("|");

function collectVideos(room: Room, screenSource: string): VideoEntry[] {
  const entries: VideoEntry[] = [];
  const add = (participant: Participant, local: boolean) => {
    for (const publication of participant.videoTrackPublications.values()) {
      if (!publication.track || publication.isMuted) continue;
      entries.push({
        id: `${participant.identity}:${publication.source}`,
        identity: participant.identity,
        name: participant.name || participant.identity,
        local,
        screen: publication.source === screenSource,
        track: publication.track as LocalVideoTrack | RemoteVideoTrack,
      });
    }
  };
  add(room.localParticipant, true);
  room.remoteParticipants.forEach((participant) => add(participant, false));
  return entries;
}

function hangupRemote(kind: CallKind, id: string, options: { keepalive?: boolean } = {}) {
  return kind === "internal" ? intercomApi.hangup(id, options) : voiceApi.hangup(id, options);
}

export function usePhoneCall() {
  const [state, setState] = useState<PhoneCallState>(idle);
  const roomRef = useRef<Room | null>(null);
  const callRef = useRef<{ kind: CallKind; id: string } | undefined>(undefined);
  const pollRef = useRef<number | undefined>(undefined);
  const clockRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLElement[]>([]);
  const activeRef = useRef(false);
  const participantsRef = useRef("");
  const contextRef = useRef("");
  const stateNameRef = useRef("");

  const teardown = useCallback(() => {
    activeRef.current = false;
    if (pollRef.current !== undefined) window.clearInterval(pollRef.current);
    if (clockRef.current !== undefined) window.clearInterval(clockRef.current);
    pollRef.current = undefined;
    clockRef.current = undefined;
    participantsRef.current = "";
    contextRef.current = "";
    stateNameRef.current = "";
    for (const element of audioRef.current) element.remove();
    audioRef.current = [];
    const room = roomRef.current;
    roomRef.current = null;
    if (room) void room.disconnect();
  }, []);

  const finish = useCallback(
    (phase: "ended" | "failed", message: string, call?: PhoneCall) => {
      teardown();
      setState((current) => ({ ...current, phase, message, call: call ?? current.call, muted: false, videos: [], cameraOn: false, sharing: false }));
    },
    [teardown],
  );

  const startClock = useCallback((answeredAt: string | undefined) => {
    if (clockRef.current !== undefined) return;
    const started = answeredAt ? new Date(answeredAt).getTime() : Date.now();
    clockRef.current = window.setInterval(() => {
      setState((current) => ({ ...current, seconds: Math.max(0, Math.floor((Date.now() - started) / 1000)) }));
    }, 500);
  }, []);

  const pollPstn = useCallback(
    async (id: string) => {
      try {
        const latest = await voiceApi.call(id);
        if (!activeRef.current) return;
        if (latest.status === "answered") {
          setState((current) => ({ ...current, phase: "connected", call: latest, message: "" }));
          startClock(latest.answeredAt);
        } else if (latest.status === "ended") {
          finish("ended", "Call ended", latest);
        } else if (latest.status === "failed" || latest.status === "blocked") {
          finish("failed", reasonText(latest.endReason) || "The call did not connect", latest);
        } else {
          setState((current) => ({ ...current, call: latest }));
        }
      } catch (error) {
        if (error instanceof VoiceApiError && error.status === 404 && activeRef.current) {
          finish("failed", "The call could not be found");
        }
      }
    },
    [finish, startClock],
  );

  const pollInternal = useCallback(
    async (id: string) => {
      try {
        const latest: IntercomCall = await intercomApi.call(id);
        if (!activeRef.current) return;
        const people = latest.participants ?? [];
        if (latest.context && latest.context.id !== contextRef.current) {
          contextRef.current = latest.context.id;
          setState((current) => ({ ...current, context: latest.context, media: latest.media ?? current.media, number: latest.context?.kind === "group" ? latest.context.name : current.number }));
        } else if (latest.context && latest.context.name !== stateNameRef.current) {
          stateNameRef.current = latest.context.name;
          setState((current) => ({ ...current, context: latest.context, number: latest.context?.kind === "group" ? latest.context.name : current.number }));
        }
        const key = participantKey(people);
        if (key !== participantsRef.current) {
          participantsRef.current = key;
          setState((current) => ({ ...current, participants: people }));
        }
        if (latest.status === "active") {
          setState((current) => (current.phase === "connected" ? current : { ...current, phase: "connected", message: "" }));
          startClock(latest.answeredAt);
        } else if (latest.status === "ended" || latest.status === "cancelled") {
          finish("ended", endedByReason[latest.endReason ?? ""] ?? "Call ended");
        } else if (latest.status === "missed" || latest.status === "declined") {
          finish("failed", internalEnded[latest.status]);
        }
      } catch (error) {
        if (error instanceof VoiceApiError && error.status === 404 && activeRef.current) {
          finish("failed", "The call could not be found");
        }
      }
    },
    [finish, startClock],
  );

  const connect = useCallback(
    async (kind: CallKind, id: string, join: JoinInfo, media: CallMedia = "audio"): Promise<boolean> => {
      try {
        const { Room, RoomEvent, Track } = await import("livekit-client");
        const room = new Room({
          audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind !== Track.Kind.Audio) return;
          const element = track.attach();
          element.setAttribute("data-testid", "remote-audio");
          element.style.display = "none";
          document.body.appendChild(element);
          audioRef.current.push(element);
        });
        const syncVideos = () => {
          if (roomRef.current !== room) return;
          setState((current) => ({
            ...current,
            videos: collectVideos(room, Track.Source.ScreenShare),
            cameraOn: room.localParticipant.isCameraEnabled,
            sharing: room.localParticipant.isScreenShareEnabled,
          }));
        };
        for (const name of [
          RoomEvent.TrackSubscribed,
          RoomEvent.TrackUnsubscribed,
          RoomEvent.TrackMuted,
          RoomEvent.TrackUnmuted,
          RoomEvent.LocalTrackPublished,
          RoomEvent.LocalTrackUnpublished,
          RoomEvent.ParticipantDisconnected,
        ] as const) {
          room.on(name as never, syncVideos as never);
        }
        room.on(RoomEvent.Disconnected, () => {
          if (activeRef.current) {
            void hangupRemote(kind, id).catch(() => undefined);
            finish("ended", "Call ended");
          }
        });

        await room.connect(join.url, join.token);
        if (kind === "internal") void intercomApi.connected(id).catch(() => undefined);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (media === "video") {
          try {
            await room.localParticipant.setCameraEnabled(true);
          } catch {
            setState((current) => ({ ...current, message: "Your camera could not be started. Continuing with audio only." }));
          }
        }
        syncVideos();
      } catch (error) {
        const denied = error instanceof Error && /permission|denied|NotAllowed/i.test(`${error.name} ${error.message}`);
        await hangupRemote(kind, id).catch(() => undefined);
        finish(
          "failed",
          denied ? "Allow microphone access in your browser to place calls." : "Could not connect your audio to the call.",
        );
        return false;
      }

      if (!activeRef.current) return false;
      const poll = kind === "internal" ? pollInternal : pollPstn;
      void poll(id);
      pollRef.current = window.setInterval(() => void poll(id), pollMs);
      return true;
    },
    [finish, pollInternal, pollPstn],
  );

  const start = useCallback(
    async (target: string, options: StartOptions = {}) => {
      if (activeRef.current) return;
      activeRef.current = true;
      const media: CallMedia = options.media === "video" ? "video" : "audio";
      const kind: CallKind = options.conversationId || isInternalTarget(target) ? "internal" : "pstn";
      setState({ ...idle, phase: "starting", kind, media, number: options.title || target, target, message: "Starting call" });

      let id: string;
      let join: JoinInfo;
      try {
        if (kind === "internal") {
          const result = await intercomApi.startCall(
            options.conversationId ? { conversationId: options.conversationId, media } : { to: target, media },
          );
          id = result.call.id;
          join = result.join;
          const context = result.call.context;
          contextRef.current = context?.id ?? "";
          stateNameRef.current = context?.name ?? "";
          setState((current) => ({
            ...current,
            phase: result.call.status === "active" ? "connected" : "dialing",
            callId: id,
            context,
            media: result.call.media ?? media,
            number: result.to?.name ?? context?.name ?? current.number,
            message: "Ringing",
            participants: result.call.participants ?? [],
          }));
        } else {
          const result = await voiceApi.startCall({ to: target, ...options });
          id = result.call.id;
          join = result.join;
          setState((current) => ({ ...current, phase: "dialing", callId: id, call: result.call, message: "Calling" }));
        }
      } catch (error) {
        activeRef.current = false;
        setState({
          ...idle,
          phase: "failed",
          kind,
          number: target,
          target,
          message: error instanceof Error ? error.message : "The call could not be started",
        });
        return;
      }

      callRef.current = { kind, id };
      await connect(kind, id, join, media);
    },
    [connect],
  );

  const joinExisting = useCallback(
    async (callId: string, title?: string) => {
      if (activeRef.current) return;
      activeRef.current = true;
      setState({ ...idle, phase: "starting", kind: "internal", callId, number: title ?? "Call", message: "Joining" });
      let join: JoinInfo;
      let media: CallMedia = "audio";
      try {
        const result = await intercomApi.join(callId);
        join = result.join;
        media = result.call.media ?? "audio";
        contextRef.current = result.call.context?.id ?? "";
        stateNameRef.current = result.call.context?.name ?? "";
        setState((current) => ({
          ...current,
          media,
          context: result.call.context,
          number: result.call.context?.kind === "group" ? result.call.context.name : current.number,
          participants: result.call.participants ?? [],
        }));
      } catch (error) {
        activeRef.current = false;
        setState({ ...idle, phase: "failed", kind: "internal", number: title ?? "Call", message: error instanceof Error ? error.message : "Could not join the call" });
        return;
      }
      callRef.current = { kind: "internal", id: callId };
      await connect("internal", callId, join, media);
    },
    [connect],
  );

  const answerIncoming = useCallback(
    async (incoming: IncomingCall) => {
      if (activeRef.current) return;
      activeRef.current = true;
      setState({
        ...idle,
        phase: "starting",
        kind: "internal",
        callId: incoming.callId,
        media: incoming.media ?? "audio",
        context: incoming.context,
        number: incoming.context?.kind === "group" ? incoming.context.name : incoming.from.name,
        target: incoming.from.extension,
        message: "Connecting",
      });
      contextRef.current = incoming.context?.id ?? "";
      stateNameRef.current = incoming.context?.name ?? "";

      let join: JoinInfo;
      try {
        join = (await intercomApi.answer(incoming.callId)).join;
      } catch (error) {
        activeRef.current = false;
        setState({
          ...idle,
          phase: "failed",
          kind: "internal",
          number: incoming.from.name,
          target: incoming.from.extension,
          message: error instanceof Error ? error.message : "This call is no longer available",
        });
        return;
      }

      callRef.current = { kind: "internal", id: incoming.callId };
      await connect("internal", incoming.callId, join, incoming.media ?? "audio");
    },
    [connect],
  );

  const hangup = useCallback(async () => {
    const current = callRef.current;
    if (!current || !activeRef.current) {
      teardown();
      setState(idle);
      return;
    }
    teardown();
    setState((value) => ({ ...value, phase: "ended", message: "Call ended", muted: false }));
    await hangupRemote(current.kind, current.id).catch(() => undefined);
  }, [teardown]);

  const invite = useCallback(async (to: string) => {
    const current = callRef.current;
    if (!current || current.kind !== "internal" || !activeRef.current) {
      throw new Error("Start a call with a colleague before adding people.");
    }
    const result = await intercomApi.invite(current.id, to);
    participantsRef.current = participantKey(result.call.participants);
    setState((value) => ({ ...value, participants: result.call.participants }));
  }, []);

  const guestLink = useCallback(async () => {
    const current = callRef.current;
    if (!current || current.kind !== "internal") throw new Error("Guests can be invited from a call with a colleague.");
    const result = await intercomApi.guestLink(current.id);
    return `${window.location.origin}/guest-call/${encodeURIComponent(result.token)}`;
  }, []);

  const answerGuest = useCallback(async (guestId: string, admit: boolean) => {
    const current = callRef.current;
    if (!current || current.kind !== "internal") return;
    await (admit ? intercomApi.admitGuest(current.id, guestId) : intercomApi.denyGuest(current.id, guestId));
    participantsRef.current = "";
  }, []);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const nextMuted = !state.muted;
    await room.localParticipant.setMicrophoneEnabled(!nextMuted);
    setState((current) => ({ ...current, muted: nextMuted }));
  }, [state.muted]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.localParticipant.setCameraEnabled(!room.localParticipant.isCameraEnabled);
    } catch {
      setState((current) => ({ ...current, message: "Your camera could not be started." }));
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.localParticipant.setScreenShareEnabled(!room.localParticipant.isScreenShareEnabled);
    } catch {
      return;
    }
  }, []);

  const sendDigit = useCallback(async (digit: string) => {
    const code = dtmfCodes[digit];
    const room = roomRef.current;
    if (code === undefined || !room) return;
    await room.localParticipant.publishDtmf(code, digit);
  }, []);

  const reset = useCallback(() => {
    teardown();
    callRef.current = undefined;
    setState(idle);
  }, [teardown]);

  useEffect(() => {
    const onLeave = () => {
      const current = callRef.current;
      if (activeRef.current && current) void hangupRemote(current.kind, current.id, { keepalive: true }).catch(() => undefined);
    };
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      onLeave();
      teardown();
    };
  }, [teardown]);

  return { state, start, joinExisting, answerIncoming, invite, guestLink, answerGuest, hangup, toggleMute, toggleCamera, toggleScreenShare, sendDigit, reset };
}
