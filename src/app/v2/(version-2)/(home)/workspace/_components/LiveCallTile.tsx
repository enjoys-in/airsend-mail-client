"use client";

import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Hand, ScreenShare, Pin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LiveCallParticipant } from "../_lib/chat-types";

interface LiveCallTileProps {
  participant: LiveCallParticipant;
  isSelf?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  stream?: MediaStream | null;
  isSpotlight?: boolean;
  onSpotlight?: () => void;
}

export default function LiveCallTile({
  participant,
  isSelf = false,
  videoRef,
  stream,
  isSpotlight = false,
  onSpotlight,
}: LiveCallTileProps) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);

  // If external stream is passed (for remote peers), attach it
  useEffect(() => {
    if (stream && internalVideoRef.current) {
      internalVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isVideoOff = participant.isVideoOff;
  const isMuted = participant.isAudioMuted;
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      className={`group relative flex flex-col items-center justify-center rounded-2xl bg-slate-900 border transition-all duration-200 overflow-hidden aspect-video shadow-md ${
        isSpeaking
          ? "border-emerald-500 ring-2 ring-emerald-500/40"
          : isSpotlight
            ? "border-blue-500 ring-2 ring-blue-500/40"
            : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Video Element or Avatar Fallback */}
      {!isVideoOff ? (
        <div className="relative size-full flex items-center justify-center bg-slate-950">
          <video
            ref={videoRef || internalVideoRef}
            autoPlay
            playsInline
            muted={isSelf} // always mute self locally to prevent audio feedback
            className={`size-full object-cover ${isSelf && !participant.isScreenSharing ? "scale-x-[-1]" : ""}`}
          />
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center p-4">
          <Avatar className="size-16 sm:size-20 border-2 border-slate-700 shadow-xl">
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg sm:text-2xl">
              {participant.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-500 mt-2 font-medium">Camera off</span>
        </div>
      )}

      {/* Hand Raised Banner */}
      {participant.isHandRaised && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-slate-950 shadow-md animate-bounce">
          <Hand className="size-3" />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Screen Sharing Banner */}
      {participant.isScreenSharing && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
          <ScreenShare className="size-3" />
          <span>Presenting</span>
        </div>
      )}

      {/* Name and audio status badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs backdrop-blur border border-slate-800/80">
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate font-medium text-slate-100">
            {isSelf ? `${participant.name} (You)` : participant.name}
          </span>
          {participant.role === "host" && (
            <Badge className="bg-blue-600/30 text-blue-400 border-none text-[9px] px-1 h-3.5">
              Host
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {onSpotlight && (
            <button
              onClick={onSpotlight}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white mr-1"
              title={isSpotlight ? "Unpin tile" : "Pin spotlight"}
            >
              <Pin className={`size-3 ${isSpotlight ? "text-blue-400 fill-blue-400" : ""}`} />
            </button>
          )}

          {isMuted ? (
            <div className="flex size-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <MicOff className="size-3" />
            </div>
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Mic className="size-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
