"use client";

import React from "react";
import Link from "next/link";
import { Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Channel } from "../_lib/chat-types";

interface WorkspaceChannelsCardProps {
  channels: Channel[];
}

export function WorkspaceChannelsCard({ channels }: WorkspaceChannelsCardProps) {
  const displayChannels = channels.slice(0, 6);

  return (
    <Card className="border-border/40 shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Hash className="size-4 text-blue-500" />
            Active Team Channels
          </CardTitle>
          <CardDescription className="text-xs">Quick jump to conversations</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {displayChannels.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No channels found for this team.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayChannels.map((c) => (
              <Link
                key={c.id}
                href={`/v2/workspace/c/${c.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/40 hover:border-primary/40 transition-all duration-150"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold truncate">{c.name}</span>
                </div>
                {c.unreadCount > 0 && (
                  <Badge className="bg-primary text-[10px] h-4 min-w-4 px-1 rounded-full">
                    {c.unreadCount}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
