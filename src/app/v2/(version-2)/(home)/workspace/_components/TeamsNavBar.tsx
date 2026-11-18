"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  Phone,
  Video,
  CheckSquare,
  FolderOpen,
  MessageSquare,
  Home,
  Plus,
  Search,
  Sparkles,
  Radio,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatStore } from "../_lib/chat-store";
import { generateMeetCode, formatMeetUrl } from "../_lib/api";
import MobileWorkspaceSidebar from "./MobileWorkspaceSidebar";

export default function TeamsNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeChannelId,
    channels,
    activeTeamId,
    teams,
    getUnreadNotificationCount,
    getPendingTaskCount,
    activeCallId,
    activeCallTitle,
    startCall,
    addMeeting,
    addTask,
    currentUserId,
  } = useChatStore();

  const [instantMeetingOpen, setInstantMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  const unreadCount = getUnreadNotificationCount();
  const pendingTaskCount = getPendingTaskCount();
  const activeTeam = teams.find((t) => t.id === activeTeamId);

  // Fallback default channel for Chat link
  const defaultChannel =
    channels.find((c) => c.teamId === activeTeamId && c.isDefault) ||
    channels.find((c) => c.teamId === activeTeamId) ||
    channels[0];
  const chatHref = activeChannelId
    ? `/v2/workspace/c/${activeChannelId}`
    : defaultChannel
      ? `/v2/workspace/c/${defaultChannel.id}`
      : "/v2/workspace";

  const navItems = [
    {
      title: "Home",
      href: "/v2/workspace",
      icon: Home,
      isActive: pathname === "/v2/workspace",
    },
    {
      title: "Chat & Channels",
      href: chatHref,
      icon: MessageSquare,
      isActive:
        pathname.startsWith("/v2/workspace/c/") ||
        pathname.startsWith("/v2/workspace/dm/"),
    },
    {
      title: "Activity",
      href: "/v2/workspace/activity",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: "bg-red-500",
      isActive: pathname === "/v2/workspace/activity",
    },
    {
      title: "Meetings",
      href: "/v2/workspace/meetings",
      icon: Calendar,
      isActive: pathname === "/v2/workspace/meetings",
    },
    {
      title: "Calls",
      href: "/v2/workspace/calls",
      icon: Phone,
      isActive:
        pathname.startsWith("/v2/workspace/calls") &&
        !pathname.includes("/calls/meet-"),
    },
    {
      title: "Tasks",
      href: "/v2/workspace/tasks",
      icon: CheckSquare,
      badge: pendingTaskCount > 0 ? pendingTaskCount : undefined,
      badgeColor: "bg-amber-500",
      isActive: pathname === "/v2/workspace/tasks",
    },
    {
      title: "Files",
      href: "/v2/workspace/files",
      icon: FolderOpen,
      isActive: pathname === "/v2/workspace/files",
    },
    {
      title: "Workflows",
      href: "/v2/workspace/workflows",
      icon: Workflow,
      isActive: pathname.startsWith("/v2/workspace/workflows"),
    },
  ];

  const handleStartInstantMeeting = () => {
    const meetCode = generateMeetCode();
    const title = meetingTitle.trim() || `${activeTeam?.name || "Workspace"} Quick Sync`;
    startCall(meetCode, title);
    addMeeting({
      title,
      description: "Instant meeting started via Teams Bar",
      teamId: activeTeamId || "t-1",
      channelId: activeChannelId || undefined,
      channelName: "general",
      organizerId: currentUserId || "u-self",
      organizerName: "You",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 30 * 60000).toISOString(),
      isOnline: true,
      meetingUrl: formatMeetUrl(meetCode),
      status: "live",
      attendees: [
        {
          id: currentUserId || "u-self",
          name: "You",
          email: "you@airsend.io",
          status: "accepted",
          isOrganizer: true,
        },
      ],
    });
    setInstantMeetingOpen(false);
    setMeetingTitle("");
    router.push(`/v2/workspace/calls/${meetCode}`);
  };

  const handleCreateQuickTask = () => {
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      description: "Quick task added from workspace header",
      assigneeId: currentUserId || "u-self",
      teamId: activeTeamId || "t-1",
      channelId: activeChannelId || undefined,
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
    setQuickTaskTitle("");
    setQuickTaskOpen(false);
  };

  return (
    <>
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Left: Mobile Sidebar Trigger + Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <div className="mr-1 md:hidden">
            <MobileWorkspaceSidebar />
          </div>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap",
                    item.isActive
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline">{item.title}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white",
                        item.badgeColor || "bg-primary",
                      )}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Active Call Banner + Quick Actions */}
        <div className="flex items-center gap-2 pl-2 shrink-0">
          {/* Active Call Floating Pill */}
          {activeCallId && !pathname.includes(`/calls/${activeCallId}`) && (
            <Link
              href={`/v2/workspace/calls/${activeCallId}`}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors animate-pulse"
            >
              <Radio className="size-3 text-emerald-500" />
              <span className="hidden md:inline">Return to Call</span>
              <span className="md:hidden">Call</span>
            </Link>
          )}

          {/* Instant "Meet Now" Button */}
          <Button
            size="sm"
            variant="default"
            onClick={() => setInstantMeetingOpen(true)}
            className="h-8 gap-1.5 text-xs px-2.5 sm:px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs"
          >
            <Video className="size-3.5" />
            <span className="hidden sm:inline">Meet Now</span>
          </Button>

          {/* New Item Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-8">
                <Plus className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setInstantMeetingOpen(true)}>
                <Video className="mr-2 size-4 text-blue-500" />
                Start Instant Meeting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/v2/workspace/meetings")}>
                <Calendar className="mr-2 size-4 text-emerald-500" />
                Schedule Meeting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuickTaskOpen(true)}>
                <CheckSquare className="mr-2 size-4 text-amber-500" />
                Create Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/v2/workspace/files")}>
                <FolderOpen className="mr-2 size-4 text-indigo-500" />
                Upload File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Instant Meeting Dialog */}
      <Dialog open={instantMeetingOpen} onOpenChange={setInstantMeetingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="size-5 text-primary" />
              Start Instant Meeting
            </DialogTitle>
            <DialogDescription>
              Launch an instant Teams video conference room. You can invite your team or copy the shareable link once inside.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input
                id="meeting-title"
                placeholder={`${activeTeam?.name || "Workspace"} Quick Sync`}
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartInstantMeeting()}
              />
            </div>
            <div className="rounded-lg border border-border/40 bg-accent/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500 shrink-0" />
              Includes HD video, audio mute controls, screen sharing, live chat and participant management.
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setInstantMeetingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartInstantMeeting} className="gap-1.5">
              <Video className="size-4" />
              Join Room Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Task Dialog */}
      <Dialog open={quickTaskOpen} onOpenChange={setQuickTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              Quick Add Task
            </DialogTitle>
            <DialogDescription>
              Create a task in your workspace planner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="quick-task-title">Task Title</Label>
              <Input
                id="quick-task-title"
                placeholder="e.g. Prepare meeting presentation slides"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateQuickTask()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setQuickTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuickTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
