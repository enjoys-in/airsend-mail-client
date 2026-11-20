"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "./_lib/chat-store";
import { revalidate } from "./_lib/workspace-cache";
import { isOpenTask, useEnsureMyTasks, useMyTasksStore } from "../tasks/_lib/my-tasks-store";
import { WorkspaceHomeSkeleton } from "./_components/WorkspaceSkeletons";
import WorkspaceErrorBoundary from "./_components/WorkspaceErrorBoundary";
import { WorkspaceHeroBanner } from "./_components/WorkspaceHeroBanner";
import { WorkspaceQuickNav } from "./_components/WorkspaceQuickNav";
import { WorkspaceMeetingsCard } from "./_components/WorkspaceMeetingsCard";
import { WorkspaceTasksCard } from "./_components/WorkspaceTasksCard";
import { WorkspaceActivityCard } from "./_components/WorkspaceActivityCard";
import { WorkspaceFilesCard } from "./_components/WorkspaceFilesCard";
import { WorkspaceChannelsCard } from "./_components/WorkspaceChannelsCard";

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
    meetings,
    files,
    notifications,
    startCall,
    fetchTeams,
    fetchNotifications,
    fetchMeetings,
  } = useChatStore();

  useEnsureMyTasks();
  const myTasks = useMyTasksStore((s) => s.tasks);
  const setTaskStatus = useMyTasksStore((s) => s.setTaskStatus);
  const openTasks = myTasks.filter(isOpenTask);

  // Auto-fetch real workspace data if empty
  useEffect(() => {
    const email = "mullayam06@airsend.in";
    if (teams.length === 0) {
      void revalidate("teams", () => fetchTeams(email));
    }
    void revalidate("notifications", () => fetchNotifications());
    void revalidate(activeTeamId ? `meetings:${activeTeamId}` : "meetings:all", () => fetchMeetings(activeTeamId || undefined));
  }, [teams.length, activeTeamId, fetchTeams, fetchNotifications, fetchMeetings]);

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];
  const teamChannels = activeTeamId
    ? channels.filter((c) => c.teamId === activeTeamId)
    : channels;
  const liveMeetings = meetings.filter((m) => m.status === "live");
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
      <WorkspaceHeroBanner
        activeTeam={activeTeam}
        defaultChannel={defaultChannel}
        onInstantMeeting={handleInstantMeeting}
      />

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
      <WorkspaceQuickNav
        channelsCount={teamChannels.length}
        meetingsCount={meetings.length}
        openTasksCount={openTasks.length}
        filesCount={files.length}
        unreadActivityCount={notifications.filter((n) => !n.isRead).length}
        defaultChannelId={defaultChannel?.id}
      />

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkspaceMeetingsCard
          meetings={meetings}
          onJoinCall={handleJoinCall}
        />
        <WorkspaceTasksCard
          tasks={openTasks}
          onCompleteTask={(taskId) => setTaskStatus(taskId, "done")}
        />
        <WorkspaceActivityCard
          notifications={notifications}
        />
      </div>

      {/* ── Team Documents & Channel Shortcuts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkspaceFilesCard files={files} />
        <WorkspaceChannelsCard channels={teamChannels} />
      </div>
    </div>
  );
}
