"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Copy, Download, ExternalLink, MoreVertical, Pin, Trash, Edit } from "lucide-react";
import { useDeleteFile, useDownloadFile, useUpdateFile } from "../../_hooks/useFileOperations";
import { useDownloadContext } from "../providers/download-provider";
import { useAccountProvider } from "../providers/account-provider";
import { RenameFileDialog } from "../dialogs/rename-file-dialog";
import { DeleteFileDialog } from "../dialogs/delete-file-dialog";
import { useDriveOps } from "../../_hooks/useDriveOps";
import { Button } from "../ui/button";
import type { File } from "../../_lib/files-types";
import { toast } from "sonner";

export function FileActions({ file, fileType }: { file: File; fileType: "file" | "folder" }) {
  const { mutate: deleteFile } = useDeleteFile();
  const { mutate: renameFile } = useUpdateFile();
  const { mutate: downloadFile } = useDownloadFile();
  const { pinFile } = useDriveOps();
  const { startDownload, updateProgress, completeDownload, errorDownload } = useDownloadContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const { providerId } = useAccountProvider();

  const handleDelete = async () => {
    deleteFile({ fileId: file.id });
  };

  const handleRename = async (newName: string) => {
    renameFile({ fileId: file.id, name: newName });
  };

  const handleCopyLink = async () => {
    if (file.webViewLink) {
      await navigator.clipboard.writeText(file.webViewLink);
      toast.success("Link copied to clipboard");
    } else {
      toast.error("No shareable link available");
    }
  };

  const handleOpenInDrive = () => {
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank");
    } else {
      toast.error("Cannot open file or folder");
    }
  };

  const handlePinFile = async () => {
    pinFile({
      fileId: file.id,
      name: file.name,
      type: fileType,
      provider: providerId || "google",
    });
    toast.success("File pinned");
  };

  const handleDownload = () => {
    startDownload(file.id, file.name);
    downloadFile(
      {
        fileId: file.id,
        fileName: file.name,
        onProgress: (progress) => updateProgress(file.id, progress),
      },
      {
        onSuccess: () => completeDownload(file.id),
        onError: (err: any) => errorDownload(file.id, err?.message || "Download failed"),
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {fileType === "file" && (
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePinFile}>
            <Pin className="mr-2 h-4 w-4" />
            Pin
          </DropdownMenuItem>
          {file.webViewLink && (
            <>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenInDrive}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open externally
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteFileDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        fileName={file.name}
        fileType={fileType}
      />

      <RenameFileDialog
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRename={handleRename}
        currentName={file.name}
        fileType={fileType}
      />
    </>
  );
}
