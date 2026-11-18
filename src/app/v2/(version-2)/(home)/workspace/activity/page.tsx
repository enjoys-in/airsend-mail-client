"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  AtSign,
  MessageSquare,
  Heart,
  CheckCheck,
  Search,
  Filter,
  User,
  Radio,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "../_lib/chat-store";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import type { ChatNotification, NotificationType } from "../_lib/chat-types";

export default function ActivityPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Activity Feed">
      <ActivityFeedContent />
    </WorkspaceErrorBoundary>
  );
}

function ActivityFeedContent() {
  const router = useRouter();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    channels,
    directMessages,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "mentions" | "replies">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (activeTab === "unread" && n.isRead) return false;
        if (activeTab === "mentions" && n.type !== "mention") return false;
        if (activeTab === "replies" && n.type !== "reply") return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            n.fromUserName.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, activeTab, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (n: ChatNotification) => {
    markNotificationRead(n.id);
    if (n.channelId) {
      router.push(`/v2/workspace/c/${n.channelId}`);
    } else if (n.type === "dm") {
      const dm = directMessages.find((d) => d.id === n.messageId) || directMessages[0];
      if (dm) router.push(`/v2/workspace/dm/${dm.id}`);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "mention":
        return <AtSign className="size-3.5 text-blue-500" />;
      case "reply":
        return <MessageSquare className="size-3.5 text-emerald-500" />;
      case "reaction":
        return <Heart className="size-3.5 text-rose-500" />;
      case "dm":
        return <User className="size-3.5 text-purple-500" />;
      default:
        return <Bell className="size-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Activity Feed
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white hover:bg-red-600 text-[11px] h-5 px-1.5 rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Mentions, replies, calls, and workspace notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsRead}
              className="gap-1.5 text-xs h-8"
            >
              <CheckCheck className="size-3.5 text-muted-foreground" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/40 px-4 md:px-6 py-3 bg-muted/20">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
          <TabsList className="h-8 p-0.5 bg-muted/60">
            <TabsTrigger value="all" className="text-xs h-7 px-3">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs h-7 px-3">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs h-7 px-3">
              @Mentions
            </TabsTrigger>
            <TabsTrigger value="replies" className="text-xs h-7 px-3">
              Replies
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <Bell className="size-7 opacity-40" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">No notifications found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {searchQuery
                  ? "No activity matches your search query. Try searching for something else."
                  : activeTab === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "When teammates mention you, reply to threads, or start meetings, alerts appear here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const targetChannel = n.channelId ? channels.find((c) => c.id === n.channelId) : null;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                    !n.isRead
                      ? "border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-2xs"
                      : "border-border/40 bg-card hover:bg-accent/40"
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!n.isRead && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
                  )}

                  {/* Sender Avatar */}
                  <div className="relative shrink-0 ml-1">
                    <Avatar className="size-10 shadow-xs">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {n.fromUserName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background border border-border/40 shadow-xs">
                      {getTypeIcon(n.type)}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {n.fromUserName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {n.content}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {targetChannel && (
                        <span className="font-medium text-foreground bg-accent/60 px-1.5 py-0.5 rounded">
                          #{targetChannel.name}
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Hover Jump Action */}
                  <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-8 text-primary">
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
