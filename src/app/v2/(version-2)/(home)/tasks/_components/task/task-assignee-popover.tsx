import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OptionMenu } from "@tasks/_components/common/option-menu/option-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tasks/_components/ui/popover";
import { useUpdateTaskAssignee } from "@tasks/_hooks/mutations/task/use-update-task-assignee";
import useGetProjectMembers from "@tasks/_hooks/queries/workspace-users/use-get-project-members";
import { useWorkspacePermission } from "@tasks/_hooks/use-workspace-permission";
import { toast } from "@tasks/_lib/toast";
import type Task from "@tasks/_types/task";
import { assigneeMenuOptions } from "./menus/assignee-menu-options";

type TaskAssigneePopoverProps = {
  task: Task;
  workspaceId: string;
  children: React.ReactNode;
};

export default function TaskAssigneePopover({
  task,
  workspaceId,
  children,
}: TaskAssigneePopoverProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateTaskAssignee } = useUpdateTaskAssignee();
  const { data: members = [] } = useGetProjectMembers({
    workspaceId,
    projectId: task.projectId,
  });
  const { canAssignTasks } = useWorkspacePermission();

  if (!canAssignTasks()) return <>{children}</>;

  const changeAssignee = async (userId: string) => {
    setOpen(false);
    try {
      await updateTaskAssignee({ ...task, userId });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("tasks:popover.assignee.updateError"),
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <OptionMenu
          label={t("tasks:assignee.label")}
          placeholder={t("tasks:bulk.assigneePlaceholder")}
          options={assigneeMenuOptions(
            members,
            task.userId ?? null,
            t("tasks:popover.assignee.unassigned"),
          )}
          onSelect={changeAssignee}
        />
      </PopoverContent>
    </Popover>
  );
}
