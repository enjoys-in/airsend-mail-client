"use client";

import React, { useEffect, useState } from "react";
import { Users, Hash, Shield } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "../../../_lib/chat-store";
import { workspaceApi, apiErrorMessage, toTeam } from "../../../_lib/api";
import { PERMISSION_METADATA } from "../../../_lib/permissions";
import type { PermissionKey } from "../../../_lib/chat-types";
import { useTeamSettings } from "./_components/use-team-settings";
import { SettingsCard, SettingsHeader, Notice, SaveBar } from "./_components/settings-ui";
import { LocalDataCard } from "./_components/local-data-card";

const CATEGORY_LABEL: Record<string, string> = {
  text: "Text",
  voice: "Voice & calls",
  management: "Management",
};

export default function TeamOverviewPage() {
  const s = useTeamSettings();
  const team = s.team!;
  const canEdit = s.isAdmin; // the server requires administrator to edit the team

  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? "");
  const [saving, setSaving] = useState(false);

  // Follow live updates while nothing is being edited.
  const dirty = name.trim() !== team.name || description.trim() !== (team.description ?? "");
  useEffect(() => {
    if (!dirty) {
      setName(team.name);
      setDescription(team.description ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.name, team.description]);

  const save = async () => {
    if (!name.trim()) {
      toast.error("The team needs a name");
      return;
    }
    setSaving(true);
    try {
      const saved = toTeam(
        await workspaceApi.updateTeam(s.teamId, { name: name.trim(), description: description.trim() }, s.currentUserId),
      );
      useChatStore.setState((st) => ({ teams: st.teams.map((t) => (t.id === saved.id ? saved : t)) }));
      toast.success("Team updated");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update the team"));
    } finally {
      setSaving(false);
    }
  };

  const granted = new Set<PermissionKey>(
    s.isAdmin ? (Object.keys(PERMISSION_METADATA) as PermissionKey[]) : (s.access?.permissions ?? []),
  );
  const byCategory = (Object.keys(PERMISSION_METADATA) as PermissionKey[]).reduce<Record<string, PermissionKey[]>>(
    (acc, key) => {
      (acc[PERMISSION_METADATA[key].category] ??= []).push(key);
      return acc;
    },
    {},
  );

  return (
    <>
      <SettingsHeader title="Overview" description="Your team's profile and what you can do in it." />

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Members", value: s.members.length, icon: Users },
          { label: "Channels", value: s.channels.length, icon: Hash },
          { label: "Roles", value: s.roles.length || "—", icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <stat.icon className="size-3.5" />
              {stat.label}
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <SettingsCard
          title="Team profile"
          description={canEdit ? "Visible to every member." : "Only administrators can change the team profile."}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Name</Label>
              <Input
                id="team-name"
                value={name}
                maxLength={100}
                disabled={!canEdit}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={description}
                rows={3}
                maxLength={500}
                disabled={!canEdit}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this team for?"
                className="resize-none"
              />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Your permissions"
          description={
            s.isAdmin
              ? "You are an administrator: you hold every permission and bypass channel overrides."
              : "Team-wide permissions from your role. Channel overrides can still allow or deny them per channel."
          }
        >
          <div className="space-y-4">
            {Object.entries(byCategory).map(([category, keys]) => (
              <div key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABEL[category] ?? category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {keys.map((key) => {
                    const has = granted.has(key);
                    return (
                      <span
                        key={key}
                        title={PERMISSION_METADATA[key].description}
                        className={
                          has
                            ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300"
                            : "rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground/70 line-through decoration-muted-foreground/40"
                        }
                      >
                        {PERMISSION_METADATA[key].name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>

        <LocalDataCard />

        {!s.customRoles && (
          <Notice>
            Custom roles and per-channel overrides are not enabled on this workspace server yet
            (it runs in <code className="font-mono">{s.access?.mode}</code> mode). Members use the five built-in
            roles until an operator switches to <code className="font-mono">AUTHZ_MODE=enforce</code>.
          </Notice>
        )}
      </div>

      <SaveBar
        visible={canEdit && dirty}
        saving={saving}
        onReset={() => {
          setName(team.name);
          setDescription(team.description ?? "");
        }}
        onSave={save}
      />
    </>
  );
}
