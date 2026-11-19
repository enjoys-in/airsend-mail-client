"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LiveMeetingCard from "./LiveMeetingCard";
import type { Meeting } from "../_lib/chat-types";

interface WorkspaceMeetingsCardProps {
  meetings: Meeting[];
  onJoinCall: (callId: string, title?: string) => void;
}

export function WorkspaceMeetingsCard({ meetings, onJoinCall }: WorkspaceMeetingsCardProps) {
  const upcoming = meetings.slice(0, 3);

  return (
    <Card className="border-border/40 shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="size-4 text-emerald-500" />
            Upcoming Meetings
          </CardTitle>
          <CardDescription className="text-xs">Scheduled conferences & standups</CardDescription>
        </div>
        <Link href="/v2/workspace/meetings">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            View all <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
        {upcoming.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No upcoming meetings scheduled for today.
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((meet) => (
              <LiveMeetingCard
                key={meet.id}
                meeting={meet}
                compact={true}
                onJoin={() => onJoinCall(meet.id, meet.title)}
              />
            ))}
          </div>
        )}
        <Link href="/v2/workspace/meetings" className="block pt-1">
          <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-dashed">
            <Plus className="size-3.5" />
            Schedule New Meeting
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
