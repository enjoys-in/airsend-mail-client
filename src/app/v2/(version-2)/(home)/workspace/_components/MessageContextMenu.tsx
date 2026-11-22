"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  Reply,
  MessageSquare,
  Pin,
  PinOff,
  Copy,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Smile,
  ArrowDown,
  Search,
  FolderOpen,
  Users,
  Settings,
  PenSquare,
  Share2,
  Hash,
  ShieldAlert,
  Clock,
  TimerOff,
  UserCog,
  UserX,
  Forward,
  CheckSquare,
} from "lucide-react";
import { useChatStore } from "../_lib/chat-store";
import { useChannelPermissions, settingsPath } from "../_lib/use-access";
import { useMessageActions, formatUntil } from "../_lib/use-message-actions";
import { TIMEOUT_PRESETS } from "../_lib/member-actions";
import { toast } from "sonner";
import type { ChatMessage, Channel, DirectMessage } from "../_lib/chat-types";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🔥", "👀", "💡", "🚀", "👏"];

// ---------------------------------------------------------------------------
// MessageContextMenu — right-click context menu on any workspace message
// ---------------------------------------------------------------------------

interface MessageContextMenuProps {
  message: ChatMessage;
  children: React.ReactNode;
}

const itemCls = "gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg";
const sepCls = "my-1 bg-border/60";

export function MessageContextMenu({ message, children }: MessageContextMenuProps) {
  const a = useMessageActions(message);
  const authorName = a.author?.displayName || message.authorName || message.authorId;
  const canModerateAuthor = a.canTimeoutAuthor || a.canKickAuthor || a.canChangeAuthorRole;
  const hasPrimary = a.canReply || a.canReplyThread;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-60 rounded-xl shadow-xl border-border/80 bg-popover/95 backdrop-blur-md p-1.5 animate-in fade-in zoom-in-95 duration-100">
        {/* Quick reactions */}
        {a.canReact && (
          <div className="flex items-center justify-between gap-1 px-1.5 py-1 mb-1 rounded-lg bg-muted/50 border border-border/50">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => a.react(emoji)}
                className="flex size-6.5 items-center justify-center rounded-md text-sm hover:bg-background hover:scale-115 active:scale-95 transition-all"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {a.canReply && (
          <ContextMenuItem onClick={a.reply} className={itemCls}>
            <Reply className="size-3.5 text-muted-foreground" />
            <span>Reply</span>
            <ContextMenuShortcut>R</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        {a.canReplyThread && (
          <ContextMenuItem onClick={a.replyInThread} className={itemCls}>
            <MessageSquare className="size-3.5 text-muted-foreground" />
            <span>Reply in Thread</span>
            <ContextMenuShortcut>T</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        {(a.canEdit || a.canPin) && (
          <>
            {hasPrimary && <ContextMenuSeparator className={sepCls} />}
            {a.canEdit && (
              <ContextMenuItem onClick={a.edit} className={itemCls}>
                <Pencil className="size-3.5 text-muted-foreground" />
                <span>Edit Message</span>
                <ContextMenuShortcut>E</ContextMenuShortcut>
              </ContextMenuItem>
            )}
            {a.canPin && (
              <ContextMenuItem onClick={a.togglePin} className={itemCls}>
                {message.isPinned ? (
                  <PinOff className="size-3.5 text-muted-foreground" />
                ) : (
                  <Pin className="size-3.5 text-muted-foreground" />
                )}
                <span>{message.isPinned ? "Unpin Message" : "Pin Message"}</span>
              </ContextMenuItem>
            )}
          </>
        )}

        <ContextMenuSeparator className={sepCls} />
        <ContextMenuItem onClick={a.forward} className={itemCls}>
          <Forward className="size-3.5 text-muted-foreground" />
          <span>Forward</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={a.select} className={itemCls}>
          <CheckSquare className="size-3.5 text-muted-foreground" />
          <span>Select Messages</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={a.copyText} className={itemCls}>
          <Copy className="size-3.5 text-muted-foreground" />
          <span>Copy Text</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={a.copyLink} className={itemCls}>
          <LinkIcon className="size-3.5 text-muted-foreground" />
          <span>Copy Message Link</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={a.copyId} className={itemCls}>
          <Hash className="size-3.5 text-muted-foreground" />
          <span>Copy Message ID</span>
        </ContextMenuItem>

        {/* Moderation of the author (only below your rank, never the owner) */}
        {canModerateAuthor && (
          <>
            <ContextMenuSeparator className={sepCls} />
            <ContextMenuSub>
              <ContextMenuSubTrigger className={itemCls}>
                <ShieldAlert className="size-3.5 text-muted-foreground" />
                <span className="truncate">Moderate {authorName}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56 rounded-xl p-1.5">
                {a.authorTimedOut && (
                  <ContextMenuLabel className="text-[11px] font-normal text-amber-600 dark:text-amber-400">
                    Timed out · {formatUntil(a.author?.timedOutUntil)} left
                  </ContextMenuLabel>
                )}
                {a.canTimeoutAuthor && (
                  <ContextMenuSub>
                    <ContextMenuSubTrigger className={itemCls}>
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span>{a.authorTimedOut ? "Change Timeout" : "Timeout"}</span>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-40 rounded-xl p-1.5">
                      {TIMEOUT_PRESETS.map((p) => (
                        <ContextMenuItem
                          key={p.minutes}
                          onClick={() => a.timeoutAuthor(p.minutes, p.label)}
                          className={itemCls}
                        >
                          {p.label}
                        </ContextMenuItem>
                      ))}
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                )}
                {a.canTimeoutAuthor && a.authorTimedOut && (
                  <ContextMenuItem onClick={a.clearAuthorTimeout} className={itemCls}>
                    <TimerOff className="size-3.5 text-muted-foreground" />
                    <span>Remove Timeout</span>
                  </ContextMenuItem>
                )}
                {a.canChangeAuthorRole && (
                  <ContextMenuItem onClick={a.manageAuthor} className={itemCls}>
                    <UserCog className="size-3.5 text-muted-foreground" />
                    <span>Manage Roles…</span>
                  </ContextMenuItem>
                )}
                {a.canKickAuthor && (
                  <>
                    <ContextMenuSeparator className={sepCls} />
                    <ContextMenuItem
                      onClick={a.kickAuthor}
                      className={`${itemCls} text-destructive focus:text-destructive focus:bg-destructive/10`}
                    >
                      <UserX className="size-3.5" />
                      <span>Remove from Team</span>
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        {a.canDelete && (
          <>
            <ContextMenuSeparator className={sepCls} />
            <ContextMenuItem
              onClick={a.remove}
              className={`${itemCls} text-destructive focus:text-destructive focus:bg-destructive/10`}
            >
              <Trash2 className="size-3.5" />
              <span>Delete Message</span>
              <ContextMenuShortcut className="text-destructive/70">Del</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ---------------------------------------------------------------------------
// WorkspaceContextMenu — right-click context menu directly in the workspace canvas
// ---------------------------------------------------------------------------

interface WorkspaceContextMenuProps {
  channel?: Channel | null;
  dm?: DirectMessage | null;
  onScrollToBottom?: () => void;
  onFocusInput?: () => void;
  onOpenSettings?: () => void;
  children: React.ReactNode;
}

export function WorkspaceContextMenu({
  channel,
  dm,
  onScrollToBottom,
  onFocusInput,
  onOpenSettings,
  children,
}: WorkspaceContextMenuProps) {
  const router = useRouter();
  const setSidePanelView = useChatStore((s) => s.setSidePanelView);
  const chPerms = useChannelPermissions(channel);
  const canWrite = !channel || chPerms.can("send_messages");
  const canOpenChannelSettings = !!channel && (chPerms.canManage || chPerms.canEditOverrides);
  const openSettings = () => {
    if (!channel) return;
    if (onOpenSettings) onOpenSettings();
    else router.push(settingsPath.channel(channel.teamId, channel.id));
  };

  const handleCopyWorkspaceLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Workspace link copied to clipboard");
  };

  const handleNewMessage = () => {
    if (onFocusInput) {
      onFocusInput();
    } else {
      const input = document.getElementById("workspace-message-input") as HTMLTextAreaElement | null;
      input?.focus();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56 rounded-xl shadow-xl border-border/80 bg-popover/95 backdrop-blur-md p-1.5 animate-in fade-in zoom-in-95 duration-100">
        {/* Write new message */}
        {canWrite && (
          <ContextMenuItem
            onClick={handleNewMessage}
            className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
          >
            <PenSquare className="size-3.5 text-muted-foreground" />
            <span>New Message</span>
            <ContextMenuShortcut>N</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        {/* Scroll to bottom */}
        {onScrollToBottom && (
          <ContextMenuItem
            onClick={onScrollToBottom}
            className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
          >
            <ArrowDown className="size-3.5 text-muted-foreground" />
            <span>Scroll to Latest</span>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator className="my-1 bg-border/60" />

        {/* Search */}
        <ContextMenuItem
          onClick={() => setSidePanelView("search")}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <Search className="size-3.5 text-muted-foreground" />
          <span>Search in Conversation</span>
        </ContextMenuItem>

        {/* Pinned Messages */}
        <ContextMenuItem
          onClick={() => setSidePanelView("pinned")}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <Pin className="size-3.5 text-muted-foreground" />
          <span>Pinned Messages</span>
        </ContextMenuItem>

        {/* Shared files */}
        <ContextMenuItem
          onClick={() => router.push("/v2/workspace/files")}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <FolderOpen className="size-3.5 text-muted-foreground" />
          <span>Shared Files</span>
        </ContextMenuItem>

        {/* Members */}
        {channel && (
          <ContextMenuItem
            onClick={() => setSidePanelView("members")}
            className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
          >
            <Users className="size-3.5 text-muted-foreground" />
            <span>Channel Members</span>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator className="my-1 bg-border/60" />

        {/* Channel settings (manage_channel or manage_roles) */}
        {canOpenChannelSettings && (
          <ContextMenuItem
            onClick={openSettings}
            className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
          >
            <Settings className="size-3.5 text-muted-foreground" />
            <span>Channel Settings</span>
          </ContextMenuItem>
        )}

        {/* Copy Channel/DM Link */}
        <ContextMenuItem
          onClick={handleCopyWorkspaceLink}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <Share2 className="size-3.5 text-muted-foreground" />
          <span>Copy {channel ? "Channel" : "Conversation"} Link</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
