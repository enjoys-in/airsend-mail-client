"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, UserPlus, MoreHorizontal, Crown, Clock, TimerOff, UserX, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InviteMemberDialog from "../../../../_components/InviteMemberDialog";
import { confirmAction, confirmWithReason } from "../../../../_components/ConfirmHost";
import { memberPosition, isTimedOut } from "../../../../_lib/use-access";
import { assignRole, kickMember, timeoutMember, TIMEOUT_PRESETS, formatUntil } from "../../../../_lib/member-actions";
import type { MemberRole, Role, TeamMember } from "../../../../_lib/chat-types";
import { useTeamSettings } from "../_components/use-team-settings";
import { MemberAvatar, RolePill, SettingsHeader, roleLabel } from "../_components/settings-ui";

const SYSTEM_ROLES: { key: MemberRole; position: number }[] = [
  { key: "admin", position: 80 },
  { key: "moderator", position: 60 },
  { key: "member", position: 40 },
  { key: "guest", position: 20 },
];

export default function MembersSettingsPage() {
  const s = useTeamSettings();
  const searchParams = useSearchParams();
  const focusEmail = searchParams?.get("member")?.toLowerCase() ?? "";
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusEmail, s.members.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return s.members.filter((m) => {
      if (q && !`${m.displayName} ${m.email}`.toLowerCase().includes(q)) return false;
      if (roleFilter === "timed_out") return isTimedOut(m.timedOutUntil);
      if (roleFilter !== "all") return (s.roleOf(m)?.id ?? m.role) === roleFilter;
      return true;
    });
  }, [s, query, roleFilter]);

  const timedOutCount = s.members.filter((m) => isTimedOut(m.timedOutUntil)).length;
  const me = s.currentUserId.toLowerCase();

  const run = async (email: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => {
    setBusy(email);
    const r = await fn();
    setBusy(null);
    if (r.ok) toast.success(success);
    else toast.error((r as { error: string }).error);
  };

  const changeRole = (m: TeamMember, role: Role | MemberRole, label: string) =>
    run(m.email, () => assignRole(s.teamId, m.email, role), `${m.displayName || m.email} is now ${label}`);

  const doTimeout = async (m: TeamMember, minutes: number, label: string) => {
    const reason = await confirmWithReason({
      title: `Timeout ${m.displayName || m.email} for ${label}?`,
      description: "They can still read, but can't send messages, react, join voice or start calls until it ends.",
      confirmLabel: "Timeout",
      destructive: true,
    });
    if (reason === null) return;
    await run(m.email, () => timeoutMember(s.teamId, m.email, minutes, reason), `Timed out for ${label}`);
  };

  const doKick = async (m: TeamMember) => {
    const ok = await confirmAction({
      title: `Remove ${m.displayName || m.email} from ${s.team?.name}?`,
      description: "They lose access to every channel in this team. They can be invited again later.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) await run(m.email, () => kickMember(s.teamId, m.email), "Member removed");
  };

  return (
    <>
      <SettingsHeader
        title="Members"
        description={`${s.members.length} member${s.members.length === 1 ? "" : "s"}. You can manage members ranked below you.`}
        actions={
          s.can("manage_members") && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-1.5 size-4" /> Invite
            </Button>
          )
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="h-9 pl-8"
            aria-label="Search members"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-9 sm:w-48" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {s.roles.length > 0
              ? s.roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))
              : (["owner", ...SYSTEM_ROLES.map((r) => r.key)] as string[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {roleLabel(k)}
                  </SelectItem>
                ))}
            {timedOutCount > 0 && <SelectItem value="timed_out">Timed out ({timedOutCount})</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card">
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No members match.</p>
        )}
        {filtered.map((m) => {
          const isMe = m.email.toLowerCase() === me;
          const isOwner = s.isOwnerMember(m);
          const rank = memberPosition(m, s.team?.ownerId);
          const manageable = !isMe && !isOwner && s.outranks(rank);
          const role = s.roleOf(m);
          const timedOut = isTimedOut(m.timedOutUntil);
          const focused = focusEmail === m.email.toLowerCase();

          const roleChoices: { id: string; label: string; color?: string; value: Role | MemberRole; current: boolean }[] =
            s.customRoles
              ? s.manageableRoles.map((r) => ({ id: r.id, label: r.name, color: r.color, value: r, current: role?.id === r.id }))
              : SYSTEM_ROLES.filter((r) => s.outranks(r.position)).map((r) => ({
                  id: r.key,
                  label: roleLabel(r.key),
                  value: r.key,
                  current: m.role === r.key,
                }));
          const canRole = manageable && s.can("manage_roles") && roleChoices.length > 0;
          const canTimeout = manageable && s.can("timeout_members") && s.customRoles && !role?.administrator;
          const canKick = manageable && s.can("manage_members");

          return (
            <div
              key={m.id || m.email}
              ref={focused ? focusRef : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 transition-colors",
                focused && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                busy === m.email && "opacity-60",
              )}
            >
              <MemberAvatar member={m} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{m.displayName || m.email}</span>
                  {isMe && <span className="text-[11px] text-muted-foreground">(you)</span>}
                  {timedOut && (
                    <Badge variant="outline" className="h-5 gap-1 border-amber-500/40 px-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                      <Clock className="size-3" /> {formatUntil(m.timedOutUntil)}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>

              <div className="hidden sm:block">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Crown className="size-3" /> Owner
                  </span>
                ) : (
                  <RolePill name={role?.name ?? m.roleName ?? roleLabel(m.role)} color={role?.color ?? m.roleColor} />
                )}
              </div>

              {canRole || canTimeout || canKick ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={`Manage ${m.displayName || m.email}`}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                      {m.displayName || m.email}
                    </DropdownMenuLabel>
                    {canRole && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ShieldCheck className="mr-2 size-4" /> Change role
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="max-h-72 w-48 overflow-y-auto">
                          {roleChoices.map((r) => (
                            <DropdownMenuItem
                              key={r.id}
                              disabled={r.current}
                              onClick={() => changeRole(m, r.value, r.label)}
                              className="gap-2"
                            >
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: r.color || "#99aab5" }}
                              />
                              <span className="flex-1 truncate">{r.label}</span>
                              {r.current && <Check className="size-3.5" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    {canTimeout && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Clock className="mr-2 size-4" /> {timedOut ? "Change timeout" : "Timeout"}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40">
                          {TIMEOUT_PRESETS.map((p) => (
                            <DropdownMenuItem key={p.minutes} onClick={() => doTimeout(m, p.minutes, p.label)}>
                              {p.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    {canTimeout && timedOut && (
                      <DropdownMenuItem
                        onClick={() => run(m.email, () => timeoutMember(s.teamId, m.email, 0), "Timeout removed")}
                      >
                        <TimerOff className="mr-2 size-4" /> Remove timeout
                      </DropdownMenuItem>
                    )}
                    {canKick && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => doKick(m)}>
                          <UserX className="mr-2 size-4" /> Remove from team
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="size-8" aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
