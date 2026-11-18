"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Video,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  User,
  Plus,
  Search,
  Users,
  Mic,
  Sparkles,
  Link2,
  Calendar,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "../_lib/chat-store";
import { generateMeetCode, formatMeetUrl, parseMeetInput } from "../_lib/api";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import type { CallRecord } from "../_lib/chat-types";

export default function CallsPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Calls Hub">
      <CallsHubContent />
    </WorkspaceErrorBoundary>
  );
}

function CallsHubContent() {
  const router = useRouter();
  const {
    callRecords,
    addCallRecord,
    startCall,
    members,
    currentUserId,
    activeTeamId,
  } = useChatStore();

  const [filterTab, setFilterTab] = useState<"all" | "missed" | "incoming" | "outgoing">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialerOpen, setDialerOpen] = useState(false);

  // Google Meet Hero States
  const [meetCodeInput, setMeetCodeInput] = useState("");
  const [createdLaterLink, setCreatedLaterLink] = useState<string | null>(null);
  const [copiedLater, setCopiedLater] = useState(false);

  const filteredRecords = callRecords.filter((rec) => {
    if (filterTab === "missed" && rec.direction !== "missed") return false;
    if (filterTab === "incoming" && rec.direction !== "incoming") return false;
    if (filterTab === "outgoing" && rec.direction !== "outgoing") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.callerName.toLowerCase().includes(q) ||
        rec.receiverName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartCall = (memberId: string, memberName: string, type: "video" | "audio") => {
    const meetCode = generateMeetCode();
    startCall(meetCode, `${type === "video" ? "Video Call with" : "Call with"} ${memberName}`);

    // Add to call records
    addCallRecord({
      callerId: currentUserId || "u-self",
      callerName: "You",
      receiverId: memberId,
      receiverName: memberName,
      type,
      direction: "outgoing",
      duration: 0,
      teamId: activeTeamId || "t-1",
    });

    setDialerOpen(false);
    router.push(`/v2/workspace/calls/${meetCode}`);
  };

  const handleInstantMeeting = () => {
    const meetCode = generateMeetCode();
    startCall(meetCode, "Instant Meeting");
    router.push(`/v2/workspace/calls/${meetCode}`);
  };

  const handleCreateMeetingForLater = () => {
    const meetCode = generateMeetCode();
    const url = formatMeetUrl(meetCode);
    setCreatedLaterLink(url);
    setCopiedLater(false);
  };

  const handleJoinByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = parseMeetInput(meetCodeInput);
    if (!code) return;
    router.push(`/v2/workspace/calls/${code}`);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getDirectionIcon = (direction: CallRecord["direction"]) => {
    switch (direction) {
      case "incoming":
        return <PhoneIncoming className="size-3.5 text-emerald-500" />;
      case "outgoing":
        return <PhoneOutgoing className="size-3.5 text-blue-500" />;
      case "missed":
        return <PhoneMissed className="size-3.5 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Video className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Calls & Meetings
              <Badge variant="outline" className="text-[11px] font-normal border-border/60">
                meet.airsend.in
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Google Meet & Teams video calling, speed dial & meeting history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setDialerOpen(true)}
            className="gap-1.5 text-xs h-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <PhoneCall className="size-3.5" />
            Speed Dial
          </Button>
        </div>
      </div>

      {/* ── Main Calls Body ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* ── Google Meet Hero Card ── */}
        <div className="max-w-6xl mx-auto rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-900/15 via-indigo-900/10 to-transparent p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600/15 text-blue-500 border-blue-500/30 text-xs gap-1 font-semibold">
                  <Globe className="size-3" />
                  meet.airsend.in
                </Badge>
                <span className="text-xs text-muted-foreground">• Real-time WebRTC</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Premium video meetings. Free and integrated into your workspace.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Start instant meetings, create secure meeting links, or join with a 10-character code (`xxx-yyyy-zzz`).
              </p>

              {/* Action Group */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* New Meeting Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm gap-2 shadow-md shadow-blue-600/20">
                      <Video className="size-4" />
                      New meeting
                      <ChevronDown className="size-3.5 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-1.5">
                    <DropdownMenuItem
                      onClick={handleCreateMeetingForLater}
                      className="gap-2.5 py-2.5 cursor-pointer text-xs"
                    >
                      <Link2 className="size-4 text-blue-500" />
                      <div>
                        <span className="font-semibold block">Create a meeting for later</span>
                        <span className="text-[10px] text-muted-foreground">Generate link to share</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleInstantMeeting}
                      className="gap-2.5 py-2.5 cursor-pointer text-xs"
                    >
                      <Sparkles className="size-4 text-amber-500" />
                      <div>
                        <span className="font-semibold block">Start an instant meeting</span>
                        <span className="text-[10px] text-muted-foreground">Join green room now</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/v2/workspace/meetings")}
                      className="gap-2.5 py-2.5 cursor-pointer text-xs"
                    >
                      <Calendar className="size-4 text-emerald-500" />
                      <div>
                        <span className="font-semibold block">Schedule in Calendar</span>
                        <span className="text-[10px] text-muted-foreground">Plan team session</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Enter code or link */}
                <form onSubmit={handleJoinByCode} className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={meetCodeInput}
                      onChange={(e) => setMeetCodeInput(e.target.value)}
                      placeholder="Enter a code or link (e.g. abc-defg-hij)"
                      className="h-11 pl-9 pr-3 text-xs sm:text-sm rounded-xl border-border/80 bg-background/80"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!meetCodeInput.trim()}
                    variant="ghost"
                    className="h-11 px-4 text-xs font-semibold rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
                  >
                    Join
                  </Button>
                </form>
              </div>
            </div>

            {/* Illustration / Graphic Column */}
            <div className="hidden md:flex md:col-span-5 justify-center">
              <div className="relative p-6 rounded-2xl bg-card border border-border/60 shadow-lg text-center space-y-3 max-w-xs">
                <div className="flex size-14 mx-auto items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                  <ShieldCheck className="size-7" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Your meeting is safe</h4>
                <p className="text-xs text-muted-foreground">
                  No one can join a meeting unless invited or admitted by the host.
                </p>
                <div className="text-[10px] font-mono text-blue-500 bg-blue-500/10 rounded-lg py-1 px-2">
                  https://meet.airsend.in
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Calls Split View ── */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Speed Dial / Contacts */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  Speed Dial Contacts
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {members.length} members
                </span>
              </div>

              <div className="space-y-2">
                {members.slice(0, 6).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-accent/10 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="relative shrink-0">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
                            {member.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-background ${
                            member.status === "online" ? "bg-emerald-500" :
                            member.status === "busy" || member.status === "dnd" ? "bg-red-500" :
                            "bg-yellow-500"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {member.displayName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate capitalize">
                          {member.status} • {member.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700"
                        onClick={() => handleStartCall(member.userId, member.displayName, "audio")}
                        title="Voice Call"
                      >
                        <Phone className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
                        onClick={() => handleStartCall(member.userId, member.displayName, "video")}
                        title="Video Call"
                      >
                        <Video className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Call History Log */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Tabs
                value={filterTab}
                onValueChange={(v) => setFilterTab(v as any)}
                className="w-full sm:w-auto"
              >
                <TabsList className="h-8 p-0.5 bg-muted/60">
                  <TabsTrigger value="all" className="text-xs h-7 px-3">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="missed" className="text-xs h-7 px-3 text-red-500 data-[state=active]:text-red-500">
                    Missed
                  </TabsTrigger>
                  <TabsTrigger value="incoming" className="text-xs h-7 px-3">
                    Incoming
                  </TabsTrigger>
                  <TabsTrigger value="outgoing" className="text-xs h-7 px-3">
                    Outgoing
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search calls..."
                  className="h-8 pl-8 text-xs bg-card border-border/60"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-2xs divide-y divide-border/30">
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Clock className="size-6 mx-auto opacity-40" />
                  <p>No call history found.</p>
                </div>
              ) : (
                filteredRecords.map((rec) => {
                  const isOutgoing = rec.direction === "outgoing";
                  const peerName = isOutgoing ? rec.receiverName : rec.callerName;

                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-3.5 hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {getDirectionIcon(rec.direction)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate flex items-center gap-2">
                            {peerName}
                            {rec.direction === "missed" && (
                              <Badge variant="destructive" className="text-[9px] py-0 px-1.5 h-4">
                                Missed
                              </Badge>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="capitalize">{rec.type} Call</span>
                            <span>•</span>
                            <span>{new Date(rec.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                            <span>{new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            {rec.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(rec.duration)}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleStartCall(rec.receiverId, peerName, rec.type)}
                          title="Call back"
                        >
                          {rec.type === "video" ? <Video className="size-3.5" /> : <Phone className="size-3.5" />}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Create Meeting for Later ── */}
      <Dialog open={!!createdLaterLink} onOpenChange={(open) => !open && setCreatedLaterLink(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Link2 className="size-4 text-blue-500" />
              Here&apos;s the link to your meeting
            </DialogTitle>
            <DialogDescription className="text-xs">
              Copy this link and send it to people you want to meet with. Be sure to save it so you can use it later, too.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 border border-border/80">
            <span className="font-mono text-xs truncate pr-2 select-all text-foreground">
              {createdLaterLink}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                if (createdLaterLink) {
                  navigator.clipboard?.writeText(createdLaterLink);
                  setCopiedLater(true);
                  setTimeout(() => setCopiedLater(false), 2000);
                }
              }}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copiedLater ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </Button>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setCreatedLaterLink(null)}
              className="text-xs h-9"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (createdLaterLink) {
                  const code = parseMeetInput(createdLaterLink);
                  router.push(`/v2/workspace/calls/${code}`);
                }
              }}
              className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
            >
              Join now
              <ArrowRight className="size-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Manual Dialer / Member Selector ── */}
      <Dialog open={dialerOpen} onOpenChange={setDialerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <PhoneCall className="size-4 text-purple-600" />
              Make a Call
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select any workspace team member to initiate a high-definition 1-on-1 audio or video call.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                      {member.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {member.displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] gap-1 text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
                    onClick={() => handleStartCall(member.userId, member.displayName, "audio")}
                  >
                    <Phone className="size-3" />
                    Audio
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[11px] gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleStartCall(member.userId, member.displayName, "video")}
                  >
                    <Video className="size-3" />
                    Video
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
