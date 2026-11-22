"use client";

import React from "react";
import { Copy, Forward, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSelecting, useSelection } from "../_lib/selection-store";
import type { ChatMessage } from "../_lib/chat-types";
import ForwardDialog from "./ForwardDialog";

// ---------------------------------------------------------------------------
// ConversationSelectionTools — the bar shown while selecting messages in a
// conversation (Forward / Copy / Cancel), plus the forward dialog. Mounted
// once per open conversation (channel view and DM view).
// ---------------------------------------------------------------------------

interface Props {
  conversationId: string;
  messages: ChatMessage[];
}

export default function ConversationSelectionTools({ conversationId, messages }: Props) {
  const selecting = useSelecting(conversationId);
  const selectedIds = useSelection((s) => s.selectedIds);
  const clear = useSelection((s) => s.clear);
  const openForward = useSelection((s) => s.openForward);

  // Keep the conversation order, whatever order they were clicked in.
  const selected = messages.filter((m) => selectedIds.includes(m.id));

  const copy = () => {
    const text = selected.map((m) => `${m.authorName || m.authorId}: ${m.content}`).join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Copied ${selected.length} message${selected.length === 1 ? "" : "s"}`))
      .catch(() => toast.error("Could not copy to the clipboard"));
  };

  return (
    <>
      {selecting && (
        <div className="flex shrink-0 items-center gap-2 border-t border-border/40 bg-accent/30 px-4 py-2 text-sm">
          <span className="font-medium">{selected.length} selected</span>
          <span className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            disabled={!selected.length}
            onClick={() => openForward(conversationId, selected.map((m) => m.id))}
          >
            <Forward className="size-3.5" />
            Forward
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" disabled={!selected.length} onClick={copy}>
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button size="icon" variant="ghost" className="size-8" onClick={clear} aria-label="Cancel selection">
            <X className="size-4" />
          </Button>
        </div>
      )}
      <ForwardDialog conversationId={conversationId} messages={messages} />
    </>
  );
}
