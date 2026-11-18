"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UploadFolderDialog } from "./dialogs/upload-folder-dialog";
import { CreateFolderDialog } from "./dialogs/create-folder-dialog";
import { UploadFileDialog } from "./dialogs/upload-files-dialog";
import { FolderPlus, Plus, Upload } from "lucide-react";
import { useSearch } from "../_lib/router-shim";
import { Button } from "./ui/button";

export function UploadButton({ name = "New" }: { name?: string }) {
  const [uploadFileOpen, setUploadFileOpen] = useState(false);
  const [uploadFolderOpen, setUploadFolderOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const searchParams = useSearch();
  const folderId = searchParams.folderId ?? "root";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="flex h-8 w-fit cursor-pointer items-center gap-2 rounded-lg font-medium"
          >
            <Plus className="h-4 w-4" />
            {name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setUploadFileOpen(true)} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload files
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUploadFolderOpen(true)} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload folder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCreateFolderOpen(true)} className="cursor-pointer">
            <FolderPlus className="mr-2 h-4 w-4" />
            Create folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UploadFileDialog open={uploadFileOpen} onOpenChange={setUploadFileOpen} parentId={folderId} />
      <UploadFolderDialog open={uploadFolderOpen} onOpenChange={setUploadFolderOpen} parentId={folderId} />
      <CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} parentId={folderId} />
    </>
  );
}
