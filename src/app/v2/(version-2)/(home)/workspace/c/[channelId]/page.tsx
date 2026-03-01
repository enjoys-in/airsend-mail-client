"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MessageList from "../../_components/MessageList";
import MessageInput from "../../_components/MessageInput";
import { useChatStore } from "../../_lib/chat-store";

interface ChannelPageProps {
  params: Promise<{ channelId: string }>;
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = React.use(params);
  const router = useRouter();
  const { channels, setActiveChannel } = useChatStore();

  useEffect(() => {
    const exists = channels.find((c) => c.id === channelId);
    if (!exists) {
      // Invalid channel — redirect to default General or workspace root
      const general = channels.find((c) => c.isDefault) ?? channels[0];
      if (general) {
        router.replace(`/v2/workspace/c/${general.id}`);
      } else {
        router.replace("/v2/workspace");
      }
      return;
    }
    // Sync store selection with URL
    setActiveChannel(channelId);
  }, [channelId, channels, router, setActiveChannel]);

  // While validating, don't render broken state
  const exists = channels.find((c) => c.id === channelId);
  if (!exists) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );
}
