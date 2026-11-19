"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import type { Tag } from "../../_lib/files-types";

interface DeleteTagDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onDeleteTag?: () => void;
  onDelete?: () => void;
  tag: Tag;
}

export function DeleteTagDialog({
  isOpen,
  onOpenChange,
  onClose,
  onDeleteTag,
  onDelete,
  tag,
}: DeleteTagDialogProps) {
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleDelete = () => {
    const fn = onDeleteTag || onDelete;
    if (fn) fn();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tag</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the tag &quot;{tag?.name}&quot;? Files with this tag will not be deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
