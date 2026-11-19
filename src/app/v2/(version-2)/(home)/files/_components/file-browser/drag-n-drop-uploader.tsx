"use client";

import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { CircleAlert, CircleCheckBig, CloudUpload, RefreshCcw } from "lucide-react";
import { useUploadFile } from "../../_hooks/useFileOperations";
import { useMutationState, type MutationState } from "@tanstack/react-query";
import { MAX_FILE_SIZE } from "../../_lib/files-types";
import { AnimatePresence, motion } from "framer-motion";
import { useSearch } from "../../_lib/router-shim";
import { useDropzone } from "react-dropzone";
import { getModernFileIcon } from "./index";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DragNDropUploader({ children }: { children: React.ReactNode }) {
  const { mutate: uploadFile } = useUploadFile();
  const [openDialog, setOpenDialog] = useState(false);

  const searchParams = useSearch();
  const parentId = searchParams.folderId ?? "root";

  const { getRootProps, isDragActive, acceptedFiles } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    noDragEventsBubbling: true,
    maxFiles: 5,
    maxSize: MAX_FILE_SIZE,
    onDropAccepted: (files) => {
      setOpenDialog(true);
      files.forEach((file) => {
        uploadFile({ file, parentId });
      });
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        toast.error(`File rejected: ${rejection.file.name}`);
      });
    },
  });

  const uploadMutations = useMutationState({
    filters: { mutationKey: ["uploadFile"] },
    select: (mutation) => mutation.state,
  });

  return (
    <div {...getRootProps()} className="relative h-full w-full">
      {children}
      {isDragActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary">
          <CloudUpload className="h-12 w-12 text-primary animate-bounce mb-2" />
          <p className="text-lg font-medium text-foreground">Drop files here to upload</p>
        </div>
      )}
    </div>
  );
}
