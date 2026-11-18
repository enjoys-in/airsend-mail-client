import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const DAYS_PER_WEEK = 7;
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PackableTask = {
  id: string;
  scheduleStart: Date;
  scheduleEnd: Date;
};

export type WeekSegment<TTask extends PackableTask> = {
  task: TTask;
  lane: number;
  columnStart: number;
  columnEnd: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

export type WeekLayout<TTask extends PackableTask> = {
  segments: Array<WeekSegment<TTask>>;
  hiddenCountByDay: number[];
  tasksByDay: TTask[][];
};

export function buildMonthWeeks(
  visibleMonth: Date,
  weekStartsOn: WeekStartsOn = 0,
): Date[][] {
  const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn });
  const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }
  return weeks;
}

export function packWeekLanes<TTask extends PackableTask>(
  week: Date[],
  tasks: TTask[],
  maxLanes: number,
): WeekLayout<TTask> {
  const hiddenCountByDay = new Array<number>(DAYS_PER_WEEK).fill(0);
  const tasksByDay: TTask[][] = Array.from({ length: DAYS_PER_WEEK }, () => []);
  const weekStart = week[0];

  if (!weekStart) {
    return { segments: [], hiddenCountByDay, tasksByDay };
  }

  const lastDayIndex = DAYS_PER_WEEK - 1;

  const candidates = tasks
    .map((task) => {
      const startOffset = differenceInCalendarDays(task.scheduleStart, weekStart);
      const endOffset = differenceInCalendarDays(task.scheduleEnd, weekStart);
      if (endOffset < 0 || startOffset > lastDayIndex) return null;

      const clippedStart = Math.max(0, startOffset);
      const clippedEnd = Math.min(lastDayIndex, endOffset);

      return {
        task,
        clippedStart,
        clippedEnd,
        columnStart: clippedStart + 1,
        columnEnd: clippedEnd + 2,
        continuesBefore: startOffset < 0,
        continuesAfter: endOffset > lastDayIndex,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => {
      if (left.columnStart !== right.columnStart) {
        return left.columnStart - right.columnStart;
      }
      const leftSpan = left.columnEnd - left.columnStart;
      const rightSpan = right.columnEnd - right.columnStart;
      if (leftSpan !== rightSpan) return rightSpan - leftSpan;
      return left.task.id.localeCompare(right.task.id);
    });

  const segments: Array<WeekSegment<TTask>> = [];
  const laneNextFreeColumn: number[] = [];

  for (const candidate of candidates) {
    for (let dayIndex = candidate.clippedStart; dayIndex <= candidate.clippedEnd; dayIndex += 1) {
      tasksByDay[dayIndex].push(candidate.task);
    }

    let lane = laneNextFreeColumn.findIndex((nextFree) => nextFree <= candidate.columnStart);

    if (lane === -1) {
      lane = laneNextFreeColumn.length;
      laneNextFreeColumn.push(candidate.columnEnd);
    } else {
      laneNextFreeColumn[lane] = candidate.columnEnd;
    }

    if (lane < maxLanes) {
      segments.push({
        task: candidate.task,
        lane,
        columnStart: candidate.columnStart,
        columnEnd: candidate.columnEnd,
        continuesBefore: candidate.continuesBefore,
        continuesAfter: candidate.continuesAfter,
      });
      continue;
    }

    for (let dayIndex = candidate.clippedStart; dayIndex <= candidate.clippedEnd; dayIndex += 1) {
      hiddenCountByDay[dayIndex] += 1;
    }
  }

  return { segments, hiddenCountByDay, tasksByDay };
}
