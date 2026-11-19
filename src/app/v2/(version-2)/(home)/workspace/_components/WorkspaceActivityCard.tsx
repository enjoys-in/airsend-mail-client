"use client";

import React from "react";
import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatNotification } from "../_lib/chat-types";

interface WorkspaceActivityCardProps {
  notifications: ChatNotification[];
}

export function WorkspaceActivityCard({ notifications }: WorkspaceActivityCardProps) {
  const unread = notifications.filter((n) => !n.isRead).slice(0, 4);

  return (
    <Card className="border-border/40 shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="size-4 text-rose-500" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-xs">Mentions, replies and alerts</CardDescription>
        </div>
        <Link href="/v2/workspace/activity">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            All <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5 flex-1 flex flex-col justify-between">
        {unread.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No unread activity. You are all up to date!
          </div>
        ) : (
          <div className="space-y-2">
            {unread.map((notif) => (
              <Link
                key={notif.id}
                href="/v2/workspace/activity"
                className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/30 transition-colors"
              >
                <Avatar className="size-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {(notif.fromUserName || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    <span className="font-semibold">{notif.fromUserName}</span> {notif.content}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link href="/v2/workspace/activity" className="block pt-1">
          <Button variant="outline" size="sm" className="w-full text-xs h-8">
            Open Activity Feed
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
