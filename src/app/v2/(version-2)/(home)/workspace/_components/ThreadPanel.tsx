"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Send,
  MessageSquare,
  Copy,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { useChatStore } from "../_lib/chat-store";
import { canUserPerformInChannel, getUserRoleInTeam } from "../_lib/permissions";

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
    currentUserId,
    channels,
    activeChannelId,
    activeTeamId,
    members,
  } = useChatStore();

  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parentMsg = messages.find((m:any) => m.id === activeThreadMessageId);
  const replies = threadReplies.filter(
    (r) => r.threadId === activeThreadMessageId,
  );

  const channel = channels.find(
    (c) => c.id === parentMsg?.channelId || c.id === activeChannelId
  );
  const userRole = getUserRoleInTeam(members, activeTeamId, currentUserId);
  const canReplyThreads = canUserPerformInChannel(channel, currentUserId, userRole, "reply_threads");
  const isLocked = channel?.isLocked ?? false;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length]);

  const handleSend = () => {
    if (!content.trim() || !canReplyThreads) return;
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
        {canReplyThreads ? (
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
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            <Lock className="size-3.5 shrink-0" />
            <span>
              {isLocked
                ? "This channel is locked — only admins and moderators can reply in threads."
                : "You do not have permission to reply in threads in this channel."}
            </span>
          </div>
        )}
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
  const currentUserId = useChatStore((s) => s.currentUserId);
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Thread message copied");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={cn("flex gap-3 py-2 rounded-lg px-2 hover:bg-accent/20 transition-colors", isParent && "pb-3")}>
          <Avatar className="mt-0.5 size-7 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {(authorName || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  authorId === currentUserId
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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 rounded-xl shadow-lg border-border/80">
        <ContextMenuItem onClick={handleCopy} className="gap-2 text-xs py-1.5 cursor-pointer">
          <Copy className="size-3.5 text-muted-foreground" />
          <span>Copy Text</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
