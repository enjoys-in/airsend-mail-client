"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Lock, Users, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { workspaceApi, apiErrorMessage, toRole } from "../../../../_lib/api";
import { useAccessStore } from "../../../../_lib/access-store";
import { settingsPath } from "../../../../_lib/use-access";
import { useTeamSettings } from "../_components/use-team-settings";
import { LoadingBlock, Notice, RoleDot, SettingsHeader, roleLabel } from "../_components/settings-ui";

export default function RolesSettingsPage() {
  const s = useTeamSettings();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const canCreate = s.customRoles && s.can("manage_roles");

  const create = async () => {
    setCreating(true);
    try {
      const taken = new Set(s.roles.map((r) => r.name.toLowerCase()));
      let name = "new role";
      for (let i = 2; taken.has(name); i++) name = `new role ${i}`;
      const role = toRole(await workspaceApi.createRole(s.teamId, { name, permissions: [] }));
      await useAccessStore.getState().fetchRoles(s.teamId, true);
      router.push(settingsPath.role(s.teamId, role.id));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create the role"));
    } finally {
      setCreating(false);
    }
  };

  // Before enforce mode there are no role rows: show the built-in roles.
  if (!s.customRoles) {
    return (
      <>
        <SettingsHeader title="Roles" description="The built-in roles and what each one can do." />
        <Notice>
          Custom roles are not enabled on this workspace server yet. Members use the built-in roles below; change a
          member&apos;s role from the <Link href={settingsPath.team(s.teamId, "members")} className="text-primary hover:underline">Members</Link> page.
        </Notice>
        <div className="mt-4 divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card">
          {(s.catalog?.systemRoles ?? []).map((r) => (
            <div key={r.name} className="flex items-start gap-3 px-4 py-3">
              <RoleDot className="mt-1.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{roleLabel(r.name)}</p>
                <p className="text-xs text-muted-foreground">
                  {r.administrator ? "Every permission" : `${r.permissions.length} permissions`} ·{" "}
                  {s.members.filter((m) => m.role === r.name).length} members
                </p>
              </div>
            </div>
          ))}
          {!s.catalog && <LoadingBlock />}
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsHeader
        title="Roles"
        description="Each member has one role. Roles higher in the list rank above the ones below them; you can only manage roles below your own."
        actions={
          canCreate && (
            <Button size="sm" onClick={create} disabled={creating}>
              {creating ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Plus className="mr-1.5 size-4" />}
              Create role
            </Button>
          )
        }
      />

      {!s.rolesLoaded ? (
        <LoadingBlock />
      ) : (
        <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card">
          {s.roles.map((r) => {
            const isOwnerRole = r.systemKey === "owner";
            const locked = isOwnerRole || !s.can("manage_roles") || !s.outranks(r.position);
            return (
              <Link
                key={r.id}
                href={settingsPath.role(s.teamId, r.id)}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <RoleDot color={r.color} className="size-3" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{r.name}</span>
                    {isOwnerRole && <Crown className="size-3.5 text-amber-500" />}
                    {r.administrator && !isOwnerRole && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Administrator</Badge>
                    )}
                    {r.systemKey && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">Built-in</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.administrator ? "Every permission" : `${r.permissions.length} permissions`}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <Users className="size-3.5" /> {r.memberCount}
                </span>
                {locked ? (
                  <Lock className="size-3.5 text-muted-foreground/60" aria-label="View only" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
