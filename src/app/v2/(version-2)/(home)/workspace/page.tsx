"use client";

import React, { useEffect } from "react";
import { MessageSquare, Hash, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatStore } from "./_lib/chat-store";
import Link from "next/link";

export default function WorkspacePage() {
  const router = useRouter();
  const { teams, channels, activeTeamId } = useChatStore();
  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const teamChannels = activeTeamId
    ? channels.filter((c) => c.teamId === activeTeamId)
    : [];
  const defaultChannel =
    teamChannels.find((c) => c.isDefault) ?? teamChannels[0];

  // Auto-redirect to default General channel
  useEffect(() => {
    if (defaultChannel) {
      router.replace(`/v2/workspace/c/${defaultChannel.id}`);
    }
  }, [defaultChannel, router]);

  // Show fallback while redirecting or if no channels
  if (defaultChannel) return null;

  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      <div className="text-center max-w-sm">
        <MessageSquare className="mx-auto size-16 opacity-20" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          {activeTeam ? activeTeam.name : "Workspace"}
        </h2>
        <p className="mt-1 text-sm">
          No channels available yet. Create a channel to get started.
        </p>
      </div>
    </div>
  );
}