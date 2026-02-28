"use client";

import React from "react";

// ---------------------------------------------------------------------------
// TimeSeparator — date divider between message groups (Today, Yesterday, etc.)
// ---------------------------------------------------------------------------

interface TimeSeparatorProps {
  label: string;
}

export default function TimeSeparator({ label }: TimeSeparatorProps) {
  return (
    <div className="relative my-4 flex items-center" role="separator">
      <div className="flex-1 border-t border-border/40" />
      <span className="mx-4 shrink-0 rounded-full border border-border/40 bg-background px-3 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm">
        {label}
      </span>
      <div className="flex-1 border-t border-border/40" />
    </div>
  );
}

// Helper: converts a Date to a human-friendly label
export function getDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
