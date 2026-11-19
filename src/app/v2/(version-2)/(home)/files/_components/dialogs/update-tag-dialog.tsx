"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { Tag } from "../../_lib/files-types";

interface UpdateTagDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onUpdateTag?: (data: { id: string; name?: string; color?: string }) => void;
  onUpdate?: (data: { id: string; name?: string; color?: string }) => void;
  tag: Tag;
}

export function UpdateTagDialog({
  isOpen,
  onOpenChange,
  onClose,
  onUpdateTag,
  onUpdate,
  tag,
}: UpdateTagDialogProps) {
  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState(tag?.color || "#3b82f6");

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    }
  }, [tag]);

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const fn = onUpdateTag || onUpdate;
    if (fn) {
      fn({ id: tag.id, name: name.trim(), color });
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>Update tag properties.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="edit-tag-name">Tag Name</Label>
            <Input
              id="edit-tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-tag-color">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="edit-tag-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-16 p-1 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono">{color}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
