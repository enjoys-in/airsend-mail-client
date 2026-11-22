"use client";

import React from "react";
import { useChatStore } from "../_lib/chat-store";
import type { LiveCallParticipant } from "../_lib/chat-types";
import { useMeetTranscript, type MeetTranscript } from "../_lib/meet/transcription/use-meet-transcript";
import CaptionsOverlay from "./meet/transcript/CaptionsOverlay";

interface MeetCaptionsOverlayProps {
  onClose: () => void;
  /** Everything below falls back to the chat store (active call, signed-in user, mic state, call roster). */
  callId?: string;
  selfEmail?: string;
  selfName?: string;
  micMuted?: boolean;
  peers?: LiveCallParticipant[];
  /**
   * A transcript the page already owns (shared with <TranscriptPanel> so there is one speech recogniser).
   * When given, this overlay only displays it; otherwise it runs its own.
   */
  transcript?: MeetTranscript;
}

/**
 * Live captions for the call: real speech-to-text from the microphone (Web Speech API), plus the other participants'
 * captions when the call supports sharing them. Mounting it turns captions on, closing it turns them off.
 */
export default function MeetCaptionsOverlay({
  onClose,
  callId,
  selfEmail,
  selfName,
  micMuted,
  peers,
  transcript,
}: MeetCaptionsOverlayProps) {
  const storeCallId = useChatStore((s) => s.activeCallId);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const members = useChatStore((s) => s.members);
  const storeMuted = useChatStore((s) => s.isMyMicMuted);
  const storePeers = useChatStore((s) => s.callParticipants);

  const email = selfEmail ?? currentUserId ?? "";
  const name =
    selfName ??
    members.find((m) => m.email?.toLowerCase() === email.toLowerCase())?.displayName ??
    (email ? email.split("@")[0] : "You");

  const own = useMeetTranscript({
    enabled: !transcript,
    callId: callId ?? storeCallId ?? undefined,
    selfEmail: email,
    selfName: name,
    micMuted: micMuted ?? storeMuted,
    peers: peers ?? storePeers,
  });

  return (
    <div className="absolute bottom-20 left-1/2 z-20 w-[90%] max-w-2xl -translate-x-1/2 pointer-events-auto">
      <CaptionsOverlay transcript={transcript ?? own} onClose={onClose} />
    </div>
  );
}
