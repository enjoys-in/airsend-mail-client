"use client";

import React, { useMemo, useState, type JSX } from "react";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Code,
  FileIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  ImageIcon,
  Music,
  Presentation,
  Video,
} from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DownloadProvider } from "../providers/download-provider";
import { useNavigate, useSearch } from "../../_lib/router-shim";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { pointerIntersection } from "@dnd-kit/collision";
import DragNDropUploader from "./drag-n-drop-uploader";
import { Button } from "../ui/button";
import { formatFileSize } from "../../_lib/file-utils";
import { PdfIcon } from "../icons/pdf-icon";
import { FileActions } from "./file-actions";
import type { File } from "../../_lib/files-types";
import { useTags } from "../../_hooks/useTags";
import { FileTags } from "./file-tags";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    if (diffInMinutes < 1) return "just now";
    return `${diffInMinutes} min ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }
  return format(date, "MMM d, yyyy");
};

export interface FileTableProps {
  files: File[];
  isLoading: boolean;
  refetch: () => void;
  error: Error | null;
}

const columnHelper = createColumnHelper<File>();

export function FileTable({ files, isLoading, refetch, error }: FileTableProps) {
  const { tags } = useTags(files[0]?.parentId);
  const navigate = useNavigate();
  const searchParams = useSearch();
  const [sorting, setSorting] = useState<SortingState>([]);

  const safeFiles = useMemo(() => {
    if (isLoading || !files || !Array.isArray(files)) {
      return [];
    }
    return files;
  }, [files, isLoading]);

  const filteredFiles = useMemo(() => {
    if (!safeFiles.length) return [];
    const searchType = searchParams.type;
    if (!searchType) return safeFiles;

    return safeFiles.filter((file) => {
      const mimeType = file.mimeType?.toLowerCase() ?? "";
      const fileName = file.name?.toLowerCase() ?? "";

      switch (searchType) {
        case "folder":
          return mimeType === "application/vnd.google-apps.folder" || mimeType === "folder";
        case "document":
          return (
            mimeType.includes("application/vnd.google-apps.document") ||
            mimeType.includes("application/vnd.google-apps.spreadsheet") ||
            mimeType.includes("application/vnd.google-apps.presentation") ||
            mimeType.includes("officedocument") ||
            mimeType.includes("msword") ||
            mimeType.includes("pdf") ||
            mimeType.includes("text/") ||
            /\.(doc|docx|xls|xlsx|ppt|pptx|pdf|txt|rtf|odt|ods|odp)$/i.test(fileName)
          );
        case "media":
          return (
            mimeType.includes("image/") ||
            mimeType.includes("video/") ||
            mimeType.includes("audio/") ||
            /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mp3|wav|ogg)$/i.test(fileName)
          );
        case "archive":
          return (
            mimeType.includes("zip") ||
            mimeType.includes("tar") ||
            mimeType.includes("rar") ||
            mimeType.includes("7z") ||
            /\.(zip|rar|7z|tar|gz|bz2)$/i.test(fileName)
          );
        default:
          return true;
      }
    });
  }, [safeFiles, searchParams.type]);

  const handleRowDoubleClick = (file: File) => {
    const fileType = file.mimeType.includes("folder") || file.mimeType === "folder" ? "folder" : "file";
    if (fileType === "folder") {
      navigate({
        search: { ...searchParams, folderId: file.id },
      });
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            Name
            <div className="w-6">
              {column.getIsSorted() === "asc" && <ChevronUp className="w-4 h-4" />}
              {column.getIsSorted() === "desc" && <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        ),
        cell: ({ getValue, row }) => (
          <div className="flex items-center gap-2 pl-1 cursor-pointer">
            <div className="flex-shrink-0">{getModernFileIcon(row.original.mimeType, row.original.name)}</div>
            <span className="font-medium text-sm truncate max-w-xs">{getValue()}</span>
          </div>
        ),
      }),

      columnHelper.accessor("modifiedTime", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            Date Modified
            <div className="w-6">
              {column.getIsSorted() === "asc" && <ChevronUp className="w-4 h-4" />}
              {column.getIsSorted() === "desc" && <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        ),
        cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{formatDate(getValue())}</span>,
        size: 140,
      }),

      columnHelper.accessor("size", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 w-full justify-start px-1 text-left text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            Size
            <div className="w-6">
              {column.getIsSorted() === "asc" && <ChevronUp className="w-4 h-4" />}
              {column.getIsSorted() === "desc" && <ChevronDown className="w-4 h-4" />}
            </div>
          </Button>
        ),
        cell: ({ getValue, row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.mimeType?.includes("folder") || row.original.mimeType === "folder" ? "—" : formatFileSize(getValue())}
          </span>
        ),
        size: 100,
      }),

      columnHelper.accessor("tags", {
        header: () => <span className="text-xs font-semibold text-neutral-500 px-1">Tags</span>,
        cell: ({ row }) => <FileTags file={row.original} availableTags={tags} refetch={refetch} />,
        size: 150,
      }),

      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const file = row.original;
          const fileType = file.mimeType.includes("folder") || file.mimeType === "folder" ? "folder" : "file";
          return (
            <DownloadProvider>
              <FileActions file={row.original} fileType={fileType} />
            </DownloadProvider>
          );
        },
        size: 50,
      }),
    ],
    [refetch, tags]
  );

  const table = useReactTable({
    data: searchParams.type ? filteredFiles : safeFiles,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="relative flex h-full w-full flex-col justify-start">
      <DragNDropUploader>
        <div className="h-0 min-h-full w-full overflow-auto pb-5">
          <Table>
            <TableHeader className="select-none hover:bg-transparent">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="h-6 select-none hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap select-none">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="select-none">
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    {isLoading ? "Loading files..." : "No files or folders found."}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <DroppableTableRow key={row.id} row={row} handleRowDoubleClick={handleRowDoubleClick} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DragNDropUploader>
    </div>
  );
}

function DroppableTableRow({
  row,
  handleRowDoubleClick,
}: {
  row: Row<File>;
  handleRowDoubleClick: (file: File) => void;
}) {
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: `droppable-${row.id}`,
    accept: "files",
    data: { id: row.original.id },
    collisionDetector: pointerIntersection,
  });

  const { ref: draggableRef, isDragging } = useDraggable({
    id: `draggable-${row.id}`,
    type: "files",
    data: { id: row.original.id, parentId: row.original.parentId },
  });

  const isFolder = row.original.type === "folder" || row.original.mimeType.includes("folder");

  return (
    <TableRow
      className={cn(
        "h-8 rounded-md transition-all hover:bg-accent/40",
        isDragging && "z-[100] scale-x-90 rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500",
        isDropTarget && "scale-x-95 rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500"
      )}
      onDoubleClick={() => handleRowDoubleClick(row.original)}
      ref={(node: any) => {
        if (isFolder) droppableRef(node);
        draggableRef(node);
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="h-10 py-0 whitespace-nowrap">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function getModernFileIcon(mimeType?: string, filename?: string): JSX.Element {
  if (!mimeType) {
    if (filename) {
      const ext = filename.split(".").pop()?.toLowerCase();
      return getIconByExtension(ext || "");
    }
    return <FileText className="h-4 w-4 text-blue-500" />;
  }

  if (mimeType.includes("folder")) {
    return <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />;
  }
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4 text-emerald-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-4 w-4 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-4 w-4 text-amber-500" />;
  }
  if (mimeType.includes("pdf")) {
    return <PdfIcon className="h-4 w-4 text-red-500" />;
  }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  }
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    return <Presentation className="h-4 w-4 text-orange-500" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("archive")) {
    return <Archive className="h-4 w-4 text-amber-600" />;
  }
  if (mimeType.includes("javascript") || mimeType.includes("typescript") || mimeType.includes("json") || mimeType.includes("html")) {
    return <Code className="h-4 w-4 text-cyan-500" />;
  }

  return <FileIcon className="h-4 w-4 text-blue-500" />;
}

function getIconByExtension(ext: string): JSX.Element {
  switch (ext) {
    case "pdf":
      return <PdfIcon className="h-4 w-4 text-red-500" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return <ImageIcon className="h-4 w-4 text-emerald-500" />;
    case "mp4":
    case "webm":
    case "avi":
    case "mov":
      return <Video className="h-4 w-4 text-purple-500" />;
    case "mp3":
    case "wav":
    case "ogg":
      return <Music className="h-4 w-4 text-amber-500" />;
    case "zip":
    case "tar":
    case "gz":
    case "7z":
    case "rar":
      return <Archive className="h-4 w-4 text-amber-600" />;
    case "xls":
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    case "ppt":
    case "pptx":
      return <Presentation className="h-4 w-4 text-orange-500" />;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "json":
    case "html":
    case "css":
      return <Code className="h-4 w-4 text-cyan-500" />;
    default:
      return <FileText className="h-4 w-4 text-blue-500" />;
  }
}

export default FileTable;
