import type { TaskItem, TaskPriority } from "../../tasks/_lib/tasks-types";

export type TabKey = "open" | "in-progress" | "overdue" | "completed" | "all";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in-progress", label: "In Progress" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export const CLOSED = new Set(["done", "canceled", "archived"]);

export function isOverdue(t: TaskItem) {
  if (!t.dueDate || CLOSED.has(t.status)) return false;
  return new Date(t.dueDate).getTime() < Date.now();
}

export function matchesTab(t: TaskItem, tab: TabKey) {
  switch (tab) {
    case "open":
      return !CLOSED.has(t.status);
    case "in-progress":
      return t.status === "in-progress" || t.status === "in-review";
    case "overdue":
      return isOverdue(t);
    case "completed":
      return t.status === "done";
    default:
      return true;
  }
}

export const PRIORITY_STYLE: Record<TaskPriority, string> = {
  urgent: "text-red-500 border-red-500/30 bg-red-500/10",
  high: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  medium: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  low: "text-sky-500 border-sky-500/30 bg-sky-500/10",
  none: "text-muted-foreground border-border/60",
};

export const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  "to-do": "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  canceled: "Canceled",
  archived: "Archived",
};

export function formatDue(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
