export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "in-review"
  | "done"
  | "canceled"
  | "archived";

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  taskId?: string;
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
}

export interface TaskWorkspace {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  role?: string;
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
  columnId?: string;
}
