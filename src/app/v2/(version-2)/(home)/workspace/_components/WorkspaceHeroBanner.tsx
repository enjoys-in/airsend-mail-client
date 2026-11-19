"use client";

import React from "react";
import Link from "next/link";
import { Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Team, Channel } from "../_lib/chat-types";

interface WorkspaceHeroBannerProps {
  activeTeam?: Team;
  defaultChannel?: Channel;
  onInstantMeeting: () => void;
}

export function WorkspaceHeroBanner({
  activeTeam,
  defaultChannel,
  onInstantMeeting,
}: WorkspaceHeroBannerProps) {
  const teamName = activeTeam?.name || "Workspace";

  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-5 md:p-6 shadow-sm">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {teamName.charAt(0).toUpperCase()}
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {teamName} Hub
            </h1>
            <Badge variant="outline" className="text-xs capitalize gap-1 border-primary/30 text-primary">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Collaborate in real-time across team channels, direct chats, live video conferences, tasks planner, and cloud files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={onInstantMeeting}
            className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
          >
            <Video className="size-4" />
            Meet Now
          </Button>
          {defaultChannel && (
            <Link href={`/v2/workspace/c/${defaultChannel.id}`}>
              <Button variant="outline" className="gap-1.5 shadow-sm">
                <MessageSquare className="size-4" />
                Jump to #{defaultChannel.name}
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="absolute -right-12 -top-12 size-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
    </div>
  );
}
