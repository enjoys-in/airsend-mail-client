"use client";

import React from "react";
import { CornerUpLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReplyReference } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// ReplyQuote — the quoted message above an inline reply (in the list) and
// above the composer while replying (with a close button).
// Clicking it scrolls to the original message when it is loaded.
// ---------------------------------------------------------------------------

interface ReplyQuoteProps {
  reply: ReplyReference;
  /** Composer mode: shows "Replying to" and a close button. */
  onCancel?: () => void;
  className?: string;
}

export function scrollToMessage(messageId: string) {
  const el = document.getElementById(`msg-${messageId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("ring-2", "ring-primary/40");
  setTimeout(() => el.classList.remove("ring-2", "ring-primary/40"), 1500);
}

export default function ReplyQuote({ reply, onCancel, className }: ReplyQuoteProps) {
  const text = reply.content || "Original message";
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-md border-l-2 border-primary/60 bg-accent/50 px-2 py-1 text-xs",
        className,
      )}
    >
      <CornerUpLeft className="size-3 shrink-0 text-muted-foreground" />
      <button
        type="button"
        onClick={() => scrollToMessage(reply.messageId)}
        className="flex min-w-0 flex-1 items-baseline gap-1.5 text-left"
        title="Go to the original message"
      >
        {onCancel && <span className="shrink-0 text-muted-foreground">Replying to</span>}
        {reply.authorName && <span className="shrink-0 font-semibold text-foreground">{reply.authorName}</span>}
        <span className="truncate text-muted-foreground">{text}</span>
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel reply"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
