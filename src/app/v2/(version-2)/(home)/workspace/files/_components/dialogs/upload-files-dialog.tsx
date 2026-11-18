"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { UploadZone } from "./upload-zone";
import { useUploadFile } from "../../_hooks/useFileOperations";
import { Button } from "../ui/button";
import { toast } from "sonner";

export interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
}

export function UploadFileDialog({ open, onOpenChange, parentId = "root" }: UploadFileDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { mutate: uploadFile, isPending } = useUploadFile();

  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
    }
  }, [open]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      uploadFile({ file, parentId });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>Select or drop files to upload to this folder.</DialogDescription>
        </DialogHeader>

        <UploadZone onFilesSelected={(files) => setSelectedFiles(Array.from(files))} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isPending || selectedFiles.length === 0}>
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
