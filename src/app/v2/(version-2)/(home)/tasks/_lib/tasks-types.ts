export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "in-review"
  | "done"
  | "canceled"
  | "archived";

export type TasksViewMode = "board" | "list" | "my-tasks" | "calendar";

export type MyTasksGroupBy = "dueDate" | "project";

export type DueBucket = "overdue" | "today" | "thisWeek" | "later" | "noDueDate";

export function normalizeTaskStatus(status?: string | null): TaskStatus {
  if (!status) return "todo";
  const s = status.toLowerCase();
  if (s === "to-do" || s === "todo") return "todo";
  if (s === "in_progress" || s === "in-progress") return "in-progress";
  if (s === "in_review" || s === "in-review") return "in-review";
  if (s === "done" || s === "completed") return "done";
  if (s === "backlog") return "backlog";
  if (s === "canceled" || s === "cancelled") return "canceled";
  if (s === "archived") return "archived";
  return s as TaskStatus;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  taskId?: string;
  workspaceId?: string;
}

export interface TaskColumn {
  id: string;
  name: string;
  slug: string;
  position: number;
  icon?: string;
  isFinal?: boolean;
}

export interface TaskItem {
  id: string;
  projectId: string;
  projectName?: string;
  projectSlug?: string;
  projectIcon?: string;
  number?: number | null;
  ticketId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  statusName?: string;
  statusIcon?: string;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  assigneeAvatar?: string | null;
  labels: TaskLabel[];
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskProject {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  workspaceId: string;
  taskCount?: number;
  isPublic?: boolean;
}

export interface TaskMember {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string | null;
  labels?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string | null;
  projectId?: string;
  labels?: string[];
}

export interface CreateProjectInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}
