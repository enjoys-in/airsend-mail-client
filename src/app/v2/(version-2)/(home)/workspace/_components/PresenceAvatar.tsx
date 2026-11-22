"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { presenceDot, presenceLabel } from "../_lib/presence";

// A person's picture with their presence badge on the corner (green = available, red = busy / in a call, amber = away,
// grey = offline). Falls back to their initial when there is no picture or it fails to load.

// No picture: two-letter initials on a colour that stays the same for the same person.
const TINTS = [
  "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
];

function initialsOf(name: string): string {
  const parts = (name || "?").trim().split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "?") + (parts.length > 1 ? (parts[1]?.[0] ?? "") : "");
  return letters.toUpperCase();
}

function tintOf(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

const SIZES = {
  sm: { box: "size-6", text: "text-[10px]", badge: "size-2.5" },
  md: { box: "size-8", text: "text-xs", badge: "size-3" },
  lg: { box: "size-10", text: "text-sm", badge: "size-3.5" },
} as const;

export interface PresenceAvatarProps {
  name: string;
  /** Picture URL (their dp). */
  src?: string | null;
  /** Presence status; omit (or pass showBadge={false}) for groups. */
  status?: string;
  showBadge?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
}

export default function PresenceAvatar({ name, src, status, showBadge = true, size = "sm", className }: PresenceAvatarProps) {
  const s = SIZES[size];
  const initials = initialsOf(name);
  const label = presenceLabel(status);
  return (
    <span className={cn("relative inline-flex shrink-0", className)} title={showBadge && status ? label : undefined}>
      <Avatar className={s.box}>
        {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
        <AvatarFallback className={cn("font-medium", s.text, tintOf(name))}>{initials}</AvatarFallback>
      </Avatar>
      {showBadge && status && (
        <span
          aria-label={label}
          className={cn("absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-background", s.badge, presenceDot(status))}
        />
      )}
    </span>
  );
}
