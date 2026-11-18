"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { getFileExtension } from "../../_lib/file-utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";

interface RenameFileDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onRename: (newName: string) => Promise<void>;
  currentName: string;
  fileType: "file" | "folder";
}

export function RenameFileDialog({
  isOpen,
  onOpenChange,
  onClose,
  onRename,
  currentName,
  fileType,
}: RenameFileDialogProps) {
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (fileType === "file") {
        const extension = getFileExtension(currentName);
        const nameWithoutExtension = extension
          ? currentName.slice(0, currentName.lastIndexOf(`.${extension}`))
          : currentName;
        setNewName(nameWithoutExtension);
      } else {
        setNewName(currentName);
      }
    }
  }, [isOpen, currentName, fileType]);

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsRenaming(true);
    try {
      let finalName = newName.trim();
      if (fileType === "file") {
        const extension = getFileExtension(currentName);
        if (extension) {
          finalName = `${finalName}.${extension}`;
        }
      }

      await onRename(finalName);
      toast.success(`${fileType === "folder" ? "Folder" : "File"} renamed successfully`);
      handleClose();
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error(`Failed to rename ${fileType}`);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {fileType === "folder" ? "Folder" : "File"}</DialogTitle>
          <DialogDescription>
            Enter a new name for &quot;{currentName}&quot;.
            {fileType === "file" && " The file extension will be preserved."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            placeholder={`Enter ${fileType} name`}
            disabled={isRenaming}
            autoFocus
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
