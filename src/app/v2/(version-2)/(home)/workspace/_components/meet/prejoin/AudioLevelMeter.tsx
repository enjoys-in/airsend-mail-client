"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAudioLevel } from "../../../_lib/meet/devices/use-audio-level";

export interface AudioLevelMeterProps {
  /** The stream whose microphone is measured. */
  stream: MediaStream | null;
  /** false = flat (muted, or nothing to measure). */
  active?: boolean;
  /** Number of segments. */
  bars?: number;
  className?: string;
}

/** The real microphone level as a row of bars: speak and it moves; mute and it goes flat. */
export default function AudioLevelMeter({ stream, active = true, bars = 5, className }: AudioLevelMeterProps) {
  const level = useAudioLevel(stream, active);
  const lit = Math.round(level * bars);
  return (
    <div
      role="meter"
      aria-label="Microphone level"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(level * 100)}
      className={cn("flex h-4 items-end gap-0.5", className)}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("w-1 rounded-full transition-colors duration-100", i < lit ? "bg-emerald-400" : "bg-slate-600")}
          style={{ height: `${40 + (i * 60) / Math.max(1, bars - 1)}%` }}
        />
      ))}
    </div>
  );
}
