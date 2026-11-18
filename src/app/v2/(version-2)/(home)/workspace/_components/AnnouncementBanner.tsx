"use client";

import React from "react";
import { Megaphone, Pin, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnnouncementBannerProps {
  title?: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  timestamp?: string;
  priority?: "urgent" | "important" | "announcement" | "normal";
  isPinned?: boolean;
}

export default function AnnouncementBanner({
  title = "Team Announcement",
  authorName = "Workspace Admin",
  content,
  timestamp,
  priority = "announcement",
  isPinned = false,
}: AnnouncementBannerProps) {
  const isUrgent = priority === "urgent";

  return (
    <div
      className={`relative my-2 overflow-hidden rounded-xl border p-4 transition-all shadow-sm ${
        isUrgent
          ? "border-rose-500/50 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40"
          : "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30"
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex size-7 items-center justify-center rounded-lg ${
              isUrgent ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
            }`}
          >
            <Megaphone className="size-4 animate-bounce" />
          </div>

          <Badge
            variant={isUrgent ? "destructive" : "default"}
            className={`text-[10px] font-bold uppercase tracking-wider ${
              !isUrgent ? "bg-amber-500 text-slate-950 hover:bg-amber-600" : ""
            }`}
          >
            {isUrgent ? "URGENT BROADCAST" : "ANNOUNCEMENT"}
          </Badge>

          {isPinned && (
            <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground border-border/60">
              <Pin className="size-2.5" />
              Pinned
            </Badge>
          )}
        </div>

        {timestamp && (
          <span className="text-[10px] text-muted-foreground font-mono">
            {timestamp}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
        {title}
        <span title="Verified announcement">
          <ShieldCheck className="size-3.5 text-blue-500" />
        </span>
      </h4>

      {/* Content */}
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>

      {/* Author signature footer */}
      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Broadcasted by <strong className="text-foreground font-medium">{authorName}</strong></span>
        <span className="text-[10px] italic">Visible to all workspace members</span>
      </div>
    </div>
  );
}
