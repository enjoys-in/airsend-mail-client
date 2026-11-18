"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Hash,
  Volume2,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  Lock,
  Settings,
  Search,
  MessageCircle,
  Activity,
  CheckSquare,
  Circle,
  UserPlus,
  Pin,
  Calendar,
  Phone,
  FolderOpen,
  Home,
  Workflow,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useChatStore } from "../_lib/chat-store";
import { useMyPendingTaskCount } from "../../tasks/_lib/my-tasks-store";
import { getDMPartner, getUserRoleInTeam, resolveChannelPermission } from "../_lib/permissions";
import { useTeamAccess, settingsPath } from "../_lib/use-access";
import type { Channel } from "../_lib/chat-types";
import ChannelCreateEditDialog from "./ChannelCreateEditDialog";
import InviteMemberDialog from "./InviteMemberDialog";
import TeamCreateDialog from "./TeamCreateDialog";
import StatusCard from "./StatusCard";
import UserPresenceBadge from "./UserPresenceBadge";

// ==========================================================================
// WorkspaceSidebar — nested secondary panel following the Mailboxes pattern
// Rendered inside <SidebarSecondaryPanel> for /v2/workspace
// ==========================================================================

export default function WorkspaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    teams,
    activeTeamId,
    directMessages,
    members,
    myStatus,
    myCustomStatus,
    currentUserId,
    setMyStatus,
    setMyCustomStatus,
    setActiveTeam,
    getTeamChannels,
    getUnreadNotificationCount,
    setSidePanelView,
    sidePanelView,
    toggleChannelPin,
    isLoadingTeams,
    isLoadingChannels,
  } = useChatStore();

  // Derive active channel/dm from URL
  const channelMatch = pathname.match(/\/workspace\/c\/([^/]+)/);
  const dmMatch = pathname.match(/\/workspace\/dm\/([^/]+)/);
  const activeChannelId = channelMatch?.[1] ?? null;
  const activeDmId = dmMatch?.[1] ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [textOpen, setTextOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [dmOpen, setDmOpen] = useState(true);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  const activeTeam = teams.find((t:any) => t.id === activeTeamId);
  const channels = activeTeamId ? getTeamChannels(activeTeamId) : [];
  const userRole = getUserRoleInTeam(members, activeTeamId, currentUserId);
  const teamAccess = useTeamAccess(activeTeamId);
  const canCreateChannels = teamAccess.can("create_channels");
  const canInvite = teamAccess.can("manage_members");
  const openTeamSettings = () => activeTeamId && router.push(settingsPath.team(activeTeamId));
  const canManageChannel = (ch: Channel) =>
    resolveChannelPermission(ch, userRole, "manage_channel", teamAccess.access) || teamAccess.can("manage_roles");

  const textChannels = channels.filter(
    (c:any) => c.type === "text" || c.type === "announcement",
  );
  const voiceChannels = channels.filter((c:any) => c.type === "voice");

  const filtered = (searchQuery.trim()
    ? textChannels.filter((c:any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : textChannels
  ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const filteredVoice = (searchQuery.trim()
    ? voiceChannels.filter((c:any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : voiceChannels
  ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const unreadCount = getUnreadNotificationCount();
  const taskCount = useMyPendingTaskCount();

  // Members with custom status (not standard statuses like away, idle, busy, dnd)
  const standardStatuses = ["online", "offline", "away", "idle", "busy", "dnd"];
  const membersWithCustomStatus = members.filter(
    (m:any) => m.customStatus && !standardStatuses.includes(m.customStatus.toLowerCase()),
  );

  const statusColor: Record<string, string> = {
    online: "bg-emerald-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    busy: "bg-red-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  return (
    <>
      <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background">
        {/* ── Header: team switcher ── */}
        <SidebarHeader className="gap-0 border-b p-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-12 w-full items-center justify-between px-3 text-left hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {activeTeam?.name?.charAt(0) ?? "W"}
                  </span>
                  <span className="truncate text-sm font-semibold">
                    {activeTeam?.name || "Workspace"}
                  </span>
                </div>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {teams.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setActiveTeam(t.id)}
                  className={cn(
                    "gap-2",
                    t.id === activeTeamId && "bg-accent font-medium",
                  )}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                    {(t.name || "?").charAt(0).toUpperCase()}
                  </span>
                  {t.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={openTeamSettings}>
                <Settings className="size-3.5" />
                Team Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => setCreateTeamOpen(true)}>
                <Plus className="size-3.5" />
                Create Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator className="bg-border/40" />

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>
        </SidebarHeader>

        {/* ── Content: channels + DMs ── */}
        <SidebarContent className="py-0">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <ScrollArea className="flex-1">
                <div className="px-2 pb-4">
                  {/* Teams Route Apps */}
                  <div className="space-y-0.5 pt-1 pb-2">
                    <Link
                      href="/v2/workspace"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname === "/v2/workspace"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <Home className="size-3.5 shrink-0 text-blue-500" />
                      <span>Workspace Hub</span>
                    </Link>
                    <Link
                      href="/v2/workspace/activity"
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname === "/v2/workspace/activity"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="size-3.5 shrink-0 text-rose-500" />
                        <span>Activity</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/v2/workspace/meetings"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname === "/v2/workspace/meetings"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <Calendar className="size-3.5 shrink-0 text-emerald-500" />
                      <span>Meetings</span>
                    </Link>
                    <Link
                      href="/v2/workspace/calls"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname.startsWith("/v2/workspace/calls")
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <Phone className="size-3.5 shrink-0 text-purple-500" />
                      <span>Calls</span>
                    </Link>
                    <Link
                      href="/v2/workspace/tasks"
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname === "/v2/workspace/tasks"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="size-3.5 shrink-0 text-amber-500" />
                        <span>Tasks</span>
                      </div>
                      {taskCount > 0 && (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                          {taskCount > 9 ? "9+" : taskCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/v2/workspace/files"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname === "/v2/workspace/files"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <FolderOpen className="size-3.5 shrink-0 text-indigo-500" />
                      <span>Files</span>
                    </Link>
                    <Link
                      href="/v2/workspace/workflows"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors font-medium",
                        pathname === "/v2/workspace/workflows"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <Workflow className="size-3.5 shrink-0 text-cyan-500" />
                      <span>Workflows</span>
                    </Link>
                  </div>

                  <div className="mx-1 my-1">
                    <Separator className="bg-border/30" />
                  </div>

                  {/* Text / Announcement Channels */}
                  <ChannelSection
                    title="Channels"
                    isOpen={textOpen}
                    onToggle={() => setTextOpen(!textOpen)}
                    onAdd={
                      canCreateChannels
                        ? () => {
                            setEditingChannel(null);
                            setChannelDialogOpen(true);
                          }
                        : undefined
                    }
                  >
                    {isLoadingChannels && filtered.length === 0 ? (
                      <div className="space-y-1 px-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2 py-1.5">
                            <Skeleton className="size-3.5 rounded" />
                            <Skeleton className={`h-3 ${i % 2 === 0 ? "w-20" : "w-16"}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                    filtered.map((channel) => (
                      <ChannelItem
                        key={channel.id}
                        channel={channel}
                        isActive={activeChannelId === channel.id}
                        href={`/v2/workspace/c/${channel.id}`}
                        onEdit={
                          canManageChannel(channel)
                            ? (ch) => router.push(settingsPath.channel(ch.teamId, ch.id))
                            : undefined
                        }
                        onTogglePin={(id) => toggleChannelPin(id)}
                      />
                    ))
                    )}
                  </ChannelSection>

                  {/* Voice Channels */}
                  {filteredVoice.length > 0 && (
                    <ChannelSection
                      title="Voice Channels"
                      isOpen={voiceOpen}
                      onToggle={() => setVoiceOpen(!voiceOpen)}
                    >
                      {filteredVoice.map((channel) => (
                        <ChannelItem
                          key={channel.id}
                          channel={channel}
                          isActive={activeChannelId === channel.id}
                          href={`/v2/workspace/c/${channel.id}`}
                          isVoice
                          onEdit={
                            canManageChannel(channel)
                              ? (ch) => router.push(settingsPath.channel(ch.teamId, ch.id))
                              : undefined
                          }
                          onTogglePin={(id) => toggleChannelPin(id)}
                        />
                      ))}
                    </ChannelSection>
                  )}

                  <div className="mx-2 my-1">
                    <Separator className="bg-border/30" />
                  </div>

                  {/* Direct Messages */}
                  <ChannelSection
                    title="Direct Messages"
                    isOpen={dmOpen}
                    onToggle={() => setDmOpen(!dmOpen)}
                  >
                    {directMessages.map((dm) => {
                      const other = getDMPartner(dm, currentUserId);
                      return (
                        <Link
                          key={dm.id}
                          href={`/v2/workspace/dm/${dm.id}`}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            activeDmId === dm.id
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                          )}
                        >
                          <span className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                            {(other.displayName || other.username || "?").charAt(0).toUpperCase()}
                            <UserPresenceBadge
                              status={other.status}
                              className="absolute -bottom-0.5 -right-0.5"
                            />
                          </span>
                          <span className="truncate text-xs">
                            {other.displayName || other.username}
                          </span>
                          {dm.unreadCount > 0 && (
                            <span className="ml-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                              {dm.unreadCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </ChannelSection>
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer: status + quick actions + settings ── */}
        <SidebarFooter className="border-t border-border/40 gap-0 py-1">
          {/* Members with custom status notices */}
          {membersWithCustomStatus.length > 0 && (
            <div className="px-2 pb-1 space-y-0.5">
              {membersWithCustomStatus.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 rounded-md bg-accent/50 px-2 py-1 text-[10px] text-muted-foreground"
                >
                  <span className="font-medium text-foreground truncate max-w-[100px]">
                    {m.displayName}
                  </span>
                  <span className="truncate">has informed: {m.customStatus}</span>
                </div>
              ))}
            </div>
          )}

          {/* Current user status — clickable to change */}
          <div className="px-2 py-1">
            <StatusCard
              currentStatus={myStatus}
              customStatus={myCustomStatus || undefined}
              displayName="You"
              onStatusChange={setMyStatus}
              onCustomStatusChange={setMyCustomStatus}
            />
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7",
                  pathname === "/v2/workspace/activity" && "bg-accent text-accent-foreground",
                )}
                onClick={() => router.push("/v2/workspace/activity")}
                title="Activity Feed"
              >
                <Activity className="size-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7",
                  pathname === "/v2/workspace/tasks" && "bg-accent text-accent-foreground",
                )}
                onClick={() => router.push("/v2/workspace/tasks")}
                title="Tasks & Planner"
              >
                <CheckSquare className="size-3.5" />
                {taskCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white">
                    {taskCount > 9 ? "9+" : taskCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7",
                  sidePanelView === "members" && "bg-accent text-accent-foreground",
                )}
                onClick={() => setSidePanelView("members")}
              >
                <MessageCircle className="size-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              {canInvite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setInviteDialogOpen(true)}
                  title="Invite member"
                  aria-label="Invite member"
                >
                  <UserPlus className="size-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn("size-7", pathname.includes("/settings") && "bg-accent text-accent-foreground")}
                onClick={openTeamSettings}
                title="Team settings"
                aria-label="Team settings"
              >
                <Settings className="size-3.5" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Channel create dialog (editing is a routed settings page) */}
      <ChannelCreateEditDialog
        open={channelDialogOpen}
        onOpenChange={setChannelDialogOpen}
        channel={editingChannel}
      />

      {/* Invite member dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {/* Create team dialog */}
      <TeamCreateDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
      />
    </>
  );
}

// ==========================================================================
// Collapsible section
// ==========================================================================

function ChannelSection({
  title,
  isOpen,
  onToggle,
  onAdd,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="flex items-center justify-between py-2">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            {isOpen ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
            {title}
          </button>
        </CollapsibleTrigger>
        {onAdd && (
          <Button variant="ghost" size="icon" className="size-5" onClick={onAdd} aria-label={`Add to ${title}`}>
            <Plus className="size-3" />
          </Button>
        )}
      </div>
      <CollapsibleContent className="space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ==========================================================================
// Channel item
// ==========================================================================

function ChannelItem({
  channel,
  isActive,
  href,
  isVoice,
  onEdit,
  onTogglePin,
}: {
  channel: Channel;
  isActive: boolean;
  href: string;
  isVoice?: boolean;
  onEdit?: (channel: Channel) => void;
  onTogglePin?: (channelId: string) => void;
}) {
  const Icon = isVoice
    ? Volume2
    : channel.type === "announcement"
      ? Bell
      : channel.visibility === "private"
        ? Lock
        : Hash;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate text-xs">{channel.name}</span>
          {channel.isPinned && (
            <Pin className="size-2.5 shrink-0 text-primary ml-auto" />
          )}
          {channel.unreadCount > 0 && (
            <span className={cn(
              "flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground",
              !channel.isPinned && "ml-auto",
            )}>
              {channel.unreadCount}
            </span>
          )}
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuItem onClick={() => onTogglePin?.(channel.id)}>
          <Pin className="mr-2 size-3.5" />
          {channel.isPinned ? "Unpin Channel" : "Pin Channel"}
        </ContextMenuItem>
        {onEdit && (
          <ContextMenuItem onClick={() => onEdit(channel)}>
            <Settings className="mr-2 size-3.5" />
            Channel Settings
          </ContextMenuItem>
        )}
        <ContextMenuItem
          onClick={() => {
            const url = new URL(`/v2/workspace/c/${channel.id}`, window.location.origin);
            void navigator.clipboard.writeText(url.toString());
          }}
        >
          <Hash className="mr-2 size-3.5" />
          Copy Channel Link
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
