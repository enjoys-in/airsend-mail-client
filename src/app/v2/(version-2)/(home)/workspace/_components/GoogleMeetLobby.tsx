"use client";

import React, { useEffect, useMemo, useState } from "react";
import PreJoinLobby from "./meet/prejoin/PreJoinLobby";
import type { PreJoinDevices, PreJoinEffects } from "./meet/prejoin/PreJoinScreen";
import type { LiveCallParticipant } from "../_lib/chat-types";
import type { MeetingPresence } from "../_lib/meet/types";

/**
 * Compatibility adapter: the join page used to render this with hand-fed props. It now renders the Teams-style
 * `PreJoinLobby`, so every caller gets the real preview, mic level, devices and presence. New callers should use
 * `PreJoinLobby` directly; the optional props below let this one carry the same data in the meantime.
 */
interface GoogleMeetLobbyProps {
  callId: string;
  title: string;
  participants: LiveCallParticipant[];
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  isMyCameraOn: boolean;
  isMyMicMuted: boolean;
  toggleCamera: () => void;
  toggleMic: () => void;
  /** `true` when the user chose "Join and present". */
  onJoin: (startWithScreenShare?: boolean) => void;

  // Optional: real data from the new modules (when absent the lobby shows only what it was given).
  displayName?: string;
  onDisplayNameChange?: (name: string) => void;
  effects?: PreJoinEffects;
  presence?: MeetingPresence;
  micStream?: MediaStream | null;
  devices?: PreJoinDevices;
  mediaError?: string | null;
}

// Not a person: older callers added a placeholder "meeting bot" to the roster.
const NOT_A_PERSON = new Set(["airsend-meeting-bot"]);

export default function GoogleMeetLobby({
  callId,
  title,
  participants,
  localVideoRef,
  isMyCameraOn,
  isMyMicMuted,
  toggleCamera,
  toggleMic,
  onJoin,
  displayName: displayNameProp,
  onDisplayNameChange,
  effects,
  presence,
  micStream: micStreamProp,
  devices,
  mediaError,
}: GoogleMeetLobbyProps) {
  // The name is the user's to type; there is no made-up default.
  const [ownName, setOwnName] = useState("");
  const displayName = displayNameProp ?? ownName;

  // The call hook attaches the microphone to the preview element; read it back for the level meter.
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    if (micStreamProp !== undefined) return;
    const find = () => {
      const src = localVideoRef.current?.srcObject;
      if (src instanceof MediaStream) {
        setMicStream(src);
        return true;
      }
      return false;
    };
    if (find()) return;
    const timer = setInterval(() => {
      if (find()) clearInterval(timer);
    }, 400);
    return () => clearInterval(timer);
  }, [localVideoRef, micStreamProp]);

  // Without real presence data, show only the people the caller passed in.
  const fallbackPresence = useMemo<MeetingPresence>(() => {
    const people = participants
      .filter((p) => !NOT_A_PERSON.has(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: p.avatar,
        isHost: p.role === "host",
        isSelf: false,
        micMuted: p.isAudioMuted,
        cameraOff: p.isVideoOff,
      }));
    return {
      loading: false,
      exists: null,
      ended: false,
      title,
      organizer: null,
      participants: people,
      count: people.length,
      source: "none",
      refresh: () => {},
    };
  }, [participants, title]);

  return (
    <PreJoinLobby
      roomId={callId}
      title={title}
      displayName={displayName}
      onDisplayNameChange={onDisplayNameChange ?? setOwnName}
      previewVideoRef={localVideoRef}
      cameraOn={isMyCameraOn}
      micMuted={isMyMicMuted}
      onToggleCamera={toggleCamera}
      onToggleMic={toggleMic}
      micStream={micStreamProp ?? micStream}
      effects={effects}
      presence={presence ?? fallbackPresence}
      devices={devices}
      mediaError={mediaError}
      onJoin={({ present }) => onJoin(!!present)}
    />
  );
}
