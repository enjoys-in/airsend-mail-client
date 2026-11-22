"use client";

import React from "react";
import {
  MoreHorizontal,
  Reply,
  Pin,
  PinOff,
  Copy,
  Pencil,
  Trash2,
  MessageSquare,
  Link as LinkIcon,
  ShieldAlert,
  Clock,
  TimerOff,
  UserCog,
  UserX,
  Forward,
  CheckSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMessageActions } from "../_lib/use-message-actions";
import { TIMEOUT_PRESETS } from "../_lib/member-actions";
import type { ChatMessage } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// Message Actions — hover toolbar + "more" menu on each message. Same
// permissions and handlers as the right-click menu (useMessageActions).
// ---------------------------------------------------------------------------

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🔥", "👀"];

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function MessageActions({ message }: { message: ChatMessage }) {
  const a = useMessageActions(message);
  if (message.isDeleted) return null;

  const authorName = a.author?.displayName || message.authorName || message.authorId;
  const canModerateAuthor = a.canTimeoutAuthor || a.canKickAuthor || a.canChangeAuthorRole;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-border/60 bg-popover p-0.5 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {a.canReact &&
          QUICK_REACTIONS.map((emoji) => (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`React with ${emoji}`}
                  onClick={() => a.react(emoji)}
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

        {a.canReply && (
          <ToolbarButton label="Reply" onClick={a.reply}>
            <Reply className="size-3.5" />
          </ToolbarButton>
        )}
        {a.canReplyThread && (
          <ToolbarButton label="Reply in Thread" onClick={a.replyInThread}>
            <MessageSquare className="size-3.5" />
          </ToolbarButton>
        )}
        <ToolbarButton label="Forward" onClick={a.forward}>
          <Forward className="size-3.5" />
        </ToolbarButton>
        {a.canEdit && (
          <ToolbarButton label="Edit" onClick={a.edit}>
            <Pencil className="size-3.5" />
          </ToolbarButton>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More actions"
              className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {a.canPin && (
              <DropdownMenuItem onClick={a.togglePin}>
                {message.isPinned ? <PinOff className="mr-2 size-4" /> : <Pin className="mr-2 size-4" />}
                {message.isPinned ? "Unpin Message" : "Pin Message"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={a.select}>
              <CheckSquare className="mr-2 size-4" />
              Select Messages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={a.copyText}>
              <Copy className="mr-2 size-4" />
              Copy Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={a.copyLink}>
              <LinkIcon className="mr-2 size-4" />
              Copy Message Link
            </DropdownMenuItem>

            {canModerateAuthor && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ShieldAlert className="mr-2 size-4" />
                    <span className="truncate">Moderate {authorName}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-52">
                    {a.canTimeoutAuthor && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Clock className="mr-2 size-4" />
                          {a.authorTimedOut ? "Change Timeout" : "Timeout"}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40">
                          {TIMEOUT_PRESETS.map((p) => (
                            <DropdownMenuItem key={p.minutes} onClick={() => a.timeoutAuthor(p.minutes, p.label)}>
                              {p.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    {a.canTimeoutAuthor && a.authorTimedOut && (
                      <DropdownMenuItem onClick={a.clearAuthorTimeout}>
                        <TimerOff className="mr-2 size-4" />
                        Remove Timeout
                      </DropdownMenuItem>
                    )}
                    {a.canChangeAuthorRole && (
                      <DropdownMenuItem onClick={a.manageAuthor}>
                        <UserCog className="mr-2 size-4" />
                        Manage Roles…
                      </DropdownMenuItem>
                    )}
                    {a.canKickAuthor && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={a.kickAuthor}
                      >
                        <UserX className="mr-2 size-4" />
                        Remove from Team
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}

            {a.canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={a.remove}>
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
