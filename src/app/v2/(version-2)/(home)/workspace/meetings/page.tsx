"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Video,
  Plus,
  Clock,
  Users,
  Copy,
  Check,
  Radio,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  CalendarDays,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "../_lib/chat-store";
import { meetingApi, generateMeetCode, formatMeetUrl } from "../_lib/api";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import LiveMeetingCard from "../_components/LiveMeetingCard";
import CalendarMeetingsList from "../_components/CalendarMeetingsList";
import type { Meeting } from "../_lib/chat-types";

export default function MeetingsPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Meetings & Calendar">
      <MeetingsHubContent />
    </WorkspaceErrorBoundary>
  );
}

function MeetingsHubContent() {
  const router = useRouter();
  const {
    meetings,
    addMeeting,
    startCall,
    channels,
    activeTeamId,
    teams,
    members,
    currentUserId,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "past">("today");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for scheduling
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("11:45");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("general");

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];
  const teamChannels = activeTeamId
    ? channels.filter((c) => c.teamId === activeTeamId)
    : channels;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const filteredMeetings = (meetings || []).filter((m) => {
    if (!m) return false;
    const mDate = m.startTime ? m.startTime.split("T")[0] : "";
    if (activeTab === "today") return mDate === todayStr || m.status === "live";
    if (activeTab === "upcoming") return mDate > todayStr && m.status !== "completed";
    if (activeTab === "past") return m.status === "completed" || mDate < todayStr;
    return true;
  });

  const handleJoinCall = (meet: Meeting) => {
    startCall(meet.id, meet.title);
    router.push(`/v2/workspace/calls/${meet.id}`);
  };

  const handleMeetNow = async () => {
    let callId = generateMeetCode();
    const newTitle = `${activeTeam?.name || "Team"} Instant Sync`;
    try {
      const res = await meetingApi.createRoom(newTitle, undefined, currentUserId || "alex@airsend.io");
      if (res.roomId) {
        callId = res.roomId;
      }
    } catch (e) {
      console.warn("[MeetingsHub] Meeting server offline, using generated code:", e);
    }

    startCall(callId, newTitle);
    addMeeting({
      title: newTitle,
      description: "Quick instant sync room",
      teamId: activeTeamId || "t-1",
      channelId: selectedChannelId || undefined,
      channelName: "general",
      organizerId: currentUserId || "u-self",
      organizerName: "You",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 30 * 60000).toISOString(),
      isOnline: true,
      meetingUrl: formatMeetUrl(callId),
      status: "live",
      attendees: [
        {
          id: currentUserId || "u-self",
          name: "You",
          email: currentUserId || "you@airsend.io",
          status: "accepted",
          isOrganizer: true,
        },
      ],
    });
    router.push(`/v2/workspace/calls/${callId}`);
  };

  const handleScheduleSubmit = async () => {
    if (!title.trim()) return;
    let callId = generateMeetCode();
    try {
      const res = await meetingApi.createRoom(title.trim(), undefined, currentUserId || "alex@airsend.io");
      if (res.roomId) {
        callId = res.roomId;
      }
    } catch (e) {
      console.warn("[MeetingsHub] Meeting server offline, using generated code:", e);
    }

    const startIso = `${meetingDate}T${startTime}:00Z`;
    const endIso = `${meetingDate}T${endTime}:00Z`;
    const chosenChannel = channels.find((c) => c.id === selectedChannelId);

    addMeeting({
      title: title.trim(),
      description: description.trim() || undefined,
      teamId: activeTeamId || "t-1",
      channelId: selectedChannelId !== "none" ? selectedChannelId : undefined,
      channelName: chosenChannel?.name,
      organizerId: currentUserId || "u-self",
      organizerName: "You",
      startTime: startIso,
      endTime: endIso,
      isOnline: true,
      meetingUrl: formatMeetUrl(callId),
      status: "scheduled",
      attendees: [
        {
          id: currentUserId || "u-self",
          name: "You",
          email: currentUserId || "you@airsend.io",
          status: "accepted",
          isOrganizer: true,
        },
        ...(members || []).slice(0, 3).map((m) => ({
          id: m.userId || m.id || "",
          name: m.displayName || m.username || m.email || "Member",
          email: m.email || "",
          status: "accepted" as const,
        })),
      ],
    });

    setTitle("");
    setDescription("");
    setScheduleDialogOpen(false);
  };

  const handleCopyLink = (meet: Meeting) => {
    const meetUrl = meet?.meetingUrl || "";
    const url = typeof window !== "undefined" ? `${window.location.origin}${meetUrl}` : meetUrl;
    navigator.clipboard?.writeText(url);
    setCopiedId(meet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CalendarIcon className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Meetings & Schedule
              <Badge variant="outline" className="text-[11px] font-normal border-border/60">
                {meetings.length} total
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Teams video conference scheduler and agenda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleMeetNow}
            className="gap-1.5 text-xs h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Video className="size-3.5" />
            <span className="hidden sm:inline">Meet Now</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setScheduleDialogOpen(true)}
            className="gap-1.5 text-xs h-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            <Plus className="size-3.5" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 md:px-6 py-2.5 bg-muted/20">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
          <TabsList className="h-8 p-0.5 bg-muted/60">
            <TabsTrigger value="today" className="text-xs h-7 px-3">
              Today
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs h-7 px-3">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs h-7 px-3">
              Past
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <span className="text-xs text-muted-foreground hidden sm:inline">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* ── Meetings Grid ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {activeTab !== "past" && <CalendarMeetingsList todayOnly={activeTab === "today"} />}
          {filteredMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <CalendarDays className="size-7 opacity-40" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">No meetings found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {activeTab === "today"
                  ? "You have no meetings scheduled for today. Start a quick meeting or schedule one."
                  : activeTab === "upcoming"
                    ? "No upcoming meetings found in the future."
                    : "No past meeting history found."}
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={handleMeetNow} className="gap-1.5 text-xs">
                  <Video className="size-3.5" />
                  Meet Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => setScheduleDialogOpen(true)} className="gap-1.5 text-xs">
                  <Plus className="size-3.5" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeetings.map((meet) => (
                <LiveMeetingCard key={meet.id} meeting={meet} onJoin={handleJoinCall} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule Meeting Dialog ── */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-emerald-500" />
              Schedule Teams Meeting
            </DialogTitle>
            <DialogDescription>
              Create a calendar invite for your workspace members with a dedicated video room link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-form-title">Meeting Title</Label>
              <Input
                id="meeting-form-title"
                placeholder="e.g. Sprint Planning & UI Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meeting-start">Start Time</Label>
                <Input
                  id="meeting-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meeting-end">End Time</Label>
                <Input
                  id="meeting-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meeting-channel">Post to Channel</Label>
              <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Direct meeting)</SelectItem>
                  {teamChannels.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      #{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meeting-desc">Agenda & Description (optional)</Label>
              <Textarea
                id="meeting-desc"
                placeholder="Key talking points or agenda topics..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              disabled={!title.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
