"use client";

import React, { useCallback, useRef, useState, type ChangeEvent } from "react";
import { Progress } from "../ui/progress";
import { formatFileSize } from "../../_lib/file-utils";
import { Label } from "../ui/label";
import { Folder, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isFolder?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function UploadZone({
  onFilesSelected,
  isFolder = false,
  isUploading = false,
  uploadProgress = 0,
}: UploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFiles(acceptedFiles);
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: !isFolder,
  });

  const handleManualSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      onFilesSelected(files);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={!isFolder}
        {...(isFolder ? { webkitdirectory: "true" } : {})}
        onChange={handleManualSelect}
      />

      {!isUploading && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-neutral-300 hover:border-neutral-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input {...getInputProps()} />
          {isFolder ? (
            <Folder className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          ) : (
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          )}

          <p className="mb-2 text-sm text-foreground">
            {isDragActive
              ? `Drop ${isFolder ? "folder" : "files"} here`
              : `Click or drag and drop ${isFolder ? "a folder" : "files"} here`}
          </p>
          <p className="text-xs text-muted-foreground">
            {isFolder ? "Upload an entire folder at once" : "Supports multiple files"}
          </p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-4">
          <Label>Uploading...</Label>
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-center text-sm">{uploadProgress}% complete</p>
        </div>
      )}

      {selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-2">
          <Label>Selected {isFolder ? "folder contents" : "files"}:</Label>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {selectedFiles.slice(0, 5).map((file, index) => (
              <div key={index} className="flex items-center gap-2 rounded bg-muted/40 p-2 text-xs">
                <Upload className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="ml-2 shrink-0">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
