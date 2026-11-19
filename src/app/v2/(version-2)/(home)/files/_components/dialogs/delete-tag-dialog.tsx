import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@nimbus/_components/ui/dialog";
import { Button } from "@nimbus/_components/ui/button";
import type { Tag } from "@nimbus/_lib/files-types";

interface DeleteTagDialogProps {
	isOpen?: boolean;
	open?: boolean;
	onClose?: () => void;
	onOpenChange?: (open: boolean) => void;
	onDelete?: (id: string) => void;
	onDeleteTag?: () => void;
	tag: Tag | null;
}

export function DeleteTagDialog({ isOpen, open, onClose, onOpenChange, onDelete, onDeleteTag, tag }: DeleteTagDialogProps) {
	if (!tag) {
		return null;
	}
	const isVisible = open !== undefined ? open : isOpen ?? false;
	const handleClose = () => {
		onClose?.();
		onOpenChange?.(false);
	};

	const handleSubmit = () => {
		onDelete?.(tag.id);
		onDeleteTag?.();
		handleClose();
	};

	return (
		<Dialog open={isVisible} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Tag</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the tag {tag.name} ? Be aware that this will delete all of its children as
						well. This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleSubmit}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
