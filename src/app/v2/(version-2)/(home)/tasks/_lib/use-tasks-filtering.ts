import { useMemo } from "react";
import { type TaskItem, type TaskPriority, type TaskStatus } from "./tasks-types";

export function useTasksFiltering(
  tasks: TaskItem[],
  statusFilter: TaskStatus | "all",
  priorityFilter: TaskPriority | "all",
  searchQuery: string
) {
  return useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchId = t.ticketId?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchId) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);
}
