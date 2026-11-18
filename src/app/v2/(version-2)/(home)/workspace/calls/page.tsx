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
import { useChatStore } from "../_lib/chat-store";
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
    const callId = `call-${Date.now().toString(36)}`;
    startCall(callId, `${type === "video" ? "Video Call with" : "Call with"} ${memberName}`);

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
    router.push(`/v2/workspace/calls/${callId}`);
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
          <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Phone className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Calls
              <Badge variant="outline" className="text-[11px] font-normal border-border/60">
                Speed Dial & History
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              1-on-1 and team audio/video calling
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
            Make a Call
          </Button>
        </div>
      </div>

      {/* ── Main Calls Split View ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
                        title="Start audio call"
                      >
                        <Phone className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
                        onClick={() => handleStartCall(member.userId, member.displayName, "video")}
                        title="Start video call"
                      >
                        <Video className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Call History & Logs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border/40 bg-card p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)} className="w-auto">
                  <TabsList className="h-8 p-0.5 bg-muted/60">
                    <TabsTrigger value="all" className="text-xs h-7 px-3">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="missed" className="text-xs h-7 px-3">
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

                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search call logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-background"
                  />
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PhoneMissed className="size-10 text-muted-foreground opacity-30 mb-2" />
                  <p className="text-xs font-medium text-foreground">No call logs found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Your recent voice and video call logs will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRecords.map((rec) => {
                    const isCallerYou = rec.callerName === "You";
                    const counterpartName = isCallerYou ? rec.receiverName : rec.callerName;
                    const isMissed = rec.direction === "missed";

                    return (
                      <div
                        key={rec.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isMissed
                            ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                            : "border-border/30 bg-accent/10 hover:bg-accent/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/40 shadow-xs">
                            {getDirectionIcon(rec.direction)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-semibold truncate ${isMissed ? "text-red-500" : "text-foreground"}`}>
                                {counterpartName}
                              </p>
                              <Badge variant="outline" className="text-[10px] h-4 px-1 gap-1 capitalize">
                                {rec.type === "video" ? <Video className="size-2.5" /> : <Phone className="size-2.5" />}
                                {rec.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span>{new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              <span>•</span>
                              <span>{new Date(rec.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                              {rec.duration > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(rec.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Call back action */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1.5 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700"
                            onClick={() => handleStartCall(rec.receiverId, counterpartName, rec.type)}
                          >
                            <PhoneCall className="size-3" />
                            Call back
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Make a Call Dialog ── */}
      <Dialog open={dialerOpen} onOpenChange={setDialerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="size-5 text-purple-500" />
              Start a Call
            </DialogTitle>
            <DialogDescription>
              Select a teammate to initiate an instant HD audio or video call.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[340px] overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                      {member.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{member.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                    onClick={() => handleStartCall(member.userId, member.displayName, "audio")}
                  >
                    <Phone className="size-3" />
                    Audio
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleStartCall(member.userId, member.displayName, "video")}
                  >
                    <Video className="size-3" />
                    Video
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialerOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
