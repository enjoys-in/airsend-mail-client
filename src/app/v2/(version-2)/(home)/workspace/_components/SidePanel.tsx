"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Bell,
  MessageSquare,
  AtSign,
  Heart,
  Pin,
  Users,
  Search,
  CheckSquare,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useChatStore } from "../_lib/chat-store";
import type {
  SidePanelView,
  ChatNotification,
  ChatTask,
  TeamMember,
  ChatMessage,
} from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// SidePanel — right-side panel for activity, tasks, members, pinned, search
// ---------------------------------------------------------------------------

export default function SidePanel() {
  const { sidePanelView, setSidePanelView } = useChatStore();

  if (!sidePanelView || sidePanelView === "thread") return null;

  const title = {
    activity: "Activity",
    tasks: "Tasks",
    members: "Members",
    pinned: "Pinned Messages",
    search: "Search",
    profile: "Profile",
  }[sidePanelView];

  return (
    <div className="flex h-full w-80 flex-col border-l border-border/40 bg-background">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setSidePanelView(null)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {sidePanelView === "activity" && <ActivityContent />}
        {sidePanelView === "tasks" && <TasksContent />}
        {sidePanelView === "members" && <MembersContent />}
        {sidePanelView === "pinned" && <PinnedContent />}
        {sidePanelView === "search" && <SearchContent />}
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity panel
// ---------------------------------------------------------------------------

function ActivityContent() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useChatStore();

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="p-3 space-y-1">
      {unread.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {unread.length} unread
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={markAllNotificationsRead}
          >
            Mark all read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="size-8" />} text="No notifications yet" />
      ) : (
        notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onRead={() => markNotificationRead(notif.id)}
          />
        ))
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: ChatNotification;
  onRead: () => void;
}) {
  const Icon =
    notification.type === "mention"
      ? AtSign
      : notification.type === "reply"
        ? MessageSquare
        : notification.type === "reaction"
          ? Heart
          : notification.type === "dm"
            ? MessageSquare
            : Bell;

  const time = new Date(notification.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={onRead}
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent/50",
        !notification.isRead && "bg-accent/30",
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium">
            {notification.fromUserName}
          </span>
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground">{notification.content}</p>
      </div>
      {!notification.isRead && (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tasks panel
// ---------------------------------------------------------------------------

function TasksContent() {
  const { tasks } = useChatStore();

  const grouped = {
    urgent: tasks.filter((t) => t.priority === "urgent" && t.status !== "done"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    todo: tasks.filter((t) => t.status === "todo" && t.priority !== "urgent"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="p-3 space-y-4">
      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="size-8" />}
          text="No tasks assigned"
        />
      ) : (
        Object.entries(grouped).map(
          ([group, items]) =>
            items.length > 0 && (
              <div key={group}>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.replace("-", " ")} ({items.length})
                </span>
                <div className="mt-1 space-y-1">
                  {items.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ),
        )
      )}
    </div>
  );
}

function TaskItem({ task }: { task: ChatTask }) {
  const priorityColors = {
    low: "text-gray-400",
    medium: "text-blue-400",
    high: "text-orange-400",
    urgent: "text-red-500",
  };

  const statusIcons = {
    todo: <Circle className="size-3.5" />,
    "in-progress": <Clock className="size-3.5 text-blue-400" />,
    done: <CheckSquare className="size-3.5 text-emerald-500" />,
  };

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-border/40 px-3 py-2 hover:bg-accent/30 transition-colors">
      <span className="mt-0.5">{statusIcons[task.status]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{task.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-medium uppercase",
              priorityColors[task.priority],
            )}
          >
            {task.priority}
          </span>
          {dueDate && (
            <span className="text-[10px] text-muted-foreground">
              Due {dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Members panel
// ---------------------------------------------------------------------------

function MembersContent() {
  const { members, activeTeamId, getTeamMembers } = useChatStore();

  const teamMembers = activeTeamId ? getTeamMembers(activeTeamId) : [];

  const online = teamMembers.filter((m) => m.status === "online");
  const away = teamMembers.filter(
    (m) => m.status === "idle" || m.status === "dnd",
  );
  const offline = teamMembers.filter((m) => m.status === "offline");

  return (
    <div className="p-3 space-y-4">
      <MemberGroup title={`Online — ${online.length}`} members={online} />
      {away.length > 0 && (
        <MemberGroup title={`Away — ${away.length}`} members={away} />
      )}
      {offline.length > 0 && (
        <MemberGroup title={`Offline — ${offline.length}`} members={offline} />
      )}
    </div>
  );
}

function MemberGroup({
  title,
  members,
}: {
  title: string;
  members: TeamMember[];
}) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      <div className="mt-1 space-y-0.5">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors"
          >
            <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {member.displayName.charAt(0)}
              <span
                className={cn(
                  "absolute -bottom-0 -right-0 size-2.5 rounded-full border-2 border-background",
                  member.status === "online" && "bg-emerald-500",
                  member.status === "idle" && "bg-yellow-500",
                  member.status === "dnd" && "bg-red-500",
                  member.status === "offline" && "bg-gray-400",
                )}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">
                  {member.displayName}
                </span>
                {member.role !== "member" && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 h-4"
                  >
                    {member.role}
                  </Badge>
                )}
              </div>
              {member.customStatus && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {member.customStatus}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pinned messages panel
// ---------------------------------------------------------------------------

function PinnedContent() {
  const { messages, activeChannelId } = useChatStore();

  const pinned = messages.filter(
    (m) => m.channelId === activeChannelId && m.isPinned,
  );

  return (
    <div className="p-3 space-y-2">
      {pinned.length === 0 ? (
        <EmptyState
          icon={<Pin className="size-8" />}
          text="No pinned messages"
        />
      ) : (
        pinned.map((msg) => (
          <div
            key={msg.id}
            className="rounded-md border border-border/40 p-3 space-y-1"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold">
                {msg.authorName}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(msg.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{msg.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search panel
// ---------------------------------------------------------------------------

function SearchContent() {
  const { messages, searchQuery, setSearchQuery } = useChatStore();

  const results = searchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="p-3 space-y-3">
      <Input
        placeholder="Search messages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-8 text-sm"
        autoFocus
      />
      {searchQuery.trim() && (
        <span className="text-xs text-muted-foreground">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
      )}
      {results.map((msg) => (
        <div
          key={msg.id}
          className="rounded-md border border-border/40 p-3 space-y-1 hover:bg-accent/30 transition-colors cursor-pointer"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{msg.authorName}</span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state helper
// ---------------------------------------------------------------------------

function EmptyState({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <span className="opacity-30">{icon}</span>
      <p className="mt-2 text-sm">{text}</p>
    </div>
  );
}
