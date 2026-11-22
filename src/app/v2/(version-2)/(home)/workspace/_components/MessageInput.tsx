"use client";

import React, { useState, useRef, useCallback, useEffect, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  Smile,
  AtSign,
  X,
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
import { canUserPerformInChannel, getDMPartner, getUserRoleInTeam } from "../_lib/permissions";
import { useAccessStore } from "../_lib/access-store";
import { isTimedOut } from "../_lib/use-access";
import { formatUntil } from "../_lib/member-actions";
import MentionPopover from "./MentionPopover";
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";
import { PollCreatorDialog } from "./PollCreatorDialog";
import type { MessagePriority } from "../_lib/chat-types";
import { ConversationDropContext } from "./ConversationDropZone";
import { useDrafts } from "../_lib/drafts";
import { useComposerFiles } from "../_lib/use-composer-files";
import StagedFiles from "./StagedFiles";
import DuplicateFileDialog from "./DuplicateFileDialog";
import UploadProgressList from "./UploadProgressList";
import ReplyQuote from "./ReplyQuote";

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
    sendDMText,
    sendFiles,
    pendingUploads,
    cancelUpload,
    retrySend,
  } = useChatStore();

  // Props from URL take priority
  const effectiveChannelId = channelId ?? activeChannelId;
  const effectiveDmId = dmId ?? activeDmId;

  const dropZone = useContext(ConversationDropContext);
  // Don't leave a stale uploader behind when this input goes away.
  useEffect(
    () => () => {
      if (dropZone) dropZone.current = null;
    },
    [dropZone],
  );

  // The text is the conversation's draft: it stays when switching conversations (and across reloads). Editing a
  // message uses its own text so the draft is not overwritten.
  const conversationId = effectiveChannelId ?? effectiveDmId ?? "";
  const draftText = useDrafts((s) => s.drafts[conversationId]?.text ?? "");
  const setDraftText = useDrafts((s) => s.setText);
  const clearDraft = useDrafts((s) => s.clear);
  const composer = useComposerFiles(conversationId);
  const [editText, setEditText] = useState("");
  const content = editingMessageId ? editText : draftText;
  const setContent = useCallback(
    (v: string) => (editingMessageId ? setEditText(v) : setDraftText(conversationId, v)),
    [editingMessageId, conversationId, setDraftText],
  );
  const [priority, setPriority] = useState<MessagePriority>("normal");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
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
        setEditText(msg.content);
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
    const staged = composer.files;
    if (!content.trim() && !(staged.length && !editingMessageId)) return;

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
      if (staged.length) {
        // Staged files go out with the text as caption (one message per file); the draft is cleared.
        const outgoing = composer.outgoing();
        clearDraft(conversationId);
        void sendFiles(outgoing, content.trim());
      } else if (dm && !channel) {
        // Direct message: plain text through the DM endpoint.
        sendDMText(content);
      } else {
        sendMessage(content, mentionIds, [], priority);
      }
      setContent("");
      setPriority("normal");
    }

    textareaRef.current?.focus();
  }, [
    content,
    editingMessageId,
    editMessage,
    sendMessage,
    sendDMText,
    dm,
    channel,
    composer,
    clearDraft,
    conversationId,
    sendFiles,
    members,
    priority,
    setContent,
  ]);

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

  // Drag and drop is handled by <ConversationDropZone> around the whole pane (message list + this input); it hands the
  // dropped files to the uploader registered below, so permissions and the caption work exactly like the paperclip.
  // Picked / dropped files are STAGED in the draft (not sent yet); Enter or Send sends them with the text as caption.
  // A file already shared here asks whether to reuse it (see useComposerFiles).
  const handleFileUpload = async (files: File[]) => {
    if (!conversationId || !currentUserId || !canAttach || !canSend) return;
    composer.stage(files);
    textareaRef.current?.focus();
  };

  // Uploads in flight (or failed) for the open conversation
  const myUploads = pendingUploads.filter(
    (u) => u.contextType !== "team" && (u.contextId === effectiveChannelId || u.contextId === effectiveDmId),
  );

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

  // The drop zone calls this uploader (the latest one: it closes over the typed text and the permissions).
  if (dropZone) dropZone.current = null;

  if (!channel && !dm) return null;

  const userRole = channel
    ? getUserRoleInTeam(members, channel.teamId, currentUserId)
    : "member";

  const isLocked = channel?.isLocked ?? false;
  const isAnnouncement =
    channel?.type === "announcement" || channel?.postingPermission === "admins_only";

  const dmGone = !!dm && !channel && dm.kind !== "group" && !!getDMPartner(dm, currentUserId).unavailable;

  const canSend = dm
    ? !dmGone
    : !timedOut && canUserPerformInChannel(channel, currentUserId, userRole, "send_messages");

  const canAttach = dm
    ? true
    : canUserPerformInChannel(channel, currentUserId, userRole, "send_media");

  if (dropZone) dropZone.current = { canUpload: canSend && canAttach, upload: handleFileUpload };

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
    ? dmGone
      ? "This user no longer exists."
      : timedOut
      ? `You're timed out for ${formatUntil(timedOutUntil)} — you can read but not post.`
      : isLocked
      ? "This channel is locked — only admins and moderators can post."
      : isAnnouncement
        ? "Only admins and moderators can post in this announcement channel."
        : "You do not have permission to send messages in this channel."
    : placeholderText;

  return (
    <div
      className="shrink-0 border-t border-border/40 px-4 pb-3 pt-2"
    >
      {dmGone && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="status" data-testid="dm-unknown-user">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span className="font-medium">
            This user no longer exists. You can read the history, but you can&apos;t send messages or call them.
          </span>
        </div>
      )}

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
      {!dmGone && !timedOut && !isLocked && isAnnouncement && !canSend && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
          <Shield className="size-3.5 shrink-0" />
          <span className="font-medium">
            Only admins and moderators can post messages in this announcement channel.
          </span>
        </div>
      )}

      {/* ── Granular OpenFGA Denied Warning ── */}
      {!dmGone && !timedOut && !isLocked && !isAnnouncement && !canSend && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/60 border border-border/50 px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
          <span className="font-medium">
            You do not have permission to send messages in this channel.
          </span>
        </div>
      )}

      {/* Reply preview */}
      {replyingTo && (
        <ReplyQuote
          className="mb-2"
          reply={{
            messageId: replyingTo.id,
            authorId: replyingTo.authorId,
            authorName: replyingTo.authorName,
            content: replyingTo.content,
          }}
          onCancel={() => setReplyingTo(null)}
        />
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

      {/* Files queued / uploading / failed for this conversation (they keep going in the background) */}
      <UploadProgressList uploads={myUploads} onCancel={cancelUpload} onRetry={retrySend} />

      {/* Files attached to the draft, sent with Enter */}
      <StagedFiles files={composer.files} onRemove={composer.remove} />
      <DuplicateFileDialog
        file={composer.duplicate}
        onUseExisting={() => composer.resolveDuplicate("existing")}
        onUploadAgain={() => composer.resolveDuplicate("again")}
        onCancel={() => composer.resolveDuplicate("cancel")}
      />

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
                  setContent(content + emoji);
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
              disabled={!canSend || (!content.trim() && !composer.files.length)}
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
