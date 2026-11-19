import { NewCalendarFeedForm } from "@tasks/_components/project/calendar-feeds/new-calendar-feed-form";
import { Dialog, DialogPopup } from "@tasks/_components/ui/dialog";

type NewCalendarFeedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  workspaceId: string;
};

export function NewCalendarFeedDialog({
  open,
  onOpenChange,
  projectId,
  workspaceId,
}: NewCalendarFeedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="sm:max-w-md">
        <NewCalendarFeedForm
          projectId={projectId}
          workspaceId={workspaceId}
          onClose={() => onOpenChange(false)}
        />
      </DialogPopup>
    </Dialog>
  );
}
