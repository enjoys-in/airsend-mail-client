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

interface CreateTagDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onCreateTag?: (data: { name: string; color: string; parentId?: string | null }) => void;
  onCreate?: (data: { name: string; color: string; parentId?: string | null }) => void;
  tags?: Tag[];
  initialParentId?: string;
}

export function CreateTagDialog({
  isOpen,
  onOpenChange,
  onClose,
  onCreateTag,
  onCreate,
  tags = [],
  initialParentId,
}: CreateTagDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const fn = onCreateTag || onCreate;
    if (fn) {
      fn({ name: name.trim(), color, parentId: initialParentId || null });
    }
    handleClose();
    setName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
          <DialogDescription>Create a tag to organize and filter your files.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Invoices, Contracts, Design"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tag-color">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="tag-color"
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
            Create Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
