"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
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
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "../_lib/chat-store";
import type { Channel } from "../_lib/chat-types";
import TeamSettingsDialog from "./TeamSettingsDialog";

// ---------------------------------------------------------------------------
// Channel Sidebar — shows channels + DMs for the active team
// ---------------------------------------------------------------------------

export default function ChannelSidebar() {
  const {
    teams,
    activeTeamId,
    activeChannelId,
    activeDmId,
    directMessages,
    setActiveChannel,
    setActiveDm,
    setActiveTeam,
    getTeamChannels,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [textOpen, setTextOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(true);

  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const channels = activeTeamId ? getTeamChannels(activeTeamId) : [];

  const textChannels = channels.filter(
    (c) => c.type === "text" || c.type === "announcement",
  );
  const voiceChannels = channels.filter((c) => c.type === "voice");

  const filtered = searchQuery.trim()
    ? textChannels.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : textChannels;

  const filteredVoice = searchQuery.trim()
    ? voiceChannels.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : voiceChannels;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex h-full w-60 flex-col border-r border-border/40 bg-sidebar",
          // Mobile: overlay slide-in from left edge (TeamsRail is hidden)
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:left-0 md:z-auto md:translate-x-0",
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Team header */}
        <div className="flex h-12 items-center justify-between border-b border-border/40 px-3">
          {/* Mobile: dropdown team switcher | Desktop: static name */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 truncate text-sm font-semibold hover:text-foreground/80 md:pointer-events-none">
                {activeTeam?.name || "Workspace"}
                <ChevronDown className="size-3 text-muted-foreground md:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 md:hidden">
              {teams.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setActiveTeam(t.id)}
                  className={cn(
                    t.id === activeTeamId && "bg-accent font-medium",
                  )}
                >
                  <span className="mr-2 flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                    {t.name.charAt(0)}
                  </span>
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>

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

        <ScrollArea className="flex-1">
          <div className="px-2 pb-4">
            {/* Text Channels */}
            <ChannelSection
              title="Channels"
              isOpen={textOpen}
              onToggle={() => setTextOpen(!textOpen)}
            >
              {filtered.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannelId === channel.id}
                  onClick={() => {
                    setActiveChannel(channel.id);
                    setMobileSidebarOpen(false);
                  }}
                />
              ))}
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
                    onClick={() => {
                      setActiveChannel(channel.id);
                      setMobileSidebarOpen(false);
                    }}
                    isVoice
                  />
                ))}
              </ChannelSection>
            )}

            <Separator className="my-2" />

            {/* Direct Messages */}
            <ChannelSection
              title="Direct Messages"
              isOpen={dmOpen}
              onToggle={() => setDmOpen(!dmOpen)}
            >
              {directMessages.map((dm) => {
                const other = dm.participants.find(
                  (p) => p.userId !== "u-self",
                );
                if (!other) return null;
                return (
                  <button
                    key={dm.id}
                    onClick={() => {
                      setActiveDm(dm.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      activeDmId === dm.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    {/* Status dot */}
                    <span className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                      {other.displayName.charAt(0)}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-sidebar",
                          other.status === "online" && "bg-emerald-500",
                          other.status === "idle" && "bg-yellow-500",
                          other.status === "dnd" && "bg-red-500",
                          other.status === "offline" && "bg-gray-400",
                        )}
                      />
                    </span>
                    <span className="truncate text-xs">
                      {other.displayName}
                    </span>
                    {dm.unreadCount > 0 && (
                      <span className="ml-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {dm.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </ChannelSection>
          </div>
        </ScrollArea>
      </aside>

      {/* Team settings dialog */}
      <TeamSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Section with collapsible header
// ---------------------------------------------------------------------------

function ChannelSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
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
        <Button variant="ghost" size="icon" className="size-5">
          <Plus className="size-3" />
        </Button>
      </div>
      <CollapsibleContent className="space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Channel item
// ---------------------------------------------------------------------------

function ChannelItem({
  channel,
  isActive,
  onClick,
  isVoice,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  isVoice?: boolean;
}) {
  const Icon = isVoice
    ? Volume2
    : channel.type === "announcement"
      ? Bell
      : channel.visibility === "private"
        ? Lock
        : Hash;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate text-xs">{channel.name}</span>
      {channel.unreadCount > 0 && (
        <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}
