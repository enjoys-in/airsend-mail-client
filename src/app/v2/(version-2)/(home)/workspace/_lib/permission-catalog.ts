"use client";

// Channel permission defaults, fetched from the workspace server
// (GET /api/v1/channel-permissions/catalog). The server owns the defaults;
// the UI only uses them to pre-fill toggles for a channel that doesn't exist yet.

import { useEffect, useState } from "react";
import { workspaceApi, type ServerPermissionCatalog } from "./api";
import { useChatStore } from "./chat-store";
import type { ChannelPermissions, ChannelRolePermissionOverrides } from "./chat-types";

export interface ChannelPermissionDefaults {
  everyone: Partial<ChannelPermissions>;
  roles: ChannelRolePermissionOverrides;
  loaded: boolean;
}

const EMPTY: ChannelPermissionDefaults = { everyone: {}, roles: {}, loaded: false };

let cached: ChannelPermissionDefaults | null = null;
let inflight: Promise<ServerPermissionCatalog> | null = null;

function fromCatalog(c: ServerPermissionCatalog): ChannelPermissionDefaults {
  return {
    everyone: c.defaults.everyone as Partial<ChannelPermissions>,
    roles: c.defaults.roles as ChannelRolePermissionOverrides,
    loaded: true,
  };
}

export function useChannelPermissionDefaults(): ChannelPermissionDefaults {
  const email = useChatStore((s) => s.currentUserId) || "";
  const [defaults, setDefaults] = useState<ChannelPermissionDefaults>(cached ?? EMPTY);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    inflight ??= workspaceApi.getChannelPermissionCatalog(email);
    inflight
      .then((c) => {
        cached = fromCatalog(c);
        if (alive) setDefaults(cached);
      })
      .catch(() => {
        inflight = null; // retry on next mount
      });
    return () => {
      alive = false;
    };
  }, [email]);

  return defaults;
}
