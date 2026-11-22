"use client";

import { usePhone } from "../phone/_lib/phone-context";
import ConversationCallBanner from "../phone/_components/ConversationCallBanner";
import GroupMembersDialog from "./GroupMembersDialog";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Video,
  Phone,
  FolderOpen,
  CheckSquare,
  Radio,
  Sparkles,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/store/hooks";
import { useChatStore } from "../_lib/chat-store";
import MessageActions from "./MessageActions";
import RoleBadge from "./RoleBadge";
import ProfileCard from "./ProfileCard";
import TimeSeparator, { getDateLabel } from "./TimeSeparator";
import { renderContentWithMentions } from "./MentionHighlight";
import MobileWorkspaceSidebar from "./MobileWorkspaceSidebar";
import ChannelMeetingBanner from "./meet/ChannelMeetingBanner";
import { useChannelMeetings } from "../_lib/meet/meeting-state";
import { PollCard } from "./PollCard";
import { AttachmentList } from "./FileCard";
import MessageStatus from "./MessageStatus";
import ReplyQuote from "./ReplyQuote";
import DeletedMessage from "./DeletedMessage";
import SelectableMessage from "./SelectableMessage";
import ConversationSelectionTools from "./SelectionBar";
import DMThread from "./DMThread";
import AnnouncementBanner from "./AnnouncementBanner";
import { MessageContextMenu, WorkspaceContextMenu } from "./MessageContextMenu";
import { getDMPartner } from "../_lib/permissions";
import UserPresenceBadge from "./UserPresenceBadge";
import { isBusyStatus, presenceLabel } from "../_lib/presence";
import { useChannelPermissions, settingsPath } from "../_lib/use-access";
import type { ChatMessage, TeamMember } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// MessageList — main chat area with role badges, profile cards, time separators
// ---------------------------------------------------------------------------

interface MessageListProps {
  channelId?: string;
  dmId?: string;
}

export default function MessageList({ channelId, dmId }: MessageListProps) {
  const router = useRouter();
  const currAccount = useAppSelector((s) => s.accounts.currAccount);
  const currentUserId = currAccount?.email ?? "";

  const activeChannelId = useChatStore((s) => s.activeChannelId);
  const activeDmId = useChatStore((s) => s.activeDmId);
  const activeTeamId = useChatStore((s) => s.activeTeamId);
  const members = useChatStore((s) => s.members);
  const openThread = useChatStore((s) => s.openThread);
  const addReaction = useChatStore((s) => s.addReaction);
  const removeReaction = useChatStore((s) => s.removeReaction);
  const setSidePanelView = useChatStore((s) => s.setSidePanelView);
  const getChannelPolls = useChatStore((s) => s.getChannelPolls);
  const fetchPolls = useChatStore((s) => s.fetchPolls);
  const fetchOlderMessages = useChatStore((s) => s.fetchOlderMessages);
  const isLoadingOlder = useChatStore((s) => s.isLoadingOlder);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const startCall = useChatStore((s) => s.startCall);
  const addCallRecord = useChatStore((s) => s.addCallRecord);
  const phone = usePhone();
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const handleStartConversationCall = (conversationId: string, title: string, type: "video" | "audio") => {
    void phone.start("", { conversationId, media: type, title });
  };

  const handleStartDMCall = (receiverId: string, receiverName: string, type: "video" | "audio") => {
    if (type === "audio" && phone.me && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(receiverId)) {
      addCallRecord({
        callerId: currentUserId || "u-self",
        callerName: "You",
        receiverId,
        receiverName,
        type,
        direction: "outgoing",
        duration: 0,
        teamId: activeTeamId || "t-1",
      });
      void phone.start(receiverId);
      return;
    }
    const callId = `call-${Date.now().toString(36)}`;
    startCall(callId, `${type === "video" ? "Video Call with" : "Call with"} ${receiverName}`);
    addCallRecord({
      callerId: currentUserId || "u-self",
      callerName: "You",
      receiverId,
      receiverName,
      type,
      direction: "outgoing",
      duration: 0,
      teamId: activeTeamId || "t-1",
    });
    router.push(`/v2/workspace/calls/${callId}`);
  };

  const handleStartChannelMeeting = (channelName: string, channelId?: string) => {
    const callId = `meet-${Date.now().toString(36)}`;
    const title = `#${channelName} Channel Meeting`;
    const { addMeeting, activeTeamId, members } = useChatStore.getState();
    // The organizer is the signed-in person, by their real name (not a hardcoded "You").
    const selfEmail = currentUserId || "";
    const selfName =
      members.find((m) => m.email?.toLowerCase() === selfEmail.toLowerCase())?.displayName ||
      (selfEmail ? selfEmail.split("@")[0] : "Organizer");
    startCall(callId, title, selfName);

    addMeeting({
      title,
      description: `Live video conference started in #${channelName}`,
      teamId: activeTeamId || "t-1",
      channelId: channelId,
      channelName: channelName,
      organizerId: currentUserId || "u-self",
      organizerName: selfName,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      isOnline: true,
      meetingUrl: `/v2/workspace/calls/${callId}`,
      status: "live",
      attendees: [
        {
          id: currentUserId || "u-self",
          name: selfName,
          email: currentUserId || "you@airsend.io",
          status: "accepted",
          isOrganizer: true,
        },
      ],
    });

    router.push(`/v2/workspace/calls/${callId}`);
  };

  // Props from URL take priority, fallback to store
  const effectiveChannelId = channelId ?? activeChannelId;
  const effectiveDmId = dmId ?? activeDmId;


  // Only a meeting that has really started is "live"; a scheduled one shows as "scheduled" once its time is near.
  const channelMeetings = useChannelMeetings();
  const channelMeeting = effectiveChannelId ? channelMeetings.get(effectiveChannelId) : undefined;

  const channel = useChatStore((s) =>
    effectiveChannelId ? s.channels.find((c: any) => c.id === effectiveChannelId) : null,
  );

  const chPerms = useChannelPermissions(channel);
  const canStartCalls = !channel?.isLocked && chPerms.can("start_calls");
  const canAddReactions = chPerms.can("add_reactions");
  const canOpenChannelSettings = !!channel && (chPerms.canManage || chPerms.canEditOverrides);
  const openChannelSettings = () => channel && router.push(settingsPath.channel(channel.teamId, channel.id));

  const dm = useChatStore((s) =>
    effectiveDmId ? s.directMessages.find((d: any) => d.id === effectiveDmId) : null,
  );

  // Get raw messages from store — use the existing getChannelMessages action
  // which is stable, and memoize ourselves with useMemo
  const allMessages = useChatStore((s) => s.messages);
  const messages = useMemo(() => {
    if (!effectiveChannelId) return [] as ChatMessage[];
    return allMessages
      .filter((m) => m.channelId === effectiveChannelId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [allMessages, effectiveChannelId]);

  const hasMore = useChatStore((s) =>
    effectiveChannelId ? s.messageHasMore[effectiveChannelId] ?? false : false,
  );

  const endRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // IntersectionObserver — load older messages when scrolling up
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !effectiveChannelId || !currentUserId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingOlder) {
          // Save scroll height before loading older messages
          const viewport = scrollAreaRef.current?.querySelector(
            "[data-radix-scroll-area-viewport]",
          ) as HTMLElement | null;
          prevScrollHeightRef.current = viewport?.scrollHeight ?? 0;

          fetchOlderMessages(effectiveChannelId, currentUserId);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [effectiveChannelId, currentUserId, hasMore, isLoadingOlder, fetchOlderMessages]);

  // Maintain scroll position after prepending older messages
  useEffect(() => {
    if (prevScrollHeightRef.current > 0) {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null;
      if (viewport) {
        const newHeight = viewport.scrollHeight;
        viewport.scrollTop += newHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0;
      }
    }
  }, [messages.length]);

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

  const scrollToBottom = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    } else {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const focusInput = useCallback(() => {
    const input = document.getElementById("workspace-message-input") as HTMLTextAreaElement | null;
    input?.focus();
    scrollToBottom();
  }, [scrollToBottom]);

  // Fetch polls for the active channel — only when channel changes
  const fetchPollsRef = useRef(fetchPolls);
  fetchPollsRef.current = fetchPolls;
  useEffect(() => {
    if (effectiveChannelId && currentUserId) {
      fetchPollsRef.current(effectiveChannelId, currentUserId);
    }
  }, [effectiveChannelId, currentUserId]);

  const channelPolls = effectiveChannelId ? getChannelPolls(effectiveChannelId) : [];

  // Group messages by date
  const grouped = useMemo(() => groupByDate(messages), [messages]);
  // The open DM's messages (for select / forward in the DM view).
  const dmList = useChatStore((s) => (effectiveDmId ? s.dmMessages[effectiveDmId] : undefined));

  // DM view
  if (dm && !channel) {
    const other = getDMPartner(dm, currentUserId);
    const isGroup = dm.kind === "group";
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
          <div className="flex items-center gap-2">
            <MobileWorkspaceSidebar />
            {isGroup ? <Users className="size-4 text-muted-foreground" /> : <UserIcon className="size-4 text-muted-foreground" />}
            <h3 className="text-sm font-semibold" data-testid="dm-title">
              {other?.displayName ?? "Direct Message"}
            </h3>
            {!isGroup && other && !other.unavailable && (
              <UserPresenceBadge status={other.status} showText className="ml-1" />
            )}
            {isGroup && (
              <button
                type="button"
                className="rounded px-1.5 text-xs text-muted-foreground hover:bg-muted"
                onClick={() => setGroupDialogOpen(true)}
                data-testid="group-open-members"
              >
                {dm.participants.length} people
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {other && !other.unavailable && (!isGroup || phone.me) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-purple-600 hover:bg-purple-500/10"
                  onClick={() =>
                    phone.me
                      ? handleStartConversationCall(dm.id, other.displayName, "audio")
                      : handleStartDMCall(other.userId, other.displayName, "audio")
                  }
                  title={!isGroup && isBusyStatus(other.status) ? `Audio call (${other.displayName} is ${presenceLabel(other.status).toLowerCase()})` : "Audio call"}
                >
                  <Phone className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-blue-600 hover:bg-blue-500/10"
                  onClick={() =>
                    phone.me
                      ? handleStartConversationCall(dm.id, other.displayName, "video")
                      : handleStartDMCall(other.userId, other.displayName, "video")
                  }
                  title={!isGroup && isBusyStatus(other.status) ? `Video call (${other.displayName} is ${presenceLabel(other.status).toLowerCase()})` : "Video call"}
                >
                  <Video className="size-3.5" />
                </Button>
              </>
            )}
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
        {isGroup && (
          <GroupMembersDialog
            group={dm}
            currentUserId={currentUserId}
            open={groupDialogOpen}
            onOpenChange={setGroupDialogOpen}
            onLeft={() => router.push("/v2/workspace")}
          />
        )}
        <ConversationCallBanner conversationId={dm.id} title={other?.displayName ?? "Call"} />
        <WorkspaceContextMenu dm={dm} onScrollToBottom={scrollToBottom} onFocusInput={focusInput}>
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            <div className="space-y-0.5 py-4 min-h-full">
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
              <DMThread dmId={dm.id} currentUserId={currentUserId} />
              <div ref={endRef} />
            </div>
          </ScrollArea>
        </WorkspaceContextMenu>
        <ConversationSelectionTools conversationId={dm.id} messages={dmList ?? []} />
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

  // Loading skeleton for messages
  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center border-b border-border/40 px-4 gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 px-4 py-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className={`h-4 ${i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-1/2" : "w-2/3"}`} />
                {i % 4 === 0 && <Skeleton className="h-4 w-1/3" />}
              </div>
            </div>
          ))}
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
          {canStartCalls && phone.me && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-purple-600 hover:bg-purple-500/10"
                onClick={() => handleStartConversationCall(channel.id, `#${channel.name}`, "audio")}
                title="Start an audio call in this channel"
                data-testid="channel-call-audio"
              >
                <Phone className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2 gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={() => handleStartConversationCall(channel.id, `#${channel.name}`, "video")}
                title="Start a video call in this channel"
                data-testid="channel-call-video"
              >
                <Video className="size-3" />
                <span className="hidden sm:inline">Meet</span>
              </Button>
            </>
          )}
          {canStartCalls && !phone.me && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2 gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              onClick={() => handleStartChannelMeeting(channel.name, channel.id)}
              title="Start channel meeting"
            >
              <Video className="size-3" />
              <span className="hidden sm:inline">Meet</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => router.push("/v2/workspace/tasks")}
            title="Channel Tasks"
          >
            <CheckSquare className="size-3.5 text-amber-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => router.push("/v2/workspace/files")}
            title="Channel Files"
          >
            <FolderOpen className="size-3.5 text-indigo-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidePanelView("pinned")}
            title="Pinned messages"
          >
            <Pin className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidePanelView("members")}
            title="Channel members"
          >
            <Users className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSidePanelView("search")}
            title="Search channel"
          >
            <Search className="size-3.5" />
          </Button>
          {canOpenChannelSettings && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={openChannelSettings}
              title="Channel settings"
              aria-label="Channel settings"
            >
              <Settings className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {phone.me && <ConversationCallBanner conversationId={channel.id} title={`#${channel.name}`} />}

      {/* Active channel meeting indicator */}
      {channelMeeting && <ChannelMeetingBanner meeting={channelMeeting.meeting} phase={channelMeeting.phase} />}

      {/* Announcement Channel Intro Banner */}
      {channel.type === "announcement" && (
        <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Bell className="size-4 animate-bounce" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-foreground">Announcement Channel</h4>
            <p className="text-[11px] text-muted-foreground">
              Official company & team announcements. Only workspace organizers and administrators can post broadcasts here.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <WorkspaceContextMenu
        channel={channel}
        onScrollToBottom={scrollToBottom}
        onFocusInput={focusInput}
        onOpenSettings={canOpenChannelSettings ? openChannelSettings : undefined}
      >
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-0.5 py-4 min-h-full">
            {/* Infinite scroll sentinel — triggers loading older messages */}
            <div ref={topSentinelRef} className="h-1" />
            {isLoadingOlder && (
              <div className="flex items-center justify-center py-3">
                <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2 text-xs text-muted-foreground">Loading older messages...</span>
              </div>
            )}

            {/* Channel welcome — only shown when no more older messages */}
            {!hasMore && (
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
            )}

            {/* Active polls */}
            {channelPolls.length > 0 && (
              <div className="mb-4 space-y-3">
                {channelPolls.filter((p:any) => !p.isClosed).map((poll:any) => (
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
                    <SelectableMessage key={msg.id} conversationId={channel.id} messageId={msg.id}>
                      <MessageBubble
                        message={msg}
                        isCompact={isCompact}
                        members={members}
                        currentUserId={currentUserId}
                        canAddReactions={canAddReactions}
                        onOpenThread={openThread}
                        onReact={addReaction}
                        onUnreact={removeReaction}
                      />
                    </SelectableMessage>
                  );
                })}
              </React.Fragment>
            ))}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </WorkspaceContextMenu>
      <ConversationSelectionTools conversationId={channel.id} messages={messages} />
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
  canAddReactions = true,
  onOpenThread,
  onReact,
  onUnreact,
}: {
  message: ChatMessage;
  isCompact: boolean;
  members: TeamMember[];
  currentUserId: string;
  canAddReactions?: boolean;
  onOpenThread: (id: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onUnreact: (msgId: string, emoji: string) => void;
}) {
  const isMentioned = message.mentions.includes(currentUserId);
  const author = members.find((m:any) => m.userId === message.authorId);
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (message.isDeleted) {
    return (
      <div id={`msg-${message.id}`} className="px-2 py-1">
        <DeletedMessage message={message} className="text-xs" />
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
    <MessageContextMenu message={message}>
      <div
        id={`msg-${message.id}`}
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
        {/* My messages: sending / sent / seen / failed */}
        <MessageStatus
          message={message}
          conversationId={message.channelId}
          me={currentUserId}
          className="absolute bottom-1 right-2"
        />

      {/* Inline reply: the quoted message */}
      {message.replyTo && <ReplyQuote reply={message.replyTo} className="mb-1 ml-11 max-w-md" />}

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
                  {(message.authorName || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </ProfileCard>
        ) : (
          <Avatar className="mt-0.5 size-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {(message.authorName || "?").charAt(0).toUpperCase()}
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
          {message.type === "announcement" || message.priority === "urgent" ? (
            <AnnouncementBanner
              title="Channel Announcement"
              authorName={message.authorName}
              content={message.content}
              timestamp={time}
              priority={message.priority === "urgent" ? "urgent" : "announcement"}
              isPinned={message.isPinned}
            />
          ) : gifMatch ? (
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

          {/* Attachments (bytes live in the files service; the card downloads by file id) */}
          <AttachmentList attachments={message.attachments} />

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {message.reactions.map((r) => {
                const isMine = r.userIds.includes(currentUserId);
                return (
                  <button
                    key={r.emoji}
                    onClick={() => {
                      if (isMine) {
                        onUnreact(message.id, r.emoji);
                      } else if (canAddReactions) {
                        onReact(message.id, r.emoji);
                      }
                    }}
                    disabled={!isMine && !canAddReactions}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                      isMine
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : canAddReactions
                          ? "border-border/60 bg-accent/30 hover:border-primary/30"
                          : "border-border/30 bg-accent/10 opacity-70 cursor-not-allowed",
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
    </MessageContextMenu>
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
