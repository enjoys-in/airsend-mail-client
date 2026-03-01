"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  ArrowLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
import { useChatStore } from "../_lib/chat-store";
import type { Channel } from "../_lib/chat-types";
import TeamSettingsDialog from "./TeamSettingsDialog";

// ==========================================================================
// MobileWorkspaceSidebar — sheet-based sidebar for mobile workspace
// ==========================================================================

interface MobileWorkspaceSidebarProps {
  trigger?: React.ReactNode;
}

export default function MobileWorkspaceSidebar({
  trigger,
}: MobileWorkspaceSidebarProps) {
  const pathname = usePathname();
  const {
    teams,
    activeTeamId,
    directMessages,
    setActiveTeam,
    getTeamChannels,
  } = useChatStore();

  const channelMatch = pathname.match(/\/workspace\/c\/([^/]+)/);
  const dmMatch = pathname.match(/\/workspace\/dm\/([^/]+)/);
  const activeChannelId = channelMatch?.[1] ?? null;
  const activeDmId = dmMatch?.[1] ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [textOpen, setTextOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [dmOpen, setDmOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="size-8 md:hidden">
              <Menu className="size-4" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] p-0 flex flex-col"
        >
          <SheetHeader className="border-b p-0">
            <SheetTitle className="sr-only">Workspace</SheetTitle>
            {/* Team switcher */}
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
                      {t.name.charAt(0)}
                    </span>
                    {t.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
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
                  className="h-8 pl-7 text-xs"
                />
              </div>
            </div>
          </SheetHeader>

          {/* Channel list */}
          <ScrollArea className="flex-1">
            <div className="px-2 pb-4">
              {/* Text / Announcement Channels */}
              <MobileChannelSection
                title="Channels"
                isOpen={textOpen}
                onToggle={() => setTextOpen(!textOpen)}
              >
                {filtered.map((channel) => (
                  <MobileChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannelId === channel.id}
                    href={`/v2/workspace/c/${channel.id}`}
                    onNavigate={() => setSheetOpen(false)}
                  />
                ))}
              </MobileChannelSection>

              {/* Voice Channels */}
              {filteredVoice.length > 0 && (
                <MobileChannelSection
                  title="Voice Channels"
                  isOpen={voiceOpen}
                  onToggle={() => setVoiceOpen(!voiceOpen)}
                >
                  {filteredVoice.map((channel) => (
                    <MobileChannelItem
                      key={channel.id}
                      channel={channel}
                      isActive={activeChannelId === channel.id}
                      href={`/v2/workspace/c/${channel.id}`}
                      isVoice
                      onNavigate={() => setSheetOpen(false)}
                    />
                  ))}
                </MobileChannelSection>
              )}

              <div className="mx-2 my-1">
                <Separator className="bg-border/30" />
              </div>

              {/* Direct Messages */}
              <MobileChannelSection
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
                    <Link
                      key={dm.id}
                      href={`/v2/workspace/dm/${dm.id}`}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                        activeDmId === dm.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
                        {other.displayName.charAt(0)}
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
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
                        <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {dm.unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </MobileChannelSection>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border/40 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => {
                setSheetOpen(false);
                setSettingsOpen(true);
              }}
            >
              <Settings className="size-3.5" />
              Team Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <TeamSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

// ==========================================================================
// Mobile channel section (collapsible)
// ==========================================================================

function MobileChannelSection({
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
        <Button variant="ghost" size="icon" className="size-6">
          <Plus className="size-3" />
        </Button>
      </div>
      <CollapsibleContent className="space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ==========================================================================
// Mobile channel item
// ==========================================================================

function MobileChannelItem({
  channel,
  isActive,
  href,
  isVoice,
  onNavigate,
}: {
  channel: Channel;
  isActive: boolean;
  href: string;
  isVoice?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = isVoice
    ? Volume2
    : channel.type === "announcement"
      ? Bell
      : channel.visibility === "private"
        ? Lock
        : Hash;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate text-xs">{channel.name}</span>
      {channel.unreadCount > 0 && (
        <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {channel.unreadCount}
        </span>
      )}
    </Link>
  );
}
