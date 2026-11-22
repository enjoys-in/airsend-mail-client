"use client";

import React from "react";
import { AlertCircle, Check, Clock, Eye, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "../_lib/chat-store";
import { seenBy, useReadReceipts } from "../_lib/read-receipts";
import type { ChatMessage } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// MessageStatus — delivery state of MY messages, shown next to the time:
//   clock  sending (in the outbox)       eye    seen by someone else
//   tick   sent (the server has it)      !      not sent: Retry / Discard
// ---------------------------------------------------------------------------

interface MessageStatusProps {
  message: ChatMessage;
  /** Channel or DM conversation id (read receipts are per conversation). */
  conversationId: string;
  me: string;
  className?: string;
}

export default function MessageStatus({ message, conversationId, me, className }: MessageStatusProps) {
  const receipts = useReadReceipts((s) => s.byConversation[conversationId]);
  const retrySend = useChatStore((s) => s.retrySend);
  const discardSend = useChatStore((s) => s.discardSend);

  if (!me || message.authorId.toLowerCase() !== me.toLowerCase() || message.isDeleted) return null;
  const base = cn("inline-flex items-center gap-1 text-[11px]", className);

  if (message.sendStatus === "sending") {
    return (
      <span className={cn(base, "text-muted-foreground")} title="Sending…">
        <Clock className="size-3" />
      </span>
    );
  }

  if (message.sendStatus === "failed") {
    return (
      <span className={cn(base, "text-destructive")}>
        <AlertCircle className="size-3" />
        Not sent
        <StatusButton label="Retry" onClick={() => retrySend(message.id)}>
          <RotateCw className="size-3" />
        </StatusButton>
        <StatusButton label="Discard" onClick={() => discardSend(message.id)}>
          <X className="size-3" />
        </StatusButton>
      </span>
    );
  }

  const seen = seenBy(receipts, me, message.createdAt);
  if (seen.length) {
    const who = seen.length === 1 ? seen[0] : `${seen.length} people`;
    return (
      <span className={cn(base, "text-primary")} title={`Seen by ${who}`} aria-label={`Seen by ${who}`}>
        <Eye className="size-3" />
      </span>
    );
  }

  return (
    <span className={cn(base, "text-muted-foreground")} title="Sent" aria-label="Sent">
      <Check className="size-3" />
    </span>
  );
}

function StatusButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded p-0.5 hover:bg-destructive/10"
    >
      {children}
    </button>
  );
}
