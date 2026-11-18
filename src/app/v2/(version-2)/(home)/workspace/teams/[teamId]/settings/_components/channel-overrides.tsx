"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Slash, X, Plus, Users, AtSign, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { workspaceApi, apiErrorMessage } from "../../../../_lib/api";
import { useAccessStore } from "../../../../_lib/access-store";
import { useChatStore } from "../../../../_lib/chat-store";
import { PERMISSION_METADATA } from "../../../../_lib/permissions";
import { memberPosition } from "../../../../_lib/use-access";
import { confirmAction } from "../../../../_components/ConfirmHost";
import type { Channel, ChannelOverwrite, OverwriteTargetType, PermissionKey } from "../../../../_lib/chat-types";
import type { TeamSettings } from "./use-team-settings";
import { LoadingBlock, LockedHint, MemberAvatar, Notice, RoleDot, SaveBar } from "./settings-ui";

type Tri = "allow" | "inherit" | "deny";

const TEAM_ONLY: PermissionKey[] = ["create_channels", "manage_members", "timeout_members", "manage_roles", "view_audit_logs"];
const CATEGORY_LABEL: Record<string, string> = { text: "Text", voice: "Voice & calls", management: "Moderation" };

interface Target {
  type: OverwriteTargetType;
  id: string;
}
const keyOf = (t: Target) => `${t.type}:${t.id.toLowerCase()}`;

// ── Tri-state control ──

function TriState({
  value,
  onChange,
  disabled,
  label,
}: {
  value: Tri;
  onChange: (v: Tri) => void;
  disabled?: boolean;
  label: string;
}) {
  const opts: { v: Tri; icon: React.ElementType; title: string; active: string }[] = [
    { v: "deny", icon: X, title: "Deny", active: "bg-red-500 text-white" },
    { v: "inherit", icon: Slash, title: "Inherit from role", active: "bg-muted-foreground/30 text-foreground" },
    { v: "allow", icon: Check, title: "Allow", active: "bg-emerald-500 text-white" },
  ];
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 overflow-hidden rounded-md border border-border/60">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          aria-label={`${o.title}: ${label}`}
          title={o.title}
          disabled={disabled}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex size-7 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            value === o.v ? o.active : "text-muted-foreground hover:bg-accent",
          )}
        >
          <o.icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

// ── Editor ──

export function ChannelOverridesEditor({ channel, s }: { channel: Channel; s: TeamSettings }) {
  const overwrites = useAccessStore((st) => st.overwrites[channel.id]);
  const fetchOverwrites = useAccessStore((st) => st.fetchOverwrites);
  const [selected, setSelected] = useState<Target>({ type: "everyone", id: s.teamId });
  const [draft, setDraft] = useState<Record<string, Tri>>({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverwrites(channel.id).catch((err) => setLoadError(apiErrorMessage(err, "Could not load overrides")));
  }, [channel.id, fetchOverwrites]);

  const channelPerms = useMemo<PermissionKey[]>(() => {
    const fromCatalog = s.catalog?.permissions.filter((p) => p.scope === "channel").map((p) => p.key);
    return fromCatalog?.length
      ? fromCatalog
      : (Object.keys(PERMISSION_METADATA) as PermissionKey[]).filter((k) => !TEAM_ONLY.includes(k));
  }, [s.catalog]);

  const current = (overwrites ?? []).find((o) => keyOf({ type: o.targetType, id: o.targetId }) === keyOf(selected));
  const saved = useMemo(() => {
    const m: Record<string, Tri> = {};
    for (const k of channelPerms) m[k] = current?.allow.includes(k) ? "allow" : current?.deny.includes(k) ? "deny" : "inherit";
    return m;
  }, [current, channelPerms]);

  // Reset the draft whenever the target or its saved state changes.
  useEffect(() => setDraft(saved), [saved]);
  const dirty = channelPerms.some((k) => (draft[k] ?? "inherit") !== saved[k]);

  // Who may be edited (server enforces the same rules).
  const roleById = (id: string) => s.roles.find((r) => r.id === id);
  const memberByEmail = (email: string) => s.members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  const targetEditable = (t: Target): boolean => {
    if (!s.can("manage_roles")) return false;
    if (t.type === "everyone") return true;
    if (t.type === "role") {
      const r = roleById(t.id);
      return !!r && r.systemKey !== "owner" && s.outranks(r.position);
    }
    const m = memberByEmail(t.id);
    if (!m || s.isOwnerMember(m)) return false;
    return m.email.toLowerCase() === s.currentUserId.toLowerCase() || s.outranks(memberPosition(m, s.team?.ownerId));
  };
  const editable = targetEditable(selected);
  // Non-administrators may only allow or deny what they hold in this channel.
  const mayChange = (k: PermissionKey) => s.isAdmin || channel.myPermissions?.[k] === true;

  const targetLabel = (t: Target, o?: ChannelOverwrite) => {
    if (t.type === "everyone") return "@everyone";
    if (t.type === "role") return roleById(t.id)?.name ?? o?.targetName ?? "Deleted role";
    const m = memberByEmail(t.id);
    return m?.displayName || t.id;
  };

  const targets: Target[] = [
    { type: "everyone", id: s.teamId },
    ...(overwrites ?? [])
      .filter((o) => o.targetType !== "everyone")
      .map((o) => ({ type: o.targetType, id: o.targetId }))
      .sort((a, b) => (a.type === b.type ? 0 : a.type === "role" ? -1 : 1)),
  ];
  if (!targets.some((t) => keyOf(t) === keyOf(selected))) targets.push(selected); // newly added, not saved yet

  const select = async (t: Target) => {
    if (keyOf(t) === keyOf(selected)) return;
    if (dirty && !(await confirmAction({ title: "Discard unsaved changes?", confirmLabel: "Discard", destructive: true }))) return;
    setSelected(t);
  };

  const refreshMine = () => {
    const chat = useChatStore.getState();
    void chat.fetchChannels(channel.teamId, chat.currentUserId);
  };

  const save = async () => {
    setSaving(true);
    try {
      const allow = channelPerms.filter((k) => draft[k] === "allow");
      const deny = channelPerms.filter((k) => draft[k] === "deny");
      await workspaceApi.setOverwrite(channel.id, { target_type: selected.type, target_id: selected.id, allow, deny });
      await fetchOverwrites(channel.id);
      refreshMine();
      toast.success(`Saved overrides for ${targetLabel(selected, current)}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save the overrides"));
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async () => {
    const label = targetLabel(selected, current);
    if (!(await confirmAction({ title: `Remove the override for ${label}?`, description: "They go back to their role's permissions in this channel.", confirmLabel: "Remove", destructive: true }))) return;
    try {
      if (current) await workspaceApi.deleteOverwrite(channel.id, selected.type, selected.id);
      await fetchOverwrites(channel.id);
      refreshMine();
      setSelected({ type: "everyone", id: s.teamId });
      toast.success(`Removed the override for ${label}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not remove the override"));
    }
  };

  if (loadError) return <Notice tone="warning">{loadError}</Notice>;
  if (!overwrites) return <LoadingBlock />;

  const existing = new Set(targets.map(keyOf));
  const addableRoles = s.manageableRoles.filter((r) => !existing.has(keyOf({ type: "role", id: r.id })));
  const addableMembers = s.members.filter(
    (m) => !existing.has(keyOf({ type: "user", id: m.email })) && targetEditable({ type: "user", id: m.email }),
  );

  const grouped = channelPerms.reduce<Record<string, PermissionKey[]>>((acc, k) => {
    (acc[PERMISSION_METADATA[k]?.category ?? "text"] ??= []).push(k);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {channel.visibility === "private" && (
        <Notice>
          <span className="inline-flex items-center gap-1 font-medium"><EyeOff className="size-3" /> Private channel.</span>{" "}
          Only roles and members with <strong>View Channel</strong> allowed below can see it (administrators always can).
        </Notice>
      )}

      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        {/* Targets */}
        <div className="space-y-1">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Roles / Members</p>
            {s.can("manage_roles") && (addableRoles.length > 0 || addableMembers.length > 0) && (
              <AddTarget
                roles={addableRoles}
                members={addableMembers}
                onPick={(t) => void select(t)}
              />
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {targets.map((t) => {
              const o = (overwrites ?? []).find((x) => keyOf({ type: x.targetType, id: x.targetId }) === keyOf(t));
              const active = keyOf(t) === keyOf(selected);
              const role = t.type === "role" ? roleById(t.id) : undefined;
              const member = t.type === "user" ? memberByEmail(t.id) : undefined;
              return (
                <button
                  key={keyOf(t)}
                  type="button"
                  onClick={() => void select(t)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                    active ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  {t.type === "everyone" ? (
                    <AtSign className="size-3.5 shrink-0" />
                  ) : t.type === "role" ? (
                    <RoleDot color={role?.color} />
                  ) : member ? (
                    <MemberAvatar member={member} size="sm" />
                  ) : (
                    <Users className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">{targetLabel(t, o)}</span>
                  {o && (o.allow.length > 0 || o.deny.length > 0) && (
                    <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                      {o.allow.length > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{o.allow.length}</span>}
                      {o.allow.length > 0 && o.deny.length > 0 && " "}
                      {o.deny.length > 0 && <span className="text-red-500">−{o.deny.length}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions for the selected target */}
        <div className="min-w-0 rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{targetLabel(selected, current)}</p>
              <p className="text-[11px] text-muted-foreground">
                {selected.type === "everyone"
                  ? "Applies to every member, unless a role or member override says otherwise."
                  : selected.type === "role"
                    ? "Overrides @everyone for members with this role."
                    : "Overrides everything else for this member."}
              </p>
            </div>
            {selected.type !== "everyone" && editable && (
              <Button variant="ghost" size="sm" className="shrink-0 text-destructive hover:text-destructive" onClick={removeOverride}>
                <Trash2 className="mr-1 size-3.5" /> Remove
              </Button>
            )}
          </div>
          {!editable && (
            <div className="px-4 pt-3">
              <LockedHint>
                {s.can("manage_roles") ? "You can only edit overrides for roles and members ranked below you." : "Viewing only — you need Manage Roles to edit overrides."}
              </LockedHint>
            </div>
          )}
          <div className="space-y-4 p-4">
            {Object.entries(grouped).map(([cat, keys]) => (
              <div key={cat}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABEL[cat] ?? cat}
                </p>
                <div className="divide-y divide-border/40">
                  {keys.map((k) => {
                    const meta = PERMISSION_METADATA[k];
                    const can = mayChange(k);
                    return (
                      <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm">{meta?.name ?? k}</p>
                          <p className="text-[11px] text-muted-foreground">{meta?.description}</p>
                        </div>
                        <TriState
                          label={meta?.name ?? k}
                          value={draft[k] ?? "inherit"}
                          disabled={!editable || !can}
                          onChange={(v) => setDraft((d) => ({ ...d, [k]: v }))}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SaveBar visible={editable && dirty} saving={saving} onReset={() => setDraft(saved)} onSave={save} />
    </div>
  );
}

function AddTarget({
  roles,
  members,
  onPick,
}: {
  roles: { id: string; name: string; color?: string }[];
  members: { email: string; displayName: string; avatar?: string }[];
  onPick: (t: Target) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6" aria-label="Add a role or member override">
          <Plus className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Add a role or member" />
          <CommandList>
            <CommandEmpty>Nothing to add.</CommandEmpty>
            {roles.length > 0 && (
              <CommandGroup heading="Roles">
                {roles.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={`role ${r.name}`}
                    onSelect={() => {
                      setOpen(false);
                      onPick({ type: "role", id: r.id });
                    }}
                    className="gap-2"
                  >
                    <RoleDot color={r.color} />
                    <span className="truncate">{r.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {members.length > 0 && (
              <CommandGroup heading="Members">
                {members.map((m) => (
                  <CommandItem
                    key={m.email}
                    value={`member ${m.displayName} ${m.email}`}
                    onSelect={() => {
                      setOpen(false);
                      onPick({ type: "user", id: m.email });
                    }}
                    className="gap-2"
                  >
                    <MemberAvatar member={m} size="sm" />
                    <span className="truncate">{m.displayName || m.email}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
