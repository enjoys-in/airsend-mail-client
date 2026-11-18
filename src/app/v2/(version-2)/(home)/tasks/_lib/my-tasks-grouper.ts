import { type DueBucket, type TaskItem } from "./tasks-types";

export interface TaskGroup {
  id: string;
  title: string;
  bucket?: DueBucket;
  tasks: TaskItem[];
}

export function groupTasksByDueDate(tasks: TaskItem[]): TaskGroup[] {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekLater = new Date(now.getTime() + 7 * 86400000);

  const buckets: Record<DueBucket, TaskItem[]> = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
    noDueDate: [],
  };

  for (const t of tasks) {
    if (!t.dueDate) {
      buckets.noDueDate.push(t);
      continue;
    }
    const d = new Date(t.dueDate);
    const dStr = t.dueDate.split("T")[0];

    if (dStr < todayStr && t.status !== "done") {
      buckets.overdue.push(t);
    } else if (dStr === todayStr) {
      buckets.today.push(t);
    } else if (d <= weekLater) {
      buckets.thisWeek.push(t);
    } else {
      buckets.later.push(t);
    }
  }

  const result: TaskGroup[] = [];
  if (buckets.overdue.length > 0) {
    result.push({ id: "overdue", title: "Overdue", bucket: "overdue", tasks: buckets.overdue });
  }
  if (buckets.today.length > 0) {
    result.push({ id: "today", title: "Today", bucket: "today", tasks: buckets.today });
  }
  if (buckets.thisWeek.length > 0) {
    result.push({ id: "thisWeek", title: "This Week", bucket: "thisWeek", tasks: buckets.thisWeek });
  }
  if (buckets.later.length > 0) {
    result.push({ id: "later", title: "Later", bucket: "later", tasks: buckets.later });
  }
  if (buckets.noDueDate.length > 0) {
    result.push({ id: "noDueDate", title: "No Due Date", bucket: "noDueDate", tasks: buckets.noDueDate });
  }

  return result;
}

export function groupTasksByProject(tasks: TaskItem[]): TaskGroup[] {
  const map = new Map<string, TaskItem[]>();
  for (const t of tasks) {
    const key = t.projectName || t.projectId || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  return Array.from(map.entries()).map(([title, items]) => ({
    id: title,
    title,
    tasks: items,
  }));
}
