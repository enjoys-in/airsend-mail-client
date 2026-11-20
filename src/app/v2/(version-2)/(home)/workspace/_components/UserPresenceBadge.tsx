"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { PresenceStatus } from "../_lib/chat-types";
import { presenceDot, presenceLabel } from "../_lib/presence";

interface UserPresenceBadgeProps {
  status: PresenceStatus | string;
  customStatus?: string;
  className?: string;
  showText?: boolean;
}

export default function UserPresenceBadge({
  status,
  customStatus,
  className,
  showText = false,
}: UserPresenceBadgeProps) {
  const getStatusColor = (s: string) => `${presenceDot(s)} border-white dark:border-slate-900`;
  const getStatusLabel = (s: string) => presenceLabel(s);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} title={`${getStatusLabel(status)}${customStatus ? ` • ${customStatus}` : ""}`}>
      <span
        className={cn(
          "size-2.5 rounded-full border-2 shrink-0 transition-colors",
          getStatusColor(status)
        )}
      />
      {showText && (
        <span className="text-xs text-muted-foreground capitalize truncate max-w-[120px]">
          {customStatus || getStatusLabel(status)}
        </span>
      )}
    </div>
  );
}
