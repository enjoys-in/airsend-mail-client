"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Reply,
  Pin,
  PinOff,
  Smile,
  Copy,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatStore } from "../_lib/chat-store";
import type { ChatMessage } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// Message Actions — hover toolbar + dropdown on each message
// ---------------------------------------------------------------------------

export default function MessageActions({
  message,
}: {
  message: ChatMessage;
}) {
  const {
    currentUserId,
    setReplyingTo,
    setEditingMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    openThread,
    addReaction,
  } = useChatStore();

  const isMine = message.authorId === currentUserId;

  const quickReactions = ["👍", "❤️", "😂", "🔥", "👀"];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-border/60 bg-popover p-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
        {/* Quick reactions */}
        {quickReactions.map((emoji) => (
          <Tooltip key={emoji}>
            <TooltipTrigger asChild>
              <button
                onClick={() => addReaction(message.id, emoji)}
                className="flex size-7 items-center justify-center rounded-sm text-sm hover:bg-accent transition-colors"
              >
                {emoji}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              React with {emoji}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Reply */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setReplyingTo(message)}
              className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Reply className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Reply
          </TooltipContent>
        </Tooltip>

        {/* Thread */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => openThread(message.id)}
              className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <MessageSquare className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Reply in Thread
          </TooltipContent>
        </Tooltip>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setReplyingTo(message)}>
              <Reply className="mr-2 size-4" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openThread(message.id)}>
              <MessageSquare className="mr-2 size-4" />
              Reply in Thread
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {message.isPinned ? (
              <DropdownMenuItem onClick={() => unpinMessage(message.id)}>
                <PinOff className="mr-2 size-4" />
                Unpin Message
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => pinMessage(message.id, true)}
              >
                <Pin className="mr-2 size-4" />
                Pin Message
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(message.content)
              }
            >
              <Copy className="mr-2 size-4" />
              Copy Text
            </DropdownMenuItem>
            {isMine && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setEditingMessage(message.id)}
                >
                  <Pencil className="mr-2 size-4" />
                  Edit Message
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => deleteMessage(message.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Message
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
