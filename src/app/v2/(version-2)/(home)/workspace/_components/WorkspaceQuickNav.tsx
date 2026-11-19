"use client";

import React from "react";
import Link from "next/link";
import { Hash, Calendar, Video, CheckSquare, FolderOpen, Bell } from "lucide-react";

interface WorkspaceQuickNavProps {
  channelsCount: number;
  meetingsCount: number;
  openTasksCount: number;
  filesCount: number;
  unreadActivityCount: number;
  defaultChannelId?: string;
}

export function WorkspaceQuickNav({
  channelsCount,
  meetingsCount,
  openTasksCount,
  filesCount,
  unreadActivityCount,
  defaultChannelId,
}: WorkspaceQuickNavProps) {
  const items = [
    {
      title: "Channels",
      count: `${channelsCount} active`,
      href: defaultChannelId ? `/v2/workspace/c/${defaultChannelId}` : "/v2/workspace",
      icon: Hash,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Meetings",
      count: `${meetingsCount} scheduled`,
      href: "/v2/workspace/meetings",
      icon: Calendar,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Calls",
      count: "HD Voice",
      href: "/v2/workspace/calls",
      icon: Video,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Tasks",
      count: `${openTasksCount} open`,
      href: "/v2/workspace/tasks",
      icon: CheckSquare,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Files",
      count: `${filesCount} shared`,
      href: "/v2/workspace/files",
      icon: FolderOpen,
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      title: "Activity",
      count: `${unreadActivityCount} unread`,
      href: "/v2/workspace/activity",
      icon: Bell,
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/40 bg-card hover:bg-accent/40 transition-all duration-150 text-center shadow-sm hover:shadow"
          >
            <div className={`flex size-10 items-center justify-center rounded-xl mb-2 ${item.color} group-hover:scale-110 transition-transform`}>
              <Icon className="size-5" />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
