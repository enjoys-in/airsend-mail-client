"use client";

import React from "react";
import Link from "next/link";
import { Hash, Volume2, Megaphone, Lock, EyeOff, ChevronRight, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "../../../../_lib/chat-store";
import { getUserRoleInTeam, resolveChannelPermission } from "../../../../_lib/permissions";
import { settingsPath } from "../../../../_lib/use-access";
import type { Channel } from "../../../../_lib/chat-types";
import { useTeamSettings } from "../_components/use-team-settings";
import { NoPermission, SettingsHeader } from "../_components/settings-ui";

const GROUPS: { id: string; label: string; match: (c: Channel) => boolean }[] = [
  { id: "text", label: "Text & announcement", match: (c) => c.type !== "voice" },
  { id: "voice", label: "Voice", match: (c) => c.type === "voice" },
];

function ChannelIcon({ channel }: { channel: Channel }) {
  const Icon = channel.type === "voice" ? Volume2 : channel.type === "announcement" ? Megaphone : Hash;
  return <Icon className="size-4 shrink-0 text-muted-foreground" />;
}

export default function ChannelsSettingsPage() {
  const s = useTeamSettings();
  const members = useChatStore((st) => st.members);
  const role = getUserRoleInTeam(members, s.teamId, s.currentUserId);
  const canOverrides = s.can("manage_roles");

  const manageable = s.channels.filter(
    (c) => canOverrides || resolveChannelPermission(c, role, "manage_channel", s.access),
  );

  if (manageable.length === 0) {
    return (
      <>
        <SettingsHeader title="Channels & Permissions" />
        <NoPermission what="manage any channel in this team" />
      </>
    );
  }

  return (
    <>
      <SettingsHeader
        title="Channels & Permissions"
        description={
          canOverrides
            ? "Edit a channel's details, or override what @everyone, a role or a member can do in it."
            : "Channels you can manage."
        }
      />

      <div className="space-y-5">
        {GROUPS.map((g) => {
          const list = manageable.filter(g.match).sort((a, b) => a.name.localeCompare(b.name));
          if (list.length === 0) return null;
          return (
            <div key={g.id}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
              <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card">
                {list.map((c) => (
                  <Link
                    key={c.id}
                    href={settingsPath.channel(s.teamId, c.id)}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                  >
                    <ChannelIcon channel={c} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      {c.topic && <p className="truncate text-xs text-muted-foreground">{c.topic}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {c.visibility === "private" && (
                        <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
                          <EyeOff className="size-3" /> Private
                        </Badge>
                      )}
                      {c.isLocked && (
                        <Badge variant="outline" className="h-5 gap-1 border-amber-500/40 px-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                          <Lock className="size-3" /> Locked
                        </Badge>
                      )}
                      {c.isArchived && (
                        <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
                          <Archive className="size-3" /> Archived
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
