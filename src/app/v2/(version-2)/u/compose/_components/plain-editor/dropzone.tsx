"use client";

import React, { useCallback, useRef, useState } from "react";

type DropzoneProps = {
  onFiles?: (files: File[]) => void;          // callback when files selected/dropped
  accept?: string;                            // e.g. "image/*,.pdf"
  multiple?: boolean;                         // allow multiple files
  maxSizeMB?: number;                         // optional size guard
  className?: string;                         // extra classes
};

export default function Dropzone({
  onFiles,
  accept = "image/*,.pdf",
  multiple = true,
  maxSizeMB,
  className = "",
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => inputRef.current?.click();

  const validate = (files: File[]) => {
    if (!maxSizeMB) return files;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const valid = files.filter(f => f.size <= maxBytes);
    if (valid.length !== files.length) {
      setError(`Some files exceeded ${maxSizeMB} MB and were skipped.`);
    } else {
      setError(null);
    }
    return valid;
  };

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      const valid = validate(files);
      onFiles?.(valid);
    },
    [onFiles, maxSizeMB]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFileDialog}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFileDialog()}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={[
        "w-full border rounded-lg overflow-hidden bg-transparent relative",
        "transition-colors duration-150 cursor-pointer",
        "p-6 flex items-center justify-center text-center",
        // base border/overlay
        "border-dashed",
        // hover + drag-over highlight
        isDragOver
          ? "border-blue-600 ring-4 ring-blue-100"
          : isHover
          ? "border-blue-400"
          : "border-zinc-300",
        className,
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="space-y-2">
        <div className="mx-auto h-12 w-12 rounded-full border flex items-center justify-center">
          {/* simple arrow/cloud icon using emoji to avoid deps; replace with your icon if you like */}
          <span className="text-xl">☁️</span>
        </div>
        <p className="text-sm font-medium">
          {isDragOver ? "Drop files to upload" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-zinc-500">or <span className="underline">click to browse</span></p>
        <p className="text-[11px] text-zinc-400">
          {multiple ? "Multiple files allowed." : "Single file only."}{" "}
          {maxSizeMB ? `Max ${maxSizeMB} MB each.` : null}
        </p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
