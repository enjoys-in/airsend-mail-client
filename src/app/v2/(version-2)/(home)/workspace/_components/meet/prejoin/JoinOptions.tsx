"use client";

import React from "react";
import { MonitorUp, Headphones, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type JoinAudio = "computer" | "none";

export interface JoinOptionsProps {
  audio: JoinAudio;
  onAudioChange: (audio: JoinAudio) => void;
  /** Shows a "Present" button that joins and starts sharing the screen. */
  onPresent?: () => void;
  presentDisabled?: boolean;
  disabled?: boolean;
  className?: string;
}

const OPTIONS: { value: JoinAudio; label: string; hint: string; icon: typeof Headphones }[] = [
  { value: "computer", label: "Computer audio", hint: "Use this computer's microphone and speakers", icon: Headphones },
  { value: "none", label: "Don't use audio", hint: "Join muted, with no sound", icon: VolumeX },
];

/** Teams-style audio choice for joining, and an optional "Present" shortcut. */
export default function JoinOptions({ audio, onAudioChange, onPresent, presentDisabled, disabled, className }: JoinOptionsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <RadioGroup
        value={audio}
        onValueChange={(v) => onAudioChange(v as JoinAudio)}
        disabled={disabled}
        aria-label="Audio when you join"
        className="gap-2"
      >
        {OPTIONS.map(({ value, label, hint, icon: Icon }) => (
          <label
            key={value}
            htmlFor={`join-audio-${value}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500",
              audio === value ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-600",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <RadioGroupItem id={`join-audio-${value}`} value={value} className="border-slate-500 text-blue-400" />
            <Icon className="size-4 shrink-0 text-slate-400" />
            <span className="min-w-0">
              <span className="block text-sm text-slate-100">{label}</span>
              <span className="block text-[11px] text-slate-400">{hint}</span>
            </span>
          </label>
        ))}
      </RadioGroup>

      {onPresent && (
        <Button
          type="button"
          variant="outline"
          onClick={onPresent}
          disabled={disabled || presentDisabled}
          className="h-10 w-full gap-2 border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <MonitorUp className="size-4 text-blue-400" />
          Join and present
        </Button>
      )}
    </div>
  );
}
