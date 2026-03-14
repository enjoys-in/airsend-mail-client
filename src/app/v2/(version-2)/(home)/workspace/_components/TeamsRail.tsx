"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calendar,
  CheckSquare,
  Plus,
  MessageCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "../_lib/chat-store";
import TeamCreateDialog from "./TeamCreateDialog";

// ---------------------------------------------------------------------------
// Teams Rail — vertical icon strip (leftmost column)
// ---------------------------------------------------------------------------

export default function TeamsRail() {
  const {
    teams,
    activeTeamId,
    setActiveTeam,
    getUnreadNotificationCount,
    getPendingTaskCount,
    setSidePanelView,
    sidePanelView,
    isLoadingTeams,
  } = useChatStore();

  const unreadCount = getUnreadNotificationCount();
  const taskCount = getPendingTaskCount();
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full w-16 flex-col items-center border-r border-border/40 bg-sidebar py-3 gap-1">
        {/* DM / Home button */}
        <RailButton
          tooltip="Direct Messages"
          isActive={false}
          onClick={() => {}}
        >
          <MessageCircle className="size-5" />
        </RailButton>

        <Separator className="mx-auto w-8 my-1" />

        {/* Team icons — skeleton while loading */}
        {isLoadingTeams && teams.length === 0 ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="size-10 rounded-xl" />
            ))}
          </>
        ) : (
        teams.map((team) => (
          <RailButton
            key={team.id}
            tooltip={team.name}
            isActive={activeTeamId === team.id}
            onClick={() => setActiveTeam(team.id)}
          >
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="size-5 rounded"
              />
            ) : (
              <span className="text-xs font-bold leading-none">
                {team.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </RailButton>
        ))
        )}

        {/* Add team */}
        <RailButton tooltip="Create Team" isActive={false} onClick={() => setCreateTeamOpen(true)}>
          <Plus className="size-5" />
        </RailButton>
        <TeamCreateDialog open={createTeamOpen} onOpenChange={setCreateTeamOpen} />

        <Separator className="mx-auto w-8 my-1" />

        {/* Productivity buttons */}
        <RailButton
          tooltip="Activity"
          isActive={sidePanelView === "activity"}
          badge={unreadCount > 0 ? unreadCount : undefined}
          badgeColor="bg-red-500"
          onClick={() => setSidePanelView("activity")}
        >
          <Activity className="size-5" />
        </RailButton>

        <RailButton
          tooltip="Tasks"
          isActive={sidePanelView === "tasks"}
          badge={taskCount > 0 ? taskCount : undefined}
          badgeColor="bg-orange-500"
          onClick={() => setSidePanelView("tasks")}
        >
          <CheckSquare className="size-5" />
        </RailButton>

        <RailButton
          tooltip="Calendar"
          isActive={false}
          badgeColor="bg-blue-500"
          onClick={() => {}}
        >
          <Calendar className="size-5" />
        </RailButton>
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Shared rail button
// ---------------------------------------------------------------------------

function RailButton({
  children,
  tooltip,
  isActive,
  badge,
  badgeColor = "bg-red-500",
  onClick,
}: {
  children: React.ReactNode;
  tooltip: string;
  isActive: boolean;
  badge?: number;
  badgeColor?: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative flex size-10 items-center justify-center rounded-xl transition-all duration-200",
            "hover:rounded-2xl hover:bg-accent",
            isActive
              ? "bg-primary text-primary-foreground rounded-2xl shadow-sm"
              : "bg-muted text-muted-foreground",
          )}
        >
          {children}
          {/* Active indicator pill */}
          {isActive && (
            <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
          )}
          {/* Badge */}
          {badge !== undefined && badge > 0 && (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white",
                badgeColor,
              )}
            >
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
