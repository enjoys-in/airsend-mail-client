"use client";

import React from "react";
import { Mic, MicOff, Video, VideoOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaToggleBarProps {
  micMuted: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  /** When given, shows the "Background filters" button. */
  onOpenEffects?: () => void;
  /** An effect other than "none" is applied. */
  effectsActive?: boolean;
  effectsOpen?: boolean;
  disabled?: boolean;
  className?: string;
}

function ToggleButton({
  pressed,
  danger,
  label,
  onClick,
  disabled,
  children,
}: {
  pressed?: boolean;
  danger?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        "flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50",
        danger
          ? "border-red-500/60 bg-red-500/20 text-red-300 hover:bg-red-500/30"
          : pressed
            ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-500"
            : "border-slate-700 bg-slate-800 text-white hover:bg-slate-700",
      )}
    >
      {children}
    </button>
  );
}

/** Microphone, camera and background-effects buttons; their state is the real device state passed in. */
export default function MediaToggleBar({
  micMuted,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onOpenEffects,
  effectsActive,
  effectsOpen,
  disabled,
  className,
}: MediaToggleBarProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-2 backdrop-blur-md", className)}>
      <ToggleButton danger={!cameraOn} label={cameraOn ? "Turn camera off" : "Turn camera on"} onClick={onToggleCamera} disabled={disabled}>
        {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
      </ToggleButton>
      <ToggleButton danger={micMuted} label={micMuted ? "Unmute microphone" : "Mute microphone"} onClick={onToggleMic} disabled={disabled}>
        {micMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
      </ToggleButton>
      {onOpenEffects && (
        <ToggleButton
          pressed={effectsActive || effectsOpen}
          label="Background filters"
          onClick={onOpenEffects}
          disabled={disabled}
        >
          <Sparkles className="size-5" />
        </ToggleButton>
      )}
    </div>
  );
}
