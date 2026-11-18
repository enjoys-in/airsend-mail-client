import {
  eachDayOfInterval,
  endOfMonth,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
} from "date-fns";
import type { PackableTask } from "./month-grid-model";

export type AgendaDay<TTask extends PackableTask> = {
  day: Date;
  tasks: TTask[];
};

export function buildMonthAgenda<TTask extends PackableTask>(
  visibleMonth: Date,
  tasks: TTask[],
): Array<AgendaDay<TTask>> {
  const days = eachDayOfInterval({
    start: startOfMonth(visibleMonth),
    end: endOfMonth(visibleMonth),
  });

  return days
    .map((day) => ({
      day,
      tasks: tasks.filter(
        (task) =>
          !isAfter(startOfDay(task.scheduleStart), day) &&
          !isBefore(startOfDay(task.scheduleEnd), day),
      ),
    }))
    .filter((entry) => entry.tasks.length > 0);
}
