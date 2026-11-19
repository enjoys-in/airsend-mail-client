import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OptionMenu } from "@tasks/_components/common/option-menu/option-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tasks/_components/ui/popover";
import { useUpdateTaskStatus } from "@tasks/_hooks/mutations/task/use-update-task-status";
import { useGetColumns } from "@tasks/_hooks/queries/column/use-get-columns";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";
import { toast } from "@tasks/_lib/toast";
import type Task from "@tasks/_types/task";
import { statusMenuOptions } from "./menus/status-menu-options";

type SubtaskStatusPopoverProps = {
  tasks: Task[];
  projectId: string;
  children: React.ReactNode;
};

export default function SubtaskStatusPopover({
  tasks,
  projectId,
  children,
}: SubtaskStatusPopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: columns = [] } = useGetColumns(projectId);
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatus();
  const { canUpdateTasks } = useWorkspacePermission();

  if (!canUpdateTasks()) return <>{children}</>;

  const current = tasks.every((task) => task.status === tasks[0]?.status)
    ? tasks[0]?.status
    : undefined;

  const changeStatus = async (status: string) => {
    setOpen(false);
    try {
      await Promise.all(
        tasks.map((task) => updateTaskStatus({ ...task, status })),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("tasks:popover.status.updateError"),
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <OptionMenu
          label={t("tasks:status.label")}
          placeholder={t("tasks:bulk.statusPlaceholder")}
          options={statusMenuOptions(columns, current)}
          onSelect={changeStatus}
        />
      </PopoverContent>
    </Popover>
  );
}
