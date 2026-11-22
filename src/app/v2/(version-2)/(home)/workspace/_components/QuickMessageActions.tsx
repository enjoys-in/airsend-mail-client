"use client";

import React from "react";
import { CheckSquare, Copy, Forward, Reply } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useChatStore } from "../_lib/chat-store";
import { useSelection } from "../_lib/selection-store";
import { isValidUUID } from "../_lib/api";
import type { ChatMessage } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// QuickMessageActions — hover toolbar for messages that have no channel
// permissions to consult (DMs): Reply, Forward, Select, Copy.
// The parent must be `relative group`.
// ---------------------------------------------------------------------------

const BUTTON = cn(
  "flex size-7 items-center justify-center rounded-sm text-muted-foreground",
  "hover:bg-accent hover:text-foreground",
);
const TOOLBAR = cn(
  "absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-border/60 bg-popover p-0.5",
  "opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-within:opacity-100",
);

function ActionButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={BUTTON}
    >
      {children}
    </button>
  );
}

export default function QuickMessageActions({ message }: { message: ChatMessage }) {
  const setReplyingTo = useChatStore((s) => s.setReplyingTo);
  const openForward = useSelection((s) => s.openForward);
  const start = useSelection((s) => s.start);

  // Not yet on the server (sending / failed): nothing to reply to or forward.
  if (message.isDeleted || !isValidUUID(message.id)) return null;

  const copy = () =>
    navigator.clipboard
      .writeText(message.content)
      .then(() => toast.success("Message copied"))
      .catch(() => toast.error("Could not copy to the clipboard"));

  return (
    <div className={TOOLBAR}>
      <ActionButton label="Reply" onClick={() => setReplyingTo(message)}>
        <Reply className="size-3.5" />
      </ActionButton>
      <ActionButton label="Forward" onClick={() => openForward(message.channelId, [message.id])}>
        <Forward className="size-3.5" />
      </ActionButton>
      <ActionButton label="Select messages" onClick={() => start(message.channelId, message.id)}>
        <CheckSquare className="size-3.5" />
      </ActionButton>
      <ActionButton label="Copy text" onClick={copy}>
        <Copy className="size-3.5" />
      </ActionButton>
    </div>
  );
}
