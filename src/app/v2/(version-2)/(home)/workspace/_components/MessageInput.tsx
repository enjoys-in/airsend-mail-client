"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  Smile,
  AtSign,
  X,
  Reply,
  Bold,
  Italic,
  Code,
  Image,
  AlertTriangle,
  Bell,
  ChevronDown,
  Lock,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi } from "../_lib/api";
import { canUserPerformInChannel, getUserRoleInTeam } from "../_lib/permissions";
import { useAccessStore } from "../_lib/access-store";
import { isTimedOut } from "../_lib/use-access";
import { formatUntil } from "../_lib/member-actions";
import MentionPopover from "./MentionPopover";
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";
import { PollCreatorDialog } from "./PollCreatorDialog";
import type { MessagePriority } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// MessageInput — rich text input with mentions, replies, emoji, GIF, files
// ---------------------------------------------------------------------------

interface MessageInputProps {
  channelId?: string;
  dmId?: string;
}

export default function MessageInput({ channelId, dmId }: MessageInputProps) {
  const {
    activeChannelId,
    activeDmId,
    channels,
    directMessages,
    replyingTo,
    editingMessageId,
    messages,
    members,
    sendMessage,
    editMessage,
    setReplyingTo,
    setEditingMessage,
    currentUserId,
  } = useChatStore();

  // Props from URL take priority
  const effectiveChannelId = channelId ?? activeChannelId;
  const effectiveDmId = dmId ?? activeDmId;

  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<MessagePriority>("normal");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const channel = effectiveChannelId
    ? channels.find((c:any) => c.id === effectiveChannelId)
    : null;

  const dm = effectiveDmId
    ? directMessages.find((d:any) => d.id === effectiveDmId)
    : null;

  // Timed-out members can read but not post (the server blocks it too).
  const timedOutUntil = useAccessStore((s) => (channel ? s.access[channel.teamId]?.timedOutUntil : undefined));
  const timedOut = !dm && isTimedOut(timedOutUntil);

  const placeholderText = channel
    ? `Message #${channel.name}`
    : dm
      ? "Message"
      : "Select a conversation";

  // Populate textarea when editing
  useEffect(() => {
    if (editingMessageId) {
      const msg = messages.find((m:any) => m.id === editingMessageId);
      if (msg) {
        setContent(msg.content);
        textareaRef.current?.focus();
      }
    }
  }, [editingMessageId, messages]);

  // Auto-focus when replying
  useEffect(() => {
    if (replyingTo) textareaRef.current?.focus();
  }, [replyingTo]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [content]);

  const handleSubmit = useCallback(() => {
    if (!content.trim()) return;

    if (editingMessageId) {
      editMessage(editingMessageId, content.trim());
      setContent("");
    } else {
      // Extract @mentions from content and resolve to user IDs
      const mentionMatches = content.match(/@(\w[\w.]*)/g) || [];
      const mentionIds: string[] = mentionMatches
        .map((m) => {
          const username = m.slice(1); // remove @
          const member = members.find(
            (mb:any) =>
              mb.username === username ||
              mb.displayName.toLowerCase().replace(/\s/g, ".") === username,
          );
          return member?.userId;
        })
        .filter((id): id is string => !!id);
      sendMessage(content, mentionIds, [], priority);
      setContent("");
      setPriority("normal");
    }

    textareaRef.current?.focus();
  }, [content, editingMessageId, editMessage, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (but Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Cancel edit with Escape
    if (e.key === "Escape") {
      if (editingMessageId) {
        setEditingMessage(null);
        setContent("");
      } else if (replyingTo) {
        setReplyingTo(null);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Detect @mention trigger
    const cursor = e.target.selectionStart || 0;
    const textBefore = val.slice(0, cursor);
    const atMatch = textBefore.match(/@(\w*)$/);

    if (atMatch) {
      setShowMentions(true);
      setMentionQuery(atMatch[1]);
      setMentionStart(cursor - atMatch[0].length);
    } else {
      setShowMentions(false);
      setMentionQuery("");
      setMentionStart(null);
    }
  };

  const insertMention = (username: string) => {
    if (mentionStart === null) return;
    const before = content.slice(0, mentionStart);
    const cursor = textareaRef.current?.selectionStart || content.length;
    const after = content.slice(cursor);
    const newContent = `${before}@${username} ${after}`;
    setContent(newContent);
    setShowMentions(false);
    setMentionQuery("");
    setMentionStart(null);
    textareaRef.current?.focus();
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // File upload — sends a message then attaches files to it
  const handleFileUpload = async (files: File[]) => {
    if (!effectiveChannelId || !currentUserId) return;

    for (const file of files) {
      // Send a file message
      try {
        const serverMsg = await workspaceApi.sendMessage(
          effectiveChannelId,
          { content: `📎 ${file.name}`, type: "file" },
          currentUserId,
        );

        // Upload attachment to the message
        await workspaceApi.uploadAttachment(serverMsg.id, file, currentUserId);

        // Refetch messages to show the attachment
        const { fetchMessages } = useChatStore.getState();
        fetchMessages(effectiveChannelId, currentUserId);
      } catch {
        // Could show error toast
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) handleFileUpload(files);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Commands
  const handleCommand = (cmd: string) => {
    switch (cmd) {
      case "/me":
        setContent(content + "/me ");
        break;
      case "/w":
        setContent(content + "/w ");
        break;
    }
    textareaRef.current?.focus();
  };

  if (!channel && !dm) return null;

  const userRole = channel
    ? getUserRoleInTeam(members, channel.teamId, currentUserId)
    : "member";

  const isLocked = channel?.isLocked ?? false;
  const isAnnouncement =
    channel?.type === "announcement" || channel?.postingPermission === "admins_only";

  const canSend = dm
    ? true
    : !timedOut && canUserPerformInChannel(channel, currentUserId, userRole, "send_messages");

  const canAttach = dm
    ? true
    : canUserPerformInChannel(channel, currentUserId, userRole, "send_media");

  const canGif = dm
    ? true
    : canUserPerformInChannel(channel, currentUserId, userRole, "send_gifs");

  const canPoll = dm
    ? false
    : canUserPerformInChannel(channel, currentUserId, userRole, "create_polls");

  const canEmoji = dm
    ? true
    : canUserPerformInChannel(channel, currentUserId, userRole, "use_emojis");

  const canMentionEveryone = dm
    ? false
    : canUserPerformInChannel(channel, currentUserId, userRole, "mention_everyone");

  const activePlaceholder = !canSend
    ? timedOut
      ? `You're timed out for ${formatUntil(timedOutUntil)} — you can read but not post.`
      : isLocked
      ? "This channel is locked — only admins and moderators can post."
      : isAnnouncement
        ? "Only admins and moderators can post in this announcement channel."
        : "You do not have permission to send messages in this channel."
    : placeholderText;

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/40 px-4 pb-3 pt-2",
        isDragging && "bg-primary/5 border-primary/30",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Timed out ── */}
      {timedOut && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span className="font-medium">
            You&apos;re timed out for {formatUntil(timedOutUntil)}. You can read, but can&apos;t post, react or join calls until it ends.
          </span>
        </div>
      )}

      {/* ── Channel Locked Warning ── */}
      {!timedOut && isLocked && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <Lock className="size-3.5 shrink-0" />
          <span className="font-medium">
            This channel is locked — only admins and moderators can post.
          </span>
        </div>
      )}

      {/* ── Announcement / Admins-Only Warning ── */}
      {!timedOut && !isLocked && isAnnouncement && !canSend && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
          <Shield className="size-3.5 shrink-0" />
          <span className="font-medium">
            Only admins and moderators can post messages in this announcement channel.
          </span>
        </div>
      )}

      {/* ── Granular OpenFGA Denied Warning ── */}
      {!timedOut && !isLocked && !isAnnouncement && !canSend && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/60 border border-border/50 px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
          <span className="font-medium">
            You do not have permission to send messages in this channel.
          </span>
        </div>
      )}

      {/* Reply preview */}
      {replyingTo && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-accent/50 px-3 py-1.5 text-xs">
          <Reply className="size-3 text-muted-foreground" />
          <span className="text-muted-foreground">Replying to</span>
          <span className="font-semibold">{replyingTo.authorName}</span>
          <span className="flex-1 truncate text-muted-foreground">
            {replyingTo.content}
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Edit indicator */}
      {editingMessageId && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-yellow-500/10 px-3 py-1.5 text-xs">
          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
            Editing message
          </span>
          <span className="flex-1" />
          <button
            onClick={() => {
              setEditingMessage(null);
              setContent("");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="mb-2 flex items-center justify-center rounded-md border-2 border-dashed border-primary/40 py-4 text-sm text-primary">
          Drop files to upload
        </div>
      )}

      {/* Input area */}
      <div className="relative">
        {/* Mention popover */}
        {showMentions && canSend && (
          <MentionPopover
            query={mentionQuery}
            onSelect={insertMention}
            onClose={() => setShowMentions(false)}
          />
        )}

        <div className={cn(
          "rounded-lg border border-border/60 bg-accent/20 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all",
          !canSend && "opacity-75 bg-muted/20 border-border/40 cursor-not-allowed"
        )}>
          <textarea
            id="workspace-message-input"
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={activePlaceholder}
            disabled={!canSend}
            rows={1}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-2 pb-1.5">
            <div className="flex items-center gap-0.5">
              <ToolbarButton
                icon={<Bold className="size-3.5" />}
                tooltip="Bold"
                disabled={!canSend}
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (!textarea) return;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selected = content.slice(start, end);
                  const newContent =
                    content.slice(0, start) + `**${selected}**` + content.slice(end);
                  setContent(newContent);
                }}
              />
              <ToolbarButton
                icon={<Italic className="size-3.5" />}
                tooltip="Italic"
                disabled={!canSend}
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (!textarea) return;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selected = content.slice(start, end);
                  const newContent =
                    content.slice(0, start) + `*${selected}*` + content.slice(end);
                  setContent(newContent);
                }}
              />
              <ToolbarButton
                icon={<Code className="size-3.5" />}
                tooltip="Code"
                disabled={!canSend}
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (!textarea) return;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selected = content.slice(start, end);
                  const newContent =
                    content.slice(0, start) +
                    "`" +
                    selected +
                    "`" +
                    content.slice(end);
                  setContent(newContent);
                }}
              />
              <div className="mx-1 h-4 w-px bg-border/60" />
              <ToolbarButton
                icon={<AtSign className="size-3.5" />}
                tooltip="Mention"
                disabled={!canSend}
                onClick={() => {
                  setContent(content + "@");
                  setShowMentions(true);
                  setMentionQuery("");
                  setMentionStart(content.length);
                  textareaRef.current?.focus();
                }}
              />
              <EmojiPicker
                onSelect={(emoji) => {
                  setContent((prev) => prev + emoji);
                  textareaRef.current?.focus();
                }}
                trigger={
                  <ToolbarButton
                    icon={<Smile className="size-3.5" />}
                    tooltip="Emoji"
                    disabled={!canSend || !canEmoji}
                    onClick={() => {}}
                  />
                }
              />
              <ToolbarButton
                icon={<Paperclip className="size-3.5" />}
                tooltip="Attach file, photo or video"
                disabled={!canSend || !canAttach}
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                disabled={!canSend || !canAttach}
                onChange={handleFileSelect}
              />
              <GifPicker
                onSelect={(url) => {
                  sendMessage(url);
                }}
                trigger={
                  <ToolbarButton
                    icon={<Image className="size-3.5" />}
                    tooltip="GIF"
                    disabled={!canSend || !canGif}
                    onClick={() => {}}
                  />
                }
              />
              {/* Poll button — channels only, not DMs */}
              {effectiveChannelId && !effectiveDmId && (
                <ToolbarButton
                  icon={<BarChart3 className="size-3.5" />}
                  tooltip="Create poll"
                  disabled={!canSend || !canPoll}
                  onClick={() => setPollDialogOpen(true)}
                />
              )}
            </div>

            <div className="flex-1" />

            {/* Priority selector */}
            <PrioritySelector
              priority={priority}
              onChange={setPriority}
              canMentionEveryone={canMentionEveryone}
            />

            <Button
              size="sm"
              className="h-7 px-3 text-xs"
              disabled={!canSend || !content.trim()}
              onClick={handleSubmit}
            >
              <Send className="mr-1 size-3" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Poll creator dialog */}
      {effectiveChannelId && (
        <PollCreatorDialog
          open={pollDialogOpen}
          onOpenChange={setPollDialogOpen}
          channelId={effectiveChannelId}
          email={currentUserId}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

function ToolbarButton({
  icon,
  tooltip,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? `${tooltip} (disabled by channel policy)` : tooltip}
      className={cn(
        "flex size-7 items-center justify-center rounded text-muted-foreground transition-colors",
        disabled
          ? "opacity-35 cursor-not-allowed pointer-events-none"
          : "hover:bg-accent hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Priority selector dropdown
// ---------------------------------------------------------------------------

const PRIORITY_OPTIONS: {
  value: MessagePriority;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "normal",
    label: "Normal",
    icon: <Send className="size-3" />,
    color: "text-muted-foreground",
  },
  {
    value: "everyone",
    label: "@Everyone",
    icon: <Bell className="size-3 text-blue-500" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "urgent",
    label: "Urgent",
    icon: <AlertTriangle className="size-3 text-red-500" />,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "priority",
    label: "Priority",
    icon: <AlertTriangle className="size-3 text-orange-500" />,
    color: "text-orange-600 dark:text-orange-400",
  },
];

function PrioritySelector({
  priority,
  onChange,
  canMentionEveryone = true,
}: {
  priority: MessagePriority;
  onChange: (p: MessagePriority) => void;
  canMentionEveryone?: boolean;
}) {
  const availableOptions = canMentionEveryone
    ? PRIORITY_OPTIONS
    : PRIORITY_OPTIONS.filter((o) => o.value !== "everyone");

  const current =
    availableOptions.find((o) => o.value === priority) ?? availableOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-7 items-center gap-1 rounded-md border border-border/60 px-2 text-xs transition-colors hover:bg-accent",
            priority !== "normal" && current.color,
          )}
          title="Message priority"
        >
          {current.icon}
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronDown className="size-2.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-36">
        {availableOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-2 text-xs",
              priority === opt.value && "bg-accent",
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
