"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import MessageList from "../../_components/MessageList";
import MessageInput from "../../_components/MessageInput";
import { useChatStore } from "../../_lib/chat-store";

interface DMPageProps {
  params: Promise<{ dmId: string }>;
}

export default function DMPage({ params }: DMPageProps) {
  const { dmId } = React.use(params);
  const router = useRouter();
  const { directMessages, channels, setActiveDm } = useChatStore();

  useEffect(() => {
    const exists = directMessages.find((d) => d.id === dmId);
    if (!exists) {
      // Invalid DM — redirect to default channel or workspace root
      const general = channels.find((c) => c.isDefault) ?? channels[0];
      if (general) {
        router.replace(`/v2/workspace/c/${general.id}`);
      } else {
        router.replace("/v2/workspace");
      }
      return;
    }
    // Sync store with URL
    setActiveDm(dmId);
  }, [dmId, directMessages, channels, router, setActiveDm]);

  const exists = directMessages.find((d) => d.id === dmId);
  if (!exists) return null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList dmId={dmId} />
      <MessageInput dmId={dmId} />
    </div>
  );
}
