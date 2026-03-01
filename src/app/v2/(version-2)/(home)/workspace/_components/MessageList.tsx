"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Hash,
  Pin,
  Users,
  Search,
  MessageSquare,
  Bell,
  Lock,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import MessageActions from "./MessageActions";
import RoleBadge from "./RoleBadge";
import ProfileCard from "./ProfileCard";
import TimeSeparator, { getDateLabel } from "./TimeSeparator";
import { renderContentWithMentions } from "./MentionHighlight";
import MobileWorkspaceSidebar from "./MobileWorkspaceSidebar";
import { PollCard } from "./PollCard";
import type { ChatMessage, TeamMember } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// MessageList — main chat area with role badges, profile cards, time separators
// ---------------------------------------------------------------------------

interface MessageListProps {
  channelId?: string;
  dmId?: string;
}

export default function MessageList({ channelId, dmId }: MessageListProps) {
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const currentUserId = currAccount?.email ?? "";

  const {
    channels,
    activeChannelId,
    activeDmId,
    directMessages,
    getChannelMessages,
    members,
    openThread,
    addReaction,
    removeReaction,
    setSidePanelView,
    getChannelPolls,
    fetchPolls,
  } = useChatStore();

  // Props from URL take priority, fallback to store
  const effectiveChannelId = channelId ?? activeChannelId;
  const effectiveDmId = dmId ?? activeDmId;

  const channel = effectiveChannelId
    ? channels.find((c) => c.id === effectiveChannelId)
    : null;

  const dm = effectiveDmId
    ? directMessages.find((d) => d.id === effectiveDmId)
    : null;

  const messages = effectiveChannelId
    ? getChannelMessages(effectiveChannelId)
    : [];

  const endRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated after React render
    requestAnimationFrame(() => {
      // Scroll the ScrollArea viewport (Radix puts it in [data-radix-scroll-area-viewport])
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        endRef.current?.scrollIntoView({ behavior: "instant" });
      }
    });
  }, [messages.length]);

  // Fetch polls for the active channel
  useEffect(() => {
    if (effectiveChannelId && currentUserId) {
      fetchPolls(effectiveChannelId, currentUserId);
    }
  }, [effectiveChannelId, currentUserId, fetchPolls]);

  const channelPolls = effectiveChannelId ? getChannelPolls(effectiveChannelId) : [];

  // Group messages by date
  const grouped = useMemo(() => groupByDate(messages), [messages]);

  // DM view
  if (dm && !channel) {
    const other = dm.participants.find((p) => p.userId !== currentUserId);
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
          <div className="flex items-center gap-2">
            <MobileWorkspaceSidebar />
            <UserIcon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              {other?.displayName ?? "Direct Message"}
            </h3>
          </div>
        </div>
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-0.5 py-4">
            <div className="mb-6 text-center">
              <Avatar className="mx-auto size-16">
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                  {(other?.displayName ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-2 text-lg font-bold">
                {other?.displayName ?? "Direct Message"}
              </h2>
              <p className="text-sm text-muted-foreground">
                This is the beginning of your conversation.
              </p>
            </div>
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
        <div className="absolute top-2 left-2 md:hidden">
          <MobileWorkspaceSidebar />
        </div>
        <div className="text-center">
          <MessageSquare className="mx-auto size-12 opacity-30" />
          <p className="mt-2 text-sm">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  const ChannelIcon =
    channel.type === "announcement"
      ? Bell
      : channel.visibility === "private"
        ? Lock
        : Hash;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Channel header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
        <div className="flex items-center gap-2">
          <MobileWorkspaceSidebar />
          <ChannelIcon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{channel.name}</h3>
          {channel.isLocked && (
            <span className="flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400">
              <Lock className="size-2.5" />
              Locked
            </span>
          )}
          {channel.description && (
            <span className="hidden text-xs text-muted-foreground md:inline">
              | {channel.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidePanelView("pinned")}
          >
            <Pin className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidePanelView("members")}
          >
            <Users className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidePanelView("search")}
          >
            <Search className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="space-y-0.5 py-4">
          {/* Channel welcome */}
          <div className="mb-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-accent">
              <ChannelIcon className="size-6 text-muted-foreground" />
            </div>
            <h2 className="mt-2 text-lg font-bold">
              Welcome to #{channel.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {channel.description ||
                `This is the start of the #${channel.name} channel.`}
            </p>
          </div>

          {/* Active polls */}
          {channelPolls.length > 0 && (
            <div className="mb-4 space-y-3">
              {channelPolls.filter(p => !p.isClosed).map((poll) => (
                <PollCard key={poll.id} poll={poll} email={currentUserId} />
              ))}
            </div>
          )}

          {grouped.map((group) => (
            <React.Fragment key={group.label}>
              <TimeSeparator label={group.label} />

              {group.messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                const isCompact = shouldCompact(msg, prevMsg);

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isCompact={isCompact}
                    members={members}
                    currentUserId={currentUserId}
                    onOpenThread={openThread}
                    onReact={addReaction}
                    onUnreact={removeReaction}
                  />
                );
              })}
            </React.Fragment>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single message bubble
// ---------------------------------------------------------------------------

function MessageBubble({
  message,
  isCompact,
  members,
  currentUserId,
  onOpenThread,
  onReact,
  onUnreact,
}: {
  message: ChatMessage;
  isCompact: boolean;
  members: TeamMember[];
  currentUserId: string;
  onOpenThread: (id: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onUnreact: (msgId: string, emoji: string) => void;
}) {
  const isMentioned = message.mentions.includes(currentUserId);
  const author = members.find((m) => m.userId === message.authorId);
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (message.isDeleted) {
    return (
      <div className="py-1 px-2 text-xs text-muted-foreground italic">
        This message has been deleted.
      </div>
    );
  }

  // Render message content with @mention highlighting & profile cards
  const renderedContent = renderContentWithMentions(
    message.content,
    members,
  );

  // GIF detection — standalone GIF URL
  const gifMatch = message.content.match(
    /^(https?:\/\/[^\s]+\.(?:gif|gifv)(?:\?[^\s]*)?)$/i,
  );

  return (
    <div
      className={cn(
        "group relative rounded-md px-2 transition-colors hover:bg-accent/30",
        isMentioned && "bg-yellow-500/10 border-l-2 border-yellow-500 dark:bg-yellow-500/15",
        message.priority === "urgent" && "bg-red-500/5 border-l-2 border-red-500",
        message.priority === "priority" && "bg-orange-500/5 border-l-2 border-orange-500",
        message.priority === "everyone" && "bg-blue-500/5 border-l-2 border-blue-500",
        isCompact ? "py-0.5" : "py-2 mt-1",
      )}
    >
      {/* Hover actions */}
      <MessageActions message={message} />

      {/* Reply reference */}
      {message.replyTo && (
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="ml-6 flex items-center gap-1 rounded bg-accent/50 px-2 py-0.5">
            <span className="size-3 rounded-full bg-muted" />
            <span className="font-medium text-foreground">
              {message.replyTo.authorName}
            </span>
            <span className="truncate max-w-xs">
              {message.replyTo.content}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar or timestamp gutter */}
        {isCompact ? (
          <div className="flex w-8 shrink-0 items-center justify-center">
            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
              {time}
            </span>
          </div>
        ) : author ? (
          <ProfileCard member={author}>
            <button className="mt-0.5 shrink-0">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {message.authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </ProfileCard>
        ) : (
          <Avatar className="mt-0.5 size-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {message.authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1">
          {/* Author + role badge + timestamp (non-compact) */}
          {!isCompact && (
            <div className="flex items-baseline gap-2">
              {author ? (
                <ProfileCard member={author}>
                  <button
                    className={cn(
                      "text-sm font-semibold hover:underline",
                      message.authorId === currentUserId
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {message.authorName}
                  </button>
                </ProfileCard>
              ) : (
                <span
                  className={cn(
                    "text-sm font-semibold",
                    message.authorId === currentUserId
                      ? "text-primary"
                      : "text-foreground",
                  )}
                >
                  {message.authorName}
                </span>
              )}
              {author && <RoleBadge role={author.role} />}
              <span className="text-[11px] text-muted-foreground">
                {time}
              </span>
              {message.priority && message.priority !== "normal" && (
                <PriorityBadge priority={message.priority} />
              )}
              {message.isPinned && (
                <Pin className="size-3 text-yellow-500" />
              )}
              {message.isEdited && (
                <span className="text-[10px] text-muted-foreground">
                  (edited)
                </span>
              )}
            </div>
          )}

          {/* Content */}
          {gifMatch ? (
            <div className="mt-1 max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gifMatch[1]}
                alt="GIF"
                className="rounded-lg"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-sm leading-relaxed break-words">
              {renderedContent}
            </div>
          )}

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 rounded-md border border-border/40 bg-accent/30 px-3 py-2 text-xs"
                >
                  <span className="truncate max-w-[200px]">{att.name}</span>
                  <span className="text-muted-foreground">
                    {formatFileSize(att.size)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {message.reactions.map((r) => {
                const isMine = r.userIds.includes(currentUserId);
                return (
                  <button
                    key={r.emoji}
                    onClick={() =>
                      isMine
                        ? onUnreact(message.id, r.emoji)
                        : onReact(message.id, r.emoji)
                    }
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                      isMine
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-accent/30 hover:border-primary/30",
                    )}
                  >
                    {r.emoji}
                    <span className="font-medium">{r.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Thread indicator */}
          {message.threadReplyCount > 0 && (
            <button
              onClick={() => onOpenThread(message.id)}
              className="mt-1 flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <MessageSquare className="size-3" />
              <span className="font-medium">
                {message.threadReplyCount}{" "}
                {message.threadReplyCount === 1 ? "reply" : "replies"}
              </span>
              {message.threadLastReplyAt && (
                <span className="text-muted-foreground">
                  Last reply{" "}
                  {formatRelativeTime(
                    new Date(message.threadLastReplyAt),
                  )}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shouldCompact(
  msg: ChatMessage,
  prev: ChatMessage | null,
): boolean {
  if (!prev) return false;
  if (prev.authorId !== msg.authorId) return false;
  const diff =
    new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return diff < 5 * 60 * 1000; // 5 min
}

function groupByDate(
  messages: ChatMessage[],
): { label: string; messages: ChatMessage[] }[] {
  const groups: Map<string, ChatMessage[]> = new Map();

  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const key = d.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }

  return Array.from(groups.entries()).map(([key, msgs]) => ({
    label: getDateLabel(new Date(key)),
    messages: msgs,
  }));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Priority badge — shows urgency level on messages
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }: { priority: string }) {
  if (!priority || priority === "normal") return null;

  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> =
    {
      everyone: {
        label: "@everyone",
        className:
          "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        icon: <Bell className="size-2.5" />,
      },
      urgent: {
        label: "Urgent",
        className:
          "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        icon: <AlertTriangle className="size-2.5" />,
      },
      priority: {
        label: "Priority",
        className:
          "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        icon: <AlertTriangle className="size-2.5" />,
      },
    };

  const c = config[priority];
  if (!c) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
        c.className,
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
