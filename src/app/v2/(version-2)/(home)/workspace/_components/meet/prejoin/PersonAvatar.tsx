"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TONES = [
  "bg-blue-500/20 text-blue-200",
  "bg-violet-500/20 text-violet-200",
  "bg-emerald-500/20 text-emerald-200",
  "bg-amber-500/20 text-amber-200",
  "bg-rose-500/20 text-rose-200",
  "bg-cyan-500/20 text-cyan-200",
];

export function initialsOf(name: string): string {
  const parts = (name || "?").trim().split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? (parts[1]?.[0] ?? "") : "")).toUpperCase();
}

export interface PersonAvatarProps {
  name: string;
  src?: string;
  className?: string;
}

/** Initials avatar with a stable tint per person; shows the picture when there is one. */
export default function PersonAvatar({ name, src, className }: PersonAvatarProps) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return (
    <Avatar className={cn("size-8", className)}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback className={cn("text-[11px] font-medium", TONES[hash % TONES.length])}>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  );
}
