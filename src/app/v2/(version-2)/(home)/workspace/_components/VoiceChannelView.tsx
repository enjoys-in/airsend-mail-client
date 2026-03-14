"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
  Phone,
  Volume2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "../_lib/chat-store";
import { useVoiceStore } from "../_lib/voice-store";
import type { VoiceParticipant } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// VoiceChannelView — voice channel UI with join/leave, mute/deafen, participants
// ---------------------------------------------------------------------------

interface VoiceChannelViewProps {
  channelId: string;
}

export default function VoiceChannelView({ channelId }: VoiceChannelViewProps) {
  const { channels, currentUserId } = useChatStore();
  const {
    channelId: activeVoiceChannel,
    participants,
    isMuted,
    isDeafened,
    isConnecting,
    join,
    leave,
    toggleMute,
    toggleDeafen,
    remoteStreams,
  } = useVoiceStore();

  const channel = channels.find((c) => c.id === channelId);
  const isInChannel = activeVoiceChannel === channelId;

  const handleJoin = async () => {
    if (!currentUserId) return;
    try {
      await join(channelId, currentUserId);
    } catch {
      // Could show toast
    }
  };

  const handleLeave = async () => {
    if (!currentUserId) return;
    await leave(currentUserId);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      {/* Channel name */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Volume2 className="size-5 text-muted-foreground" />
        {channel?.name ?? "Voice Channel"}
      </div>

      {/* Participants grid */}
      <div className="flex flex-wrap items-center justify-center gap-4 max-w-lg">
        {participants.length === 0 && !isInChannel && (
          <p className="text-sm text-muted-foreground">No one is in this channel</p>
        )}
        {participants.map((p) => (
          <VoiceParticipantCard
            key={p.userEmail}
            participant={p}
            isCurrentUser={p.userEmail === currentUserId}
            remoteStream={remoteStreams.get(p.userEmail)}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isInChannel ? (
          <>
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="size-12 rounded-full"
              onClick={() => toggleMute(currentUserId)}
            >
              {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>

            <Button
              variant={isDeafened ? "destructive" : "secondary"}
              size="icon"
              className="size-12 rounded-full"
              onClick={() => toggleDeafen(currentUserId)}
            >
              {isDeafened ? (
                <HeadphoneOff className="size-5" />
              ) : (
                <Headphones className="size-5" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="size-12 rounded-full"
              onClick={handleLeave}
            >
              <PhoneOff className="size-5" />
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            className="gap-2 rounded-full px-6"
            onClick={handleJoin}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Phone className="size-4" />
            )}
            {isConnecting ? "Connecting..." : "Join Voice"}
          </Button>
        )}
      </div>

      {isInChannel && (
        <p className="text-xs text-muted-foreground">
          Connected to voice • {participants.length} participant{participants.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Participant card with audio visualization
// ---------------------------------------------------------------------------

function VoiceParticipantCard({
  participant,
  isCurrentUser,
  remoteStream,
}: {
  participant: VoiceParticipant;
  isCurrentUser: boolean;
  remoteStream?: MediaStream;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attach remote stream to audio element
  useEffect(() => {
    if (audioRef.current && remoteStream && !isCurrentUser) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isCurrentUser]);

  const displayName = participant.displayName ?? participant.userEmail.split("@")[0];
  const initials = displayName
    .split(/[\s@]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 min-w-[100px]",
        participant.isMuted
          ? "border-muted bg-muted/30"
          : "border-emerald-500/30 bg-emerald-500/5",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full text-lg font-bold",
          participant.isMuted
            ? "bg-muted-foreground/20 text-muted-foreground"
            : "bg-emerald-500/20 text-emerald-600 ring-2 ring-emerald-500/40",
        )}
      >
        {initials}
      </div>

      {/* Name */}
      <span className="text-xs font-medium truncate max-w-[80px]">
        {isCurrentUser ? "You" : displayName}
      </span>

      {/* Status icons */}
      <div className="flex gap-1">
        {participant.isMuted && <MicOff className="size-3 text-red-400" />}
        {participant.isDeafened && <HeadphoneOff className="size-3 text-red-400" />}
        {!participant.isMuted && !participant.isDeafened && (
          <Mic className="size-3 text-emerald-500" />
        )}
      </div>

      {/* Hidden audio element for remote playback */}
      {!isCurrentUser && <audio ref={audioRef} autoPlay playsInline />}
    </div>
  );
}
