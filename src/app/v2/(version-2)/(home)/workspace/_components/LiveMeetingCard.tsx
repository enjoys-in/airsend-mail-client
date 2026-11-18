"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MoreVertical,
  Trash2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi } from "../_lib/api";
import type { Meeting } from "../_lib/chat-types";

interface LiveMeetingCardProps {
  meeting: Meeting;
  compact?: boolean;
  onJoin?: (meeting: Meeting) => void;
}

export default function LiveMeetingCard({ meeting, compact = false, onJoin }: LiveMeetingCardProps) {
  const { currentUserId, deleteMeeting } = useChatStore();
  const [copied, setCopied] = useState(false);
  const [isRSVPing, setIsRSVPing] = useState(false);

  const isLive = meeting.status === "live";
  const isOrganizer = meeting.organizerId === currentUserId;

  const myAttendee = meeting.attendees?.find(
    (a) => a.email === currentUserId || a.id === currentUserId
  );
  const myStatus = myAttendee?.status;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}${meeting.meetingUrl}` : meeting.meetingUrl;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRSVP = async (status: "accepted" | "declined" | "tentative", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || isRSVPing) return;
    setIsRSVPing(true);
    try {
      await workspaceApi.respondMeeting(meeting.id, status, currentUserId);
      useChatStore.setState((s) => ({
        meetings: s.meetings.map((m) => {
          if (m.id !== meeting.id) return m;
          return {
            ...m,
            attendees: m.attendees.map((a) =>
              a.email === currentUserId ? { ...a, status } : a
            ),
          };
        }),
      }));
    } catch {
      // Fallback
    } finally {
      setIsRSVPing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMeeting(meeting.id);
  };

  const targetCallUrl = meeting.meetingUrl.startsWith("/v2/workspace/calls/")
    ? meeting.meetingUrl
    : `/v2/workspace/calls/${meeting.id}`;

  const formatMeetingTime = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.toLocaleDateString([], { month: "short", day: "numeric" })} • ${s.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
          isLive
            ? "border-red-500/40 bg-red-500/5 dark:bg-red-950/20 shadow-sm"
            : "border-border/60 bg-card hover:border-primary/30"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div
            className={`flex size-9 items-center justify-center rounded-lg shrink-0 ${
              isLive ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
            }`}
          >
            {isLive ? <Radio className="size-4 animate-pulse" /> : <Video className="size-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold truncate text-foreground">{meeting.title}</h4>
              {isLive && (
                <Badge className="bg-red-500 text-white text-[9px] px-1 py-0 h-3.5 animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {formatMeetingTime(meeting.startTime, meeting.endTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            asChild
            className={`h-7 text-xs px-2.5 gap-1.5 shadow-none ${
              isLive ? "bg-red-600 hover:bg-red-700 text-white" : ""
            }`}
            onClick={() => onJoin?.(meeting)}
          >
            <Link href={targetCallUrl}>
              <Video className="size-3" />
              <span>{isLive ? "Join Now" : "Join"}</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 bg-card shadow-sm hover:shadow-md ${
        isLive
          ? "border-red-500/50 ring-1 ring-red-500/30 bg-gradient-to-br from-card via-card to-red-500/5"
          : "border-border/60 hover:border-primary/40"
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isLive ? (
              <Badge className="bg-red-500 text-white text-[10px] gap-1 px-2 py-0.5 animate-pulse shadow-sm">
                <span className="size-1.5 rounded-full bg-white animate-ping" />
                HAPPENING NOW
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] capitalize text-muted-foreground">
                {meeting.status}
              </Badge>
            )}

            {meeting.channelName && (
              <Badge variant="secondary" className="text-[10px] text-blue-600 dark:text-blue-400">
                #{meeting.channelName}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Copy meeting link"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>

            {isOrganizer && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="size-7 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                    <Trash2 className="size-3.5 mr-2" />
                    Cancel Meeting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 mb-1">
          {meeting.title}
        </h3>
        {meeting.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {meeting.description}
          </p>
        )}

        {/* Time Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
          <Clock className="size-3.5 text-primary shrink-0" />
          <span>{formatMeetingTime(meeting.startTime, meeting.endTime)}</span>
        </div>

        {/* Attendees */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {(meeting.attendees || []).slice(0, 4).map((att) => (
                <Avatar key={att.id || att.email} className="size-6 border-2 border-background">
                  <AvatarFallback className="bg-primary/20 text-[10px] text-primary font-bold">
                    {att.name?.charAt(0) || att.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {meeting.attendees?.length || 1} participant{meeting.attendees?.length === 1 ? "" : "s"}
            </span>
          </div>

          <span className="text-[11px] text-muted-foreground">
            Host: <strong className="text-foreground font-medium">{meeting.organizerName}</strong>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
        {/* RSVP buttons if attendee */}
        {!isOrganizer ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={myStatus === "accepted" ? "default" : "outline"}
              className="h-7 text-xs px-2 gap-1"
              onClick={(e) => handleRSVP("accepted", e)}
              title="Accept invitation"
            >
              <CheckCircle2 className="size-3" />
              <span className="hidden sm:inline">Going</span>
            </Button>
            <Button
              size="sm"
              variant={myStatus === "tentative" ? "secondary" : "ghost"}
              className="h-7 text-xs px-2"
              onClick={(e) => handleRSVP("tentative", e)}
              title="Maybe"
            >
              <HelpCircle className="size-3" />
            </Button>
            <Button
              size="sm"
              variant={myStatus === "declined" ? "destructive" : "ghost"}
              className="h-7 text-xs px-2"
              onClick={(e) => handleRSVP("declined", e)}
              title="Decline"
            >
              <XCircle className="size-3" />
            </Button>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground italic">
            You are the meeting organizer
          </div>
        )}

        {/* 1-Click Join Button */}
        <Button
          size="sm"
          asChild
          className={`h-8 px-4 text-xs font-semibold gap-1.5 shadow-sm ${
            isLive ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
          onClick={() => onJoin?.(meeting)}
        >
          <Link href={targetCallUrl}>
            <Video className="size-3.5" />
            <span>{isLive ? "Join Live Call" : "Start / Join"}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
