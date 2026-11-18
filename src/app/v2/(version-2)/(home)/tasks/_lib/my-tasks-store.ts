"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { eventBus } from "@/lib/event-bus";
import { CustomEventKey } from "@/hooks/use-custom-event";
import { tasksApi } from "./tasks-api";
import type { TaskItem, TaskStatus } from "./tasks-types";

// ==========================================================================
// My Tasks — single source of truth for "tasks assigned to me".
//
// Anything that shows the user's tasks (badges, workspace hub, side panel,
// /v2/workspace/tasks) reads from this store. To make it reload, call
// `refreshMyTasks()` from anywhere, or emit on the event bus directly:
//
//   eventBus.emit(CustomEventKey.RefreshMyTasks)
//
// Data comes only from the /task/assigned endpoint. The tasks API's offline
// fallback (locally stored / seeded tasks) is NOT used, since those aren't
// necessarily assigned to the current user.
// ==========================================================================

const CLOSED_STATUSES = new Set<string>(["done", "canceled", "archived"]);

export function isOpenTask(t: Pick<TaskItem, "status">) {
  return !CLOSED_STATUSES.has(t.status);
}

interface MyTasksState {
  tasks: TaskItem[];
  isLoading: boolean;
  error: string | null;
  /** Epoch ms of the last successful load; null = never loaded. */
  lastFetchedAt: number | null;
  fetchMyTasks: () => Promise<void>;
  /** Optimistic status change; reverts if the backend call fails. */
  setTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
}

let inFlight: Promise<void> | null = null;
let refetchQueued = false;

export const useMyTasksStore = create<MyTasksState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchMyTasks: () => {
    // Collapse concurrent calls; if one arrives mid-flight, run once more
    // afterwards so the caller sees data that includes its change.
    if (inFlight) {
      refetchQueued = true;
      return inFlight;
    }
    inFlight = (async () => {
      set({ isLoading: true });
      try {
        const workspaces = await tasksApi.getWorkspaces();
        const res = await tasksApi.getAssignedTasks(workspaces[0]?.id);
        if (res.isLive) {
          set({ tasks: res.tasks, error: null, lastFetchedAt: Date.now() });
        } else {
          set({ error: "Couldn't reach the tasks service." });
        }
      } catch {
        set({ error: "Couldn't load your tasks." });
      } finally {
        set({ isLoading: false });
        inFlight = null;
        if (refetchQueued) {
          refetchQueued = false;
          void get().fetchMyTasks();
        }
      }
    })();
    return inFlight;
  },

  setTaskStatus: async (taskId, status) => {
    const prev = get().tasks.find((t) => t.id === taskId);
    if (!prev) return false;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));
    const res = await tasksApi.updateTaskStatus(taskId, status);
    if (!res.isLive) {
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: prev.status } : t)),
      }));
      return false;
    }
    return true;
  },
}));

/** Ask every consumer to reload the user's assigned tasks. Safe to call anywhere. */
export function refreshMyTasks() {
  if (typeof window === "undefined") return;
  eventBus.emit(CustomEventKey.RefreshMyTasks);
}

// One global listener, registered once on the client (guarded against HMR
// re-evaluating this module and stacking duplicate listeners).
if (typeof window !== "undefined" && !(window as any).__airsendMyTasksListener) {
  (window as any).__airsendMyTasksListener = true;
  eventBus.on(CustomEventKey.RefreshMyTasks, () => {
    void useMyTasksStore.getState().fetchMyTasks();
  });
}

/** Load once on mount if nothing has been loaded yet. */
export function useEnsureMyTasks() {
  useEffect(() => {
    const s = useMyTasksStore.getState();
    if (s.lastFetchedAt === null && !s.isLoading) void s.fetchMyTasks();
  }, []);
}

/** Number of open tasks assigned to me — triggers the initial load. */
export function useMyPendingTaskCount() {
  useEnsureMyTasks();
  return useMyTasksStore((s) => s.tasks.filter(isOpenTask).length);
}
