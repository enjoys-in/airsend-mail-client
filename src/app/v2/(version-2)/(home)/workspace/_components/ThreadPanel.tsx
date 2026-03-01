"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Send,
  MessageSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "../_lib/chat-store";
import { CURRENT_USER_ID } from "../_lib/mock-data";

// ---------------------------------------------------------------------------
// ThreadPanel — right-side panel for thread replies (Slack-style)
// ---------------------------------------------------------------------------

export default function ThreadPanel() {
  const {
    activeThreadMessageId,
    messages,
    threadReplies,
    closeThread,
    sendThreadReply,
  } = useChatStore();

  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parentMsg = messages.find((m:any) => m.id === activeThreadMessageId);
  const replies = threadReplies.filter(
    (r) => r.threadId === activeThreadMessageId,
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length]);

  const handleSend = () => {
    if (!content.trim()) return;
    sendThreadReply(content);
    setContent("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      closeThread();
    }
  };

  if (!parentMsg) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-border/40 bg-background">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Thread</h3>
          <span className="text-xs text-muted-foreground">
            {replies.length}{" "}
            {replies.length === 1 ? "reply" : "replies"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={closeThread}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Thread content */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          {/* Parent message */}
          <ThreadMessage
            authorName={parentMsg.authorName}
            authorId={parentMsg.authorId}
            content={parentMsg.content}
            createdAt={parentMsg.createdAt}
            isParent
          />

          {/* Replies separator */}
          {replies.length > 0 && (
            <div className="relative my-3 flex items-center">
              <div className="flex-1 border-t border-border/40" />
              <span className="mx-3 text-[11px] text-muted-foreground">
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </span>
              <div className="flex-1 border-t border-border/40" />
            </div>
          )}

          {/* Thread replies */}
          {replies.map((reply) => (
            <ThreadMessage
              key={reply.id}
              authorName={reply.authorName}
              authorId={reply.authorId}
              content={reply.content}
              createdAt={reply.createdAt}
            />
          ))}

          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Reply input */}
      <div className="shrink-0 border-t border-border/40 p-3">
        <div className="rounded-lg border border-border/60 bg-accent/20 focus-within:border-primary/40 transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply..."
            rows={2}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end px-2 pb-1.5">
            <Button
              size="sm"
              className="h-7 px-3 text-xs"
              disabled={!content.trim()}
              onClick={handleSend}
            >
              <Send className="mr-1 size-3" />
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single thread message
// ---------------------------------------------------------------------------

function ThreadMessage({
  authorName,
  authorId,
  content,
  createdAt,
  isParent,
}: {
  authorName: string;
  authorId: string;
  content: string;
  createdAt: string;
  isParent?: boolean;
}) {
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex gap-3 py-2", isParent && "pb-3")}>
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {authorName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              authorId === CURRENT_USER_ID
                ? "text-primary"
                : "text-foreground",
            )}
          >
            {authorName}
          </span>
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
