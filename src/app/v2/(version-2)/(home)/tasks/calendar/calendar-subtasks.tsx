import React from "react";

export function CalendarSubtasks({
  subtasks,
}: {
  subtasks?: readonly { id: string; title: string }[];
}) {
  if (!subtasks?.length) return null;

  return (
    <span className="flex w-full min-w-0 flex-col gap-0.5 border-t border-current/15 pt-0.5 text-[10px] font-normal">
      {subtasks.map((task) => (
        <span key={task.id} className="truncate pl-1 opacity-90" title={task.title}>
          • {task.title}
        </span>
      ))}
    </span>
  );
}
