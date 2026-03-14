"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MessageList from "../../_components/MessageList";
import MessageInput from "../../_components/MessageInput";
import VoiceChannelView from "../../_components/VoiceChannelView";
import { useChatStore } from "../../_lib/chat-store";

interface ChannelPageProps {
  params: Promise<{ channelId: string }>;
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = React.use(params);
  const router = useRouter();
  const { setActiveChannel } = useChatStore();
  const didSync = useRef<string>("");

  // Sync store selection with URL — only on channelId change, avoid channels dep
  useEffect(() => {
    if (didSync.current === channelId) return;
    const { channels } = useChatStore.getState();
    const exists = channels.find((c) => c.id === channelId);
    if (!exists) {
      const general = channels.find((c) => c.isDefault) ?? channels[0];
      if (general) {
        router.replace(`/v2/workspace/c/${general.id}`);
      } else {
        router.replace("/v2/workspace");
      }
      return;
    }
    didSync.current = channelId;
    setActiveChannel(channelId);
  }, [channelId, router, setActiveChannel]);

  // Read channel type from store (snapshot)
  const channel = useChatStore((s) => s.channels.find((c) => c.id === channelId));
  if (!channel) return null;

  if (channel.type === "voice") {
    return <VoiceChannelView channelId={channelId} />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );
}
