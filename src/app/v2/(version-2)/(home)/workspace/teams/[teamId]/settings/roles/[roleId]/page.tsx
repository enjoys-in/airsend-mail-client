"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, ShieldAlert, Trash2, UserPlus, X, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { workspaceApi, apiErrorMessage, toRole } from "../../../../../_lib/api";
import { useAccessStore } from "../../../../../_lib/access-store";
import { PERMISSION_METADATA } from "../../../../../_lib/permissions";
import { settingsPath, memberPosition } from "../../../../../_lib/use-access";
import { assignRole } from "../../../../../_lib/member-actions";
import { confirmAction } from "../../../../../_components/ConfirmHost";
import type { PermissionKey, Role } from "../../../../../_lib/chat-types";
import { useTeamSettings } from "../../_components/use-team-settings";
import {
  LoadingBlock,
  LockedHint,
  MemberAvatar,
  Notice,
  RoleDot,
  SaveBar,
  SettingsCard,
} from "../../_components/settings-ui";

const COLORS = ["#99aab5", "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e91e63", "#f1c40f", "#e67e22", "#e74c3c", "#607d8b"];
const OWNER_ROLE_POSITION = 100;
const CATEGORIES: { id: string; label: string }[] = [
  { id: "text", label: "Text channels" },
  { id: "voice", label: "Voice & calls" },
  { id: "management", label: "Management" },
];

interface Draft {
  name: string;
  color: string;
  position: number;
  administrator: boolean;
  permissions: PermissionKey[];
}

const draftOf = (r: Role): Draft => ({
  name: r.name,
  color: r.color ?? "",
  position: r.position,
  administrator: r.administrator,
  permissions: [...r.permissions].sort(),
});

const sameDraft = (a: Draft, b: Draft) =>
  a.name === b.name &&
  a.color === b.color &&
  a.position === b.position &&
  a.administrator === b.administrator &&
  a.permissions.join() === b.permissions.join();

export default function RoleEditorPage() {
  const s = useTeamSettings();
  const router = useRouter();
  const { roleId } = useParams<{ roleId: string }>();
  const role = s.roles.find((r) => r.id === roleId);

  const [draft, setDraft] = useState<Draft | null>(role ? draftOf(role) : null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  // Adopt server changes (e.g. someone else edited the role) when not editing.
  const original = role ? draftOf(role) : null;
  const dirty = !!draft && !!original && !sameDraft(draft, original);
  useEffect(() => {
    if (role && (!draft || !dirty)) setDraft(draftOf(role));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const roleMembers = useMemo(
    () => (role ? s.members.filter((m) => (m.roleId ? m.roleId === role.id : role.systemKey === m.role)) : []),
    [s.members, role],
  );

  if (!s.rolesLoaded) return <LoadingBlock />;
  if (!role || !draft || !original) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">This role no longer exists.</p>
        <Link href={settingsPath.team(s.teamId, "roles")} className="mt-2 inline-block text-xs text-primary hover:underline">
          Back to roles
        </Link>
      </div>
    );
  }

  const isOwnerRole = role.systemKey === "owner";
  const editable = s.customRoles && s.can("manage_roles") && !isOwnerRole && s.outranks(role.position);
  const maxPosition = s.isOwner ? OWNER_ROLE_POSITION - 1 : Math.min(OWNER_ROLE_POSITION - 1, (s.access?.position ?? 1) - 1);
  // No escalation: non-administrators only grant what they hold themselves.
  const mayGrant = (key: PermissionKey) => s.isAdmin || !!s.access?.permissions.includes(key);

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const toggle = (key: PermissionKey, on: boolean) =>
    set({
      permissions: on
        ? [...new Set([...draft.permissions, key])].sort()
        : draft.permissions.filter((k) => k !== key),
    });

  const save = async () => {
    if (!draft.name.trim()) {
      toast.error("The role needs a name");
      return;
    }
    setSaving(true);
    try {
      const body: Parameters<typeof workspaceApi.updateRole>[2] = {};
      if (draft.name.trim() !== original.name) body.name = draft.name.trim();
      if (draft.color !== original.color) body.color = draft.color;
      if (draft.position !== original.position) body.position = draft.position;
      if (draft.administrator !== original.administrator) body.administrator = draft.administrator;
      if (draft.permissions.join() !== original.permissions.join()) body.permissions = draft.permissions;
      const saved = toRole(await workspaceApi.updateRole(s.teamId, role.id, body));
      useAccessStore.setState((st) => ({
        roles: { ...st.roles, [s.teamId]: (st.roles[s.teamId] ?? []).map((r) => (r.id === saved.id ? saved : r)) },
      }));
      setDraft(draftOf(saved));
      void useAccessStore.getState().fetchRoles(s.teamId, true); // positions may have shifted
      toast.success("Role saved");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save the role"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await confirmAction({
      title: `Delete the ${role.name} role?`,
      description: `${role.memberCount} member${role.memberCount === 1 ? "" : "s"} will fall back to the Member role, and its channel overrides are removed.`,
      confirmLabel: "Delete role",
      destructive: true,
    });
    if (!ok) return;
    try {
      await workspaceApi.deleteRole(s.teamId, role.id);
      await useAccessStore.getState().fetchRoles(s.teamId, true);
      router.push(settingsPath.team(s.teamId, "roles"));
      toast.success("Role deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete the role"));
    }
  };

  const memberRole = s.roles.find((r) => r.systemKey === "member");
  const candidates = s.members.filter(
    (m) =>
      !roleMembers.includes(m) &&
      !s.isOwnerMember(m) &&
      m.email.toLowerCase() !== s.currentUserId.toLowerCase() &&
      s.outranks(memberPosition(m, s.team?.ownerId)),
  );

  const q = filter.trim().toLowerCase();

  return (
    <>
      <Link
        href={settingsPath.team(s.teamId, "roles")}
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Roles
      </Link>
      <div className="mb-5 flex items-center gap-2.5">
        <RoleDot color={draft.color} className="size-3.5" />
        <h1 className="truncate text-lg font-semibold">{draft.name || "Unnamed role"}</h1>
        {isOwnerRole && <Crown className="size-4 text-amber-500" />}
        {!editable && <LockedHint>View only</LockedHint>}
      </div>

      {!s.customRoles && (
        <div className="mb-4">
          <Notice>Roles can be edited once custom roles are enabled on the workspace server.</Notice>
        </div>
      )}
      {s.customRoles && !isOwnerRole && !editable && (
        <div className="mb-4">
          <Notice>You can only edit roles ranked below your own, and need the Manage Roles permission.</Notice>
        </div>
      )}

      <Tabs defaultValue="permissions">
        <TabsList className="mb-4">
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="members">Members ({roleMembers.length})</TabsTrigger>
        </TabsList>

        {/* ── Display ── */}
        <TabsContent value="display" className="space-y-4">
          <SettingsCard title="Name & color">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role-name">Role name</Label>
                <Input
                  id="role-name"
                  value={draft.name}
                  maxLength={50}
                  disabled={!editable}
                  onChange={(e) => set({ name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={!editable}
                      aria-label={`Color ${c}`}
                      aria-pressed={draft.color === c}
                      onClick={() => set({ color: c })}
                      className={cn(
                        "size-7 rounded-md border-2 transition-transform disabled:cursor-not-allowed disabled:opacity-60",
                        draft.color === c ? "scale-110 border-foreground" : "border-transparent hover:scale-105",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    aria-label="Custom color"
                    disabled={!editable}
                    value={draft.color || "#99aab5"}
                    onChange={(e) => set({ color: e.target.value })}
                    className="size-7 cursor-pointer rounded-md border border-border bg-transparent disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Rank"
            description={`Higher ranks manage lower ones. You can place roles between 1 and ${maxPosition}.`}
          >
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={maxPosition}
                value={draft.position}
                disabled={!editable || !!role.systemKey}
                onChange={(e) => set({ position: Math.max(1, Math.min(maxPosition, Number(e.target.value) || 1)) })}
                className="w-28"
                aria-label="Role rank"
              />
              {role.systemKey && <LockedHint>Built-in roles keep their rank</LockedHint>}
            </div>
          </SettingsCard>

          {editable && !role.systemKey && (
            <SettingsCard danger title="Delete role" description="Members with this role fall back to Member.">
              <Button variant="destructive" size="sm" onClick={remove}>
                <Trash2 className="mr-1.5 size-4" /> Delete role
              </Button>
            </SettingsCard>
          )}
        </TabsContent>

        {/* ── Permissions ── */}
        <TabsContent value="permissions" className="space-y-4">
          <SettingsCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <ShieldAlert className="size-4 text-amber-500" /> Administrator
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Every permission, and channel overrides no longer apply. Only the team owner can grant this.
                </p>
              </div>
              <Switch
                checked={draft.administrator}
                disabled={!editable || !s.isOwner}
                onCheckedChange={(v) => set({ administrator: v })}
                aria-label="Administrator"
              />
            </div>
          </SettingsCard>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search permissions"
              className="h-9 pl-8"
              aria-label="Search permissions"
            />
          </div>

          {CATEGORIES.map((cat) => {
            const keys = (Object.keys(PERMISSION_METADATA) as PermissionKey[]).filter(
              (k) =>
                PERMISSION_METADATA[k].category === cat.id &&
                (!q || `${PERMISSION_METADATA[k].name} ${PERMISSION_METADATA[k].description}`.toLowerCase().includes(q)),
            );
            if (keys.length === 0) return null;
            return (
              <SettingsCard key={cat.id} title={cat.label}>
                <div className="divide-y divide-border/40">
                  {keys.map((key) => {
                    const meta = PERMISSION_METADATA[key];
                    const on = draft.administrator || draft.permissions.includes(key);
                    const grantable = mayGrant(key);
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0",
                          editable && grantable && !draft.administrator && "cursor-pointer",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{meta.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
                          {editable && !grantable && (
                            <p className="mt-1">
                              <LockedHint>You don&apos;t have this permission, so you can&apos;t grant it</LockedHint>
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={on}
                          disabled={!editable || draft.administrator || !grantable}
                          onCheckedChange={(v) => toggle(key, v)}
                          aria-label={meta.name}
                        />
                      </label>
                    );
                  })}
                </div>
              </SettingsCard>
            );
          })}
        </TabsContent>

        {/* ── Members ── */}
        <TabsContent value="members" className="space-y-4">
          {editable && !isOwnerRole && (
            <AddMembers
              candidates={candidates}
              onAdd={async (email) => {
                const r = await assignRole(s.teamId, email, role);
                if (r.ok) toast.success(`Added to ${role.name}`);
                else toast.error(r.error);
              }}
            />
          )}
          <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card">
            {roleMembers.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">No members have this role.</p>
            )}
            {roleMembers.map((m) => {
              const removable =
                editable && !!memberRole && role.id !== memberRole.id && memberRole.position < (s.access?.position ?? 0);
              return (
                <div key={m.email} className="flex items-center gap-3 px-4 py-2.5">
                  <MemberAvatar member={m} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.displayName || m.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  {removable && s.outranks(memberPosition(m, s.team?.ownerId)) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Remove ${m.displayName || m.email} from ${role.name}`}
                      onClick={async () => {
                        const r = await assignRole(s.teamId, m.email, memberRole!);
                        if (r.ok) toast.success(`${m.displayName || m.email} is now a Member`);
                        else toast.error(r.error);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {editable && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Lock className="size-3" /> Each member has exactly one role; adding someone here replaces their current role.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <SaveBar visible={editable && dirty} saving={saving} onReset={() => setDraft(original)} onSave={save} />
    </>
  );
}

function AddMembers({
  candidates,
  onAdd,
}: {
  candidates: { email: string; displayName: string; avatar?: string }[];
  onAdd: (email: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" disabled={candidates.length === 0}>
          <UserPlus className="mr-1.5 size-4" /> Add members
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search members" />
          <CommandList>
            <CommandEmpty>No members to add.</CommandEmpty>
            <CommandGroup>
              {candidates.map((m) => (
                <CommandItem
                  key={m.email}
                  value={`${m.displayName} ${m.email}`}
                  onSelect={async () => {
                    setOpen(false);
                    await onAdd(m.email);
                  }}
                  className="gap-2"
                >
                  <MemberAvatar member={m} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm">{m.displayName || m.email}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{m.email}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
