"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatBytes } from "../_lib/file-utils";

// ---------------------------------------------------------------------------
// DuplicateFileDialog — the picked file was already shared in this
// conversation: reuse that upload (nothing is sent again) or upload anyway.
// ---------------------------------------------------------------------------

export interface DuplicateFile {
  name: string;
  size: number;
  /** When the existing copy was shared (ISO). */
  sharedAt?: string;
}

interface DuplicateFileDialogProps {
  file: DuplicateFile | null;
  onUseExisting: () => void;
  onUploadAgain: () => void;
  onCancel: () => void;
}

export default function DuplicateFileDialog(props: DuplicateFileDialogProps) {
  const { file, onUseExisting, onUploadAgain, onCancel } = props;
  const when = file?.sharedAt ? new Date(file.sharedAt).toLocaleString() : null;
  return (
    <AlertDialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>This file is already uploaded</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{file?.name}</span> ({formatBytes(file?.size ?? 0)}) was
            already shared in this conversation{when ? ` on ${when}` : ""}. Do you want to use that file?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={onUploadAgain}>
            Upload again
          </Button>
          <AlertDialogAction onClick={onUseExisting}>Use existing file</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
