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
  Sparkles,
  Share2,
} from "lucide-react";
import { useChatStore } from "../_lib/chat-store";
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

export function MessageContextMenu({ message, children }: MessageContextMenuProps) {
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

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.hash = `msg-${message.id}`;
    navigator.clipboard.writeText(url.toString());
    toast.success("Message link copied to clipboard");
  };

  const handleDelete = () => {
    deleteMessage(message.id);
    toast.success("Message deleted");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-60 rounded-xl shadow-xl border-border/80 bg-popover/95 backdrop-blur-md p-1.5 animate-in fade-in zoom-in-95 duration-100">
        {/* Quick Reactions Bar */}
        <div className="flex items-center justify-between gap-1 px-1.5 py-1 mb-1 rounded-lg bg-muted/50 border border-border/50">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                addReaction(message.id, emoji);
                toast.success(`Reacted with ${emoji}`);
              }}
              className="flex size-6.5 items-center justify-center rounded-md text-sm hover:bg-background hover:scale-115 active:scale-95 transition-all"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Reply in thread */}
        <ContextMenuItem
          onClick={() => openThread(message.id)}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <MessageSquare className="size-3.5 text-muted-foreground" />
          <span>Reply in Thread</span>
          <ContextMenuShortcut>T</ContextMenuShortcut>
        </ContextMenuItem>

        {/* Quote / reply in channel */}
        <ContextMenuItem
          onClick={() => setReplyingTo(message)}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <Reply className="size-3.5 text-muted-foreground" />
          <span>Reply in Channel</span>
          <ContextMenuShortcut>R</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator className="my-1 bg-border/60" />

        {/* Copy text */}
        <ContextMenuItem
          onClick={handleCopyText}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <Copy className="size-3.5 text-muted-foreground" />
          <span>Copy Text</span>
        </ContextMenuItem>

        {/* Copy link to message */}
        <ContextMenuItem
          onClick={handleCopyLink}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <LinkIcon className="size-3.5 text-muted-foreground" />
          <span>Copy Message Link</span>
        </ContextMenuItem>

        {/* Pin / unpin */}
        {message.isPinned ? (
          <ContextMenuItem
            onClick={() => {
              unpinMessage(message.id);
              toast.success("Message unpinned");
            }}
            className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
          >
            <PinOff className="size-3.5 text-muted-foreground" />
            <span>Unpin Message</span>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            onClick={() => {
              pinMessage(message.id, true);
              toast.success("Message pinned");
            }}
            className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
          >
            <Pin className="size-3.5 text-muted-foreground" />
            <span>Pin to Channel</span>
          </ContextMenuItem>
        )}

        {/* Edit & Delete for own messages */}
        {isMine && (
          <>
            <ContextMenuSeparator className="my-1 bg-border/60" />

            <ContextMenuItem
              onClick={() => setEditingMessage(message.id)}
              className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              <span>Edit Message</span>
              <ContextMenuShortcut>E</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleDelete}
              className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Message</span>
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
        <ContextMenuItem
          onClick={handleNewMessage}
          className="gap-2.5 text-xs py-1.5 cursor-pointer rounded-lg"
        >
          <PenSquare className="size-3.5 text-muted-foreground" />
          <span>New Message</span>
          <ContextMenuShortcut>N</ContextMenuShortcut>
        </ContextMenuItem>

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

        {/* Channel settings */}
        {channel && onOpenSettings && (
          <ContextMenuItem
            onClick={onOpenSettings}
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
