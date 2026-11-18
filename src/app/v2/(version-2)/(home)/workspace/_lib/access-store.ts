// ============================================================================
// Access store — the caller's team permissions, team roles, the permission
// catalog and channel overrides, all resolved by the workspace server
// (OpenFGA). The UI only reads these; the server enforces every action.
// ============================================================================

import { create } from "zustand";
import {
  workspaceApi,
  isValidUUID,
  apiErrorMessage,
  toRole,
  toTeamAccess,
  toOverwrite,
  toPermissionCatalog,
} from "./api";
import type { ChannelOverwrite, PermissionCatalog, Role, TeamAccess } from "./chat-types";

interface AccessState {
  access: Record<string, TeamAccess>; // teamId → caller's access
  accessError: Record<string, string>; // teamId → why access could not be loaded
  roles: Record<string, Role[]>; // teamId → roles, most privileged first
  catalog: PermissionCatalog | null;
  overwrites: Record<string, ChannelOverwrite[]>; // channelId → overrides

  fetchAccess: (teamId: string, force?: boolean) => Promise<TeamAccess | null>;
  fetchRoles: (teamId: string, force?: boolean) => Promise<Role[]>;
  fetchCatalog: () => Promise<PermissionCatalog | null>;
  fetchOverwrites: (channelId: string) => Promise<ChannelOverwrite[]>;

  /** Something about the team's roles or memberships changed: refetch what is loaded. */
  invalidateTeam: (teamId: string) => void;
  invalidateChannel: (channelId: string) => void;
}

// One request per key at a time.
const inflight = new Map<string, Promise<unknown>>();
function once<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = run().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export const useAccessStore = create<AccessState>()((set, get) => ({
  access: {},
  accessError: {},
  roles: {},
  catalog: null,
  overwrites: {},

  fetchAccess: (teamId, force = false) => {
    if (!isValidUUID(teamId)) return Promise.resolve(null);
    if (!force && get().access[teamId]) return Promise.resolve(get().access[teamId]);
    return once(`access:${teamId}`, async () => {
      try {
        const a = toTeamAccess(await workspaceApi.getMyTeamAccess(teamId));
        set((s) => {
          const { [teamId]: _, ...accessError } = s.accessError;
          return { access: { ...s.access, [teamId]: a }, accessError };
        });
        return a;
      } catch (err) {
        set((s) => ({ accessError: { ...s.accessError, [teamId]: apiErrorMessage(err, "Could not load your permissions") } }));
        return null;
      }
    });
  },

  fetchRoles: (teamId, force = false) => {
    if (!isValidUUID(teamId)) return Promise.resolve([]);
    if (!force && get().roles[teamId]) return Promise.resolve(get().roles[teamId]);
    return once(`roles:${teamId}`, async () => {
      try {
        const roles = (await workspaceApi.listRoles(teamId)).map(toRole);
        set((s) => ({ roles: { ...s.roles, [teamId]: roles } }));
        return roles;
      } catch {
        // 409 before enforce mode: no role objects yet.
        set((s) => ({ roles: { ...s.roles, [teamId]: [] } }));
        return [];
      }
    });
  },

  fetchCatalog: () => {
    if (get().catalog) return Promise.resolve(get().catalog);
    return once("catalog", async () => {
      try {
        const c = toPermissionCatalog(await workspaceApi.getAuthzCatalog());
        set({ catalog: c });
        return c;
      } catch {
        return null;
      }
    });
  },

  fetchOverwrites: (channelId) =>
    once(`ow:${channelId}`, async () => {
      const list = (await workspaceApi.listOverwrites(channelId)).map(toOverwrite);
      set((s) => ({ overwrites: { ...s.overwrites, [channelId]: list } }));
      return list;
    }),

  invalidateTeam: (teamId) => {
    const { access, roles } = get();
    if (access[teamId]) void get().fetchAccess(teamId, true);
    if (roles[teamId]) void get().fetchRoles(teamId, true);
  },

  invalidateChannel: (channelId) => {
    if (get().overwrites[channelId]) void get().fetchOverwrites(channelId).catch(() => {});
  },
}));
