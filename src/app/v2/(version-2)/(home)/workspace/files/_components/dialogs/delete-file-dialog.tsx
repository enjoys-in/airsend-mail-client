"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface DeleteFileDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onDelete: () => Promise<void>;
  fileName: string;
  fileType: "file" | "folder";
}

export function DeleteFileDialog({
  isOpen,
  onOpenChange,
  onClose,
  onDelete,
  fileName,
  fileType,
}: DeleteFileDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success(`${fileType === "folder" ? "Folder" : "File"} deleted successfully`);
      handleClose();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(`Failed to delete ${fileType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {fileType === "folder" ? "Folder" : "File"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{fileName}&quot;? This action cannot be undone.
            {fileType === "folder" && " All files and subfolders inside this folder will also be deleted."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
