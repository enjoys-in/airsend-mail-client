import type { PresenceStatus } from "./chat-types";

const LABELS: Record<PresenceStatus, string> = {
  online: "Available",
  idle: "Idle",
  away: "Away",
  busy: "Busy",
  dnd: "Do not disturb",
  offline: "Offline",
  in_call: "In a call",
  in_meeting: "In a meeting",
};

const DOTS: Record<PresenceStatus, string> = {
  online: "bg-emerald-500",
  idle: "bg-yellow-500",
  away: "bg-amber-400",
  busy: "bg-rose-500",
  dnd: "bg-red-500",
  offline: "bg-slate-400",
  in_call: "bg-red-500",
  in_meeting: "bg-rose-500",
};

export function isPresenceStatus(value: unknown): value is PresenceStatus {
  return typeof value === "string" && value in LABELS;
}

export function presenceLabel(status: string | undefined | null): string {
  return isPresenceStatus(status) ? LABELS[status] : LABELS.offline;
}

export function presenceDot(status: string | undefined | null): string {
  return isPresenceStatus(status) ? DOTS[status] : DOTS.offline;
}

export function isBusyStatus(status: string | undefined | null): boolean {
  return status === "busy" || status === "dnd" || status === "in_call" || status === "in_meeting";
}

export function isAutoStatus(status: string | undefined | null): boolean {
  return status === "in_call" || status === "in_meeting";
}
