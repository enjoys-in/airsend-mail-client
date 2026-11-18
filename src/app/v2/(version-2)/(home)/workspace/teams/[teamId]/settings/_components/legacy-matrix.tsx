"use client";

// Channel permissions before custom roles (AUTHZ_MODE legacy / shadow): an
// allow/deny switch per built-in role, saved through the channel update API
// (`permissions` for @everyone, `role_permissions` per role).

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { workspaceApi, apiErrorMessage, toChannel } from "../../../../_lib/api";
import { useChatStore } from "../../../../_lib/chat-store";
import { PERMISSION_METADATA } from "../../../../_lib/permissions";
import { useChannelPermissionDefaults } from "../../../../_lib/permission-catalog";
import type {
  Channel,
  ChannelPermissionKey,
  ChannelPermissions,
  ChannelRolePermissionOverrides,
  MemberRole,
} from "../../../../_lib/chat-types";
import { Notice, SaveBar } from "./settings-ui";

const TARGETS: ("@everyone" | MemberRole)[] = ["@everyone", "moderator", "member", "guest"];
const KEYS = (Object.keys(PERMISSION_METADATA) as ChannelPermissionKey[]).filter(
  (k) => !["view_channel", "manage_members", "timeout_members", "manage_roles"].includes(k),
);

export function LegacyChannelMatrix({ channel, canEdit }: { channel: Channel; canEdit: boolean }) {
  const defaults = useChannelPermissionDefaults();
  const [target, setTarget] = useState<(typeof TARGETS)[number]>("@everyone");
  const [everyone, setEveryone] = useState<Partial<ChannelPermissions>>(channel.permissions ?? {});
  const [roles, setRoles] = useState<ChannelRolePermissionOverrides>(channel.rolePermissions ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEveryone(channel.permissions ?? {});
    setRoles(channel.rolePermissions ?? {});
  }, [channel.permissions, channel.rolePermissions]);

  const dirty = useMemo(
    () =>
      JSON.stringify(everyone) !== JSON.stringify(channel.permissions ?? {}) ||
      JSON.stringify(roles) !== JSON.stringify(channel.rolePermissions ?? {}),
    [everyone, roles, channel.permissions, channel.rolePermissions],
  );

  const value = (k: ChannelPermissionKey): boolean =>
    target === "@everyone"
      ? everyone[k] ?? defaults.everyone[k] ?? false
      : roles[target]?.[k] ?? everyone[k] ?? defaults.roles[target]?.[k] ?? defaults.everyone[k] ?? false;

  const set = (k: ChannelPermissionKey, v: boolean) => {
    if (target === "@everyone") setEveryone((p) => ({ ...p, [k]: v }));
    else setRoles((p) => ({ ...p, [target]: { ...(p[target] ?? {}), [k]: v } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const saved = toChannel(
        await workspaceApi.updateChannel(channel.id, { permissions: everyone, rolePermissions: roles }, ""),
      );
      useChatStore.setState((s) => ({
        channels: s.channels.map((c) => (c.id === saved.id ? { ...c, ...saved, isPinned: c.isPinned, unreadCount: c.unreadCount } : c)),
      }));
      toast.success("Channel permissions saved");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save the permissions"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Notice>
        Per-channel overrides for custom roles and individual members become available when the workspace server runs
        with custom roles enabled. Until then, set what each built-in role can do here. Owners and admins always have
        every permission.
      </Notice>

      <div role="tablist" aria-label="Role" className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
        {TARGETS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={target === t}
            onClick={() => setTarget(t)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              target === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "@everyone" ? "@everyone" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card px-4">
        {KEYS.map((k) => (
          <label key={k} className="flex items-center justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm">{PERMISSION_METADATA[k].name}</p>
              <p className="text-[11px] text-muted-foreground">{PERMISSION_METADATA[k].description}</p>
            </div>
            <Switch checked={value(k)} disabled={!canEdit} onCheckedChange={(v) => set(k, v)} aria-label={PERMISSION_METADATA[k].name} />
          </label>
        ))}
      </div>

      <SaveBar
        visible={canEdit && dirty}
        saving={saving}
        onReset={() => {
          setEveryone(channel.permissions ?? {});
          setRoles(channel.rolePermissions ?? {});
        }}
        onSave={save}
      />
    </div>
  );
}
