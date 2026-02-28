"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageCircle,
  Phone,
  Clock,
  Building2,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RoleBadge from "./RoleBadge";
import { useChatStore } from "../_lib/chat-store";
import type { TeamMember, PresenceStatus } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// ProfileCard — Microsoft Teams-style popup
// Shows: picture, status, email, role hierarchy, direct message action
// ---------------------------------------------------------------------------

const statusLabels: Record<PresenceStatus, string> = {
  online: "Available",
  idle: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
};

const statusColors: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
  away: "bg-orange-500",
  busy: "bg-rose-500",
};

// Role hierarchy ordering
const roleHierarchy: Record<string, number> = {
  owner: 0,
  admin: 1,
  moderator: 2,
  member: 3,
  guest: 4,
};

interface ProfileCardProps {
  member: TeamMember;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  onSendMessage?: (userId: string) => void;
}

export default function ProfileCard({
  member,
  children,
  side = "right",
  onSendMessage,
}: ProfileCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { directMessages, members } = useChatStore();

  // Find reporting chain (members with higher role in the hierarchy)
  const reportsTo = members
    .filter(
      (m) =>
        m.userId !== member.userId &&
        m.teamId === member.teamId &&
        (roleHierarchy[m.role] ?? 3) < (roleHierarchy[member.role] ?? 3),
    )
    .sort((a, b) => (roleHierarchy[a.role] ?? 3) - (roleHierarchy[b.role] ?? 3))
    .slice(0, 2);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(member.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMessage = () => {
    // Try to find existing DM or trigger DM creation
    const existingDm = directMessages.find((dm) =>
      dm.participants.some((p) => p.userId === member.userId),
    );
    if (existingDm) {
      router.push(`/v2/workspace/dm/${existingDm.id}`);
    } else {
      onSendMessage?.(member.userId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align="start"
        className="w-80 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Top section — avatar + name + status */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div className="relative shrink-0">
            <Avatar className="size-14">
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                {member.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background",
                statusColors[member.status],
              )}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold truncate">
                {member.displayName}
              </h3>
              <RoleBadge role={member.role} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-2 rounded-full shrink-0",
                  statusColors[member.status],
                )}
              />
              <span className="text-xs text-muted-foreground">
                {statusLabels[member.status]}
              </span>
            </div>

            {/* Custom status */}
            {member.customStatus && (
              <p className="text-xs text-muted-foreground italic truncate">
                &quot;{member.customStatus}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Quick action — Message button (prominent, Teams-style) */}
        <div className="px-4 pb-3">
          <Button
            className="w-full gap-2"
            size="sm"
            onClick={handleMessage}
          >
            <MessageCircle className="size-4" />
            Message
          </Button>
        </div>

        <Separator />

        {/* Contact info */}
        <div className="p-4 space-y-3">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {member.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={handleCopyEmail}
              title="Copy email"
            >
              {copied ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Joined{" "}
              {new Date(member.joinedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Reporting hierarchy */}
          {reportsTo.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reports to
                </span>
                {reportsTo.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="size-6">
                      {manager.avatar ? (
                        <AvatarImage
                          src={manager.avatar}
                          alt={manager.displayName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-muted text-[10px] font-medium">
                        {manager.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {manager.displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {manager.role}
                      </p>
                    </div>
                    <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom actions */}
        <Separator />
        <div className="flex items-center gap-1 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            onClick={() => {
              window.location.href = `mailto:${member.email}`;
              setOpen(false);
            }}
          >
            <Mail className="size-3.5" />
            Email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            title="Start call"
          >
            <Phone className="size-3.5" />
            Call
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            title="Organization"
          >
            <Building2 className="size-3.5" />
            Org
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
