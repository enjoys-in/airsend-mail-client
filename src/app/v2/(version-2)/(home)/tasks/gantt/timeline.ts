export function parseTaskDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function differenceInDays(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

export function buildTimelineWindow(tasks: { dueDate?: string | null; startDate?: string | null }[]) {
  const now = new Date();
  let minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  let maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21);

  for (const t of tasks) {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (d < minDate) minDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 3);
      if (d > maxDate) maxDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
    }
    if (t.startDate) {
      const d = new Date(t.startDate);
      if (d < minDate) minDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 3);
    }
  }

  const days: Date[] = [];
  const curr = new Date(minDate);
  while (curr <= maxDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  return { days, startDate: minDate, endDate: maxDate };
}
