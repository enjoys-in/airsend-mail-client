"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Settings2,
  Users,
  Shield,
  Hash,
  Webhook,
  DoorOpen,
  Crown,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useChatStore } from "../../../_lib/chat-store";
import { useAccessStore } from "../../../_lib/access-store";
import { settingsPath, isTimedOut } from "../../../_lib/use-access";
import { formatUntil } from "../../../_lib/member-actions";
import { useTeamSettings } from "./_components/use-team-settings";
import { LoadingBlock, RolePill, roleLabel } from "./_components/settings-ui";

// ---------------------------------------------------------------------------
// Team settings shell — routed pages (/v2/workspace/teams/:teamId/settings/*)
// instead of a modal, so every section is linkable, survives reloads and
// works with the browser's back button.
// ---------------------------------------------------------------------------

export default function TeamSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const s = useTeamSettings();
  const activeTeamId = useChatStore((st) => st.activeTeamId);
  const isLoadingTeams = useChatStore((st) => st.isLoadingTeams);
  const setActiveTeam = useChatStore((st) => st.setActiveTeam);
  const accessError = useAccessStore((st) => st.accessError[s.teamId]);
  const fetchAccess = useAccessStore((st) => st.fetchAccess);

  // Opening settings for a team makes it the active one, so members and
  // channels for it are loaded by WorkspaceInit.
  useEffect(() => {
    if (s.team && activeTeamId !== s.teamId) setActiveTeam(s.teamId);
  }, [s.team, s.teamId, activeTeamId, setActiveTeam]);

  if (!s.team) {
    return isLoadingTeams ? (
      <LoadingBlock />
    ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium">Team not found</p>
        <p className="text-xs text-muted-foreground">It may have been deleted, or you are no longer a member.</p>
        <Link href="/v2/workspace" className="mt-2 text-xs font-medium text-primary hover:underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  const base = settingsPath.team(s.teamId);
  const canSeeChannels = s.can("manage_channel") || s.can("manage_roles") || s.isAdmin;
  const nav = [
    { href: base, label: "Overview", icon: Settings2, show: true, exact: true },
    { href: `${base}/members`, label: "Members", icon: Users, show: true, count: s.members.length },
    { href: `${base}/roles`, label: "Roles", icon: Shield, show: true, count: s.roles.length || undefined },
    { href: `${base}/channels`, label: "Channels & Permissions", icon: Hash, show: canSeeChannels },
    { href: `${base}/integrations`, label: "Integrations", icon: Webhook, show: s.can("manage_integrations") },
    { href: `${base}/danger`, label: s.isOwner ? "Delete Team" : "Leave Team", icon: DoorOpen, show: true, danger: true },
  ].filter((n) => n.show);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const myRole = s.access ? s.roles.find((r) => r.id === s.access!.roleId) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* ── Section nav ── */}
      <aside className="shrink-0 border-b border-border/40 bg-muted/20 md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-3 pt-3 md:px-4 md:pt-4">
          <Link
            href="/v2/workspace"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Back to workspace"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            {(s.team.name || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{s.team.name}</p>
            <p className="text-[11px] text-muted-foreground">Team settings</p>
          </div>
        </div>

        {s.access && (
          <div className="hidden px-4 pt-3 md:block">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Your role</span>
              {s.isOwner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                  <Crown className="size-3" /> Owner
                </span>
              ) : (
                <RolePill name={myRole?.name ?? roleLabel(s.access.role)} color={myRole?.color} />
              )}
            </div>
            {isTimedOut(s.access.timedOutUntil) && (
              <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                <Clock className="size-3" /> Timed out · {formatUntil(s.access.timedOutUntil)} left
              </p>
            )}
          </div>
        )}

        <nav
          aria-label="Team settings sections"
          className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:gap-0.5 md:overflow-visible md:px-2 md:py-4"
        >
          {nav.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  item.danger && !active && "text-destructive/80 hover:text-destructive",
                  item.danger && "md:mt-3",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="ml-auto hidden text-[11px] tabular-nums text-muted-foreground md:inline">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Section content ── */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8">
          {s.access ? (
            children
          ) : accessError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">{accessError}</p>
              <Button variant="outline" size="sm" onClick={() => void fetchAccess(s.teamId, true)}>
                Try again
              </Button>
            </div>
          ) : (
            <LoadingBlock />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
