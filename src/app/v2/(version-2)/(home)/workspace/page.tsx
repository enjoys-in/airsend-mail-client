"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Calendar,
  CheckSquare,
  FolderOpen,
  Bell,
  MessageSquare,
  Users,
  Hash,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  Radio,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "./_lib/chat-store";
import { WorkspaceHomeSkeleton } from "./_components/WorkspaceSkeletons";
import WorkspaceErrorBoundary from "./_components/WorkspaceErrorBoundary";
import LiveMeetingCard from "./_components/LiveMeetingCard";

export default function WorkspacePage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Workspace Overview">
      <Suspense fallback={<WorkspaceHomeSkeleton />}>
        <WorkspaceDashboardContent />
      </Suspense>
    </WorkspaceErrorBoundary>
  );
}

function WorkspaceDashboardContent() {
  const router = useRouter();
  const {
    teams,
    activeTeamId,
    channels,
    members,
    meetings,
    tasks,
    files,
    notifications,
    startCall,
    updateTaskStatus,
    myStatus,
  } = useChatStore();

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];
  const teamChannels = activeTeamId
    ? channels.filter((c) => c.teamId === activeTeamId)
    : channels;
  const liveMeetings = meetings.filter((m) => m.status === "live");
  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled").slice(0, 3);
  const pendingTasks = tasks.filter((t) => t.status !== "done").slice(0, 4);
  const recentFiles = files.slice(0, 4);
  const unreadActivity = notifications.filter((n) => !n.isRead).slice(0, 4);
  const defaultChannel =
    teamChannels.find((c) => c.isDefault) || teamChannels[0];

  const handleJoinCall = (callId: string, title?: string) => {
    startCall(callId, title);
    router.push(`/v2/workspace/calls/${callId}`);
  };

  const handleInstantMeeting = () => {
    const callId = `meet-${Date.now().toString(36)}`;
    startCall(callId, `${activeTeam?.name || "Workspace"} Standup`);
    router.push(`/v2/workspace/calls/${callId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-0 bg-background/50 p-4 md:p-6 space-y-6">
      {/* ── Welcome Hero Banner ── */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-5 md:p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                {activeTeam?.name?.charAt(0) || "W"}
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {activeTeam?.name || "Workspace"} Hub
              </h1>
              <Badge variant="outline" className="text-xs capitalize gap-1 border-primary/30 text-primary">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Teams + Slack Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Collaborate seamlessly across channels, direct chats, live video meetings, task planning, and team documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleInstantMeeting}
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
            >
              <Video className="size-4" />
              Meet Now
            </Button>
            {defaultChannel && (
              <Link href={`/v2/workspace/c/${defaultChannel.id}`}>
                <Button variant="outline" className="gap-1.5 shadow-sm">
                  <MessageSquare className="size-4" />
                  Jump to #{defaultChannel.name}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* ── Live Calls / Meetings Alert (if any) ── */}
      {liveMeetings.length > 0 && (
        <div className="rounded-xl shrink-0 border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm animate-pulse">
                <Radio className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-emerald-950 dark:text-emerald-100">
                    Live Meeting in Progress: {liveMeetings[0].title}
                  </h4>
                  <Badge className="bg-emerald-600 text-[10px] text-white">Live Now</Badge>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Organized by {liveMeetings[0].organizerName} • {liveMeetings[0].attendees.length} participants joined
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleJoinCall(liveMeetings[0].id, liveMeetings[0].title)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shrink-0 shadow-sm"
            >
              <Video className="size-3.5" />
              Join Live Meeting
            </Button>
          </div>
        </div>
      )}

      {/* ── Quick Navigation Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: "Channels", count: teamChannels.length, href: defaultChannel ? `/v2/workspace/c/${defaultChannel.id}` : "/v2/workspace", icon: Hash, color: "text-blue-500 bg-blue-500/10" },
          { title: "Meetings", count: meetings.length, href: "/v2/workspace/meetings", icon: Calendar, color: "text-emerald-500 bg-emerald-500/10" },
          { title: "Calls", count: "HD Voice", href: "/v2/workspace/calls", icon: Video, color: "text-purple-500 bg-purple-500/10" },
          { title: "Tasks", count: `${pendingTasks.length} open`, href: "/v2/workspace/tasks", icon: CheckSquare, color: "text-amber-500 bg-amber-500/10" },
          { title: "Files", count: `${files.length} items`, href: "/v2/workspace/files", icon: FolderOpen, color: "text-indigo-500 bg-indigo-500/10" },
          { title: "Activity", count: `${unreadActivity.length} unread`, href: "/v2/workspace/activity", icon: Bell, color: "text-rose-500 bg-rose-500/10" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/40 bg-card hover:bg-accent/40 transition-all duration-150 text-center shadow-sm hover:shadow"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl mb-2 ${item.color} group-hover:scale-110 transition-transform`}>
                <Icon className="size-5" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {item.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Upcoming Meetings & Agenda */}
        <Card className="border-border/40 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-emerald-500" />
                Upcoming Meetings
              </CardTitle>
              <CardDescription className="text-xs">Scheduled Teams conferences</CardDescription>
            </div>
            <Link href="/v2/workspace/meetings">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                View all <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
            {upcomingMeetings.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No upcoming meetings scheduled for today.
              </div>
            ) : (
              upcomingMeetings.map((meet) => (
                <LiveMeetingCard
                  key={meet.id}
                  meeting={meet}
                  compact={true}
                  onJoin={() => handleJoinCall(meet.id, meet.title)}
                />
              ))
            )}
            <Link href="/v2/workspace/meetings" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-dashed">
                <Plus className="size-3.5" />
                Schedule New Meeting
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 2. My Tasks / Planner */}
        <Card className="border-border/40 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="size-4 text-amber-500" />
                Tasks & Planner
              </CardTitle>
              <CardDescription className="text-xs">Your assigned action items</CardDescription>
            </div>
            <Link href="/v2/workspace/tasks">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                Board <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                All caught up! No pending tasks assigned.
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <button
                    onClick={() => updateTaskStatus(t.id, "done")}
                    className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition-colors"
                    title="Mark as done"
                  >
                    <CheckCircle2 className="size-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        t.priority === "urgent" ? "bg-red-500/10 text-red-500" :
                        t.priority === "high" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {t.priority}
                      </span>
                      {t.dueDate && (
                        <span className="text-[10px] text-muted-foreground">
                          Due {new Date(t.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link href="/v2/workspace/tasks" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs h-8 gap-1.5 border-dashed">
                <Plus className="size-3.5" />
                Add New Task
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. Recent Activity & Mentions */}
        <Card className="border-border/40 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="size-4 text-rose-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">Mentions, replies and alerts</CardDescription>
            </div>
            <Link href="/v2/workspace/activity">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                All <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1">
            {unreadActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No unread activity. You are all up to date!
              </div>
            ) : (
              unreadActivity.map((notif) => (
                <Link
                  key={notif.id}
                  href="/v2/workspace/activity"
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/30 transition-colors"
                >
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {notif.fromUserName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">
                      <span className="font-semibold">{notif.fromUserName}</span> {notif.content}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </Link>
              ))
            )}
            <Link href="/v2/workspace/activity" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs h-8">
                Open Activity Feed
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── Team Documents & Channel Shortcuts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderOpen className="size-4 text-indigo-500" />
                Team Documents & Files
              </CardTitle>
              <CardDescription className="text-xs">Shared via channels & meetings</CardDescription>
            </div>
            <Link href="/v2/workspace/files">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                Browse all <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(f.size / 1024 / 1024).toFixed(1)} MB • Uploaded by {f.uploaderName}
                    </p>
                  </div>
                </div>
                <Link href="/v2/workspace/files">
                  <Button variant="ghost" size="icon" className="size-7">
                    <ExternalLink className="size-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Channels Quick Access */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Hash className="size-4 text-blue-500" />
                Active Team Channels
              </CardTitle>
              <CardDescription className="text-xs">Quick jump to conversations</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teamChannels.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/v2/workspace/c/${c.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/40 hover:border-primary/40 transition-all duration-150"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold truncate">{c.name}</span>
                  </div>
                  {c.unreadCount > 0 && (
                    <Badge className="bg-primary text-[10px] h-4 min-w-4 px-1 rounded-full">
                      {c.unreadCount}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
