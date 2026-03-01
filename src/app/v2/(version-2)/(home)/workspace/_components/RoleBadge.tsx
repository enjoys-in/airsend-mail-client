"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, Crown, Star, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MemberRole } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// RoleBadge — shows member role icon + optional label next to usernames
// ---------------------------------------------------------------------------

const roleConfig: Record<
  MemberRole,
  { label: string; icon: React.ElementType; color: string }
> = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-500",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-red-500",
  },
  moderator: {
    label: "Moderator",
    icon: Shield,
    color: "text-blue-500",
  },
  member: {
    label: "Member",
    icon: Star,
    color: "text-muted-foreground",
  },
  guest: {
    label: "Guest",
    icon: Eye,
    color: "text-muted-foreground/60",
  },
};

interface RoleBadgeProps {
  role: MemberRole;
  showLabel?: boolean;
  className?: string;
}

export default function RoleBadge({
  role,
  showLabel = false,
  className,
}: RoleBadgeProps) {
  const config = roleConfig[role];
  if (!config || role === "member") return null; // don't show badge for regular members

  const Icon = config.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-0.5",
              config.color,
              className,
            )}
          >
            <Icon className="size-3" />
            {showLabel && (
              <span className="text-[10px] font-medium">{config.label}</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
