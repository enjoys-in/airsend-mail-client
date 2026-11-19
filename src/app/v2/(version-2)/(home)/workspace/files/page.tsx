"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  Upload,
  Download,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  ListFilter,
  HardDrive,
  Eye,
  Hash,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "../_lib/chat-store";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import type { WorkspaceFile } from "../_lib/chat-types";
import { workspaceApi, isValidUUID } from "../_lib/api";
import {
  downloadWorkspaceFile,
  filesErrorMessage,
  getTeamStorage,
  type TeamStorage,
} from "../_lib/files-api";
import { formatBytes } from "../_lib/file-utils";
import { settingsPath } from "../_lib/use-access";

export default function FilesPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Workspace Files">
      <FilesHubContent />
    </WorkspaceErrorBoundary>
  );
}

function FilesHubContent() {
  const {
    files,
    deleteFile,
    channels,
    activeTeamId,
    currentUserId,
    uploadTeamFile,
    pendingUploads,
    cancelUpload,
    dismissUpload,
  } = useChatStore();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<WorkspaceFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileChannelId, setFileChannelId] = useState<string>("none");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The storage account the team's workspace uploads go to (undefined = still loading, null = not configured)
  const [storage, setStorage] = useState<TeamStorage | null | undefined>(undefined);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTeamId || !isValidUUID(activeTeamId)) {
      setStorage(undefined);
      return;
    }
    let cancelled = false;
    setStorage(undefined);
    setStorageError(null);
    getTeamStorage(activeTeamId)
      .then((s) => !cancelled && setStorage(s))
      .catch((err) => {
        if (cancelled) return;
        setStorage(null);
        setStorageError(filesErrorMessage(err, "Could not check this team's storage"));
      });
    return () => {
      cancelled = true;
    };
  }, [activeTeamId]);

  const teamUploads = pendingUploads.filter((u) => u.contextType === "team" && u.contextId === activeTeamId);
  const channelsInTeam = channels.filter((c) => isValidUUID(c.id) && (!activeTeamId || c.teamId === activeTeamId));
  const noStorage = storage === null;

  const filteredFiles = files.filter((f) => {
    if (activeCategory !== "all" && f.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.uploaderName.toLowerCase().includes(q) ||
        (f.channelName && f.channelName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const getFileIcon = (category: WorkspaceFile["category"]) => {
    switch (category) {
      case "document":
        return <FileText className="size-5 text-blue-500" />;
      case "spreadsheet":
        return <FileSpreadsheet className="size-5 text-emerald-500" />;
      case "media":
        return <ImageIcon className="size-5 text-purple-500" />;
      case "code":
        return <FileCode className="size-5 text-amber-500" />;
      case "archive":
        return <FileArchive className="size-5 text-rose-500" />;
      default:
        return <FileText className="size-5 text-slate-500" />;
    }
  };

  // Bytes go to the files service first; the workspace server then only stores the reference (file id + metadata).
  const handleUploadSubmit = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    const ok = await uploadTeamFile(selectedFile, { channelId: fileChannelId === "none" ? undefined : fileChannelId });
    setIsUploading(false);
    if (ok) {
      toast.success(`${selectedFile.name} uploaded`);
      setSelectedFile(null);
      setFileChannelId("none");
      setUploadDialogOpen(false);
    }
  };

  // Files in the files service download by file id; older files (no file id) use the workspace server's URL.
  const handleDownload = async (file: WorkspaceFile) => {
    if (downloadingId) return;
    if (!file.fileId) {
      window.open(file.url || workspaceApi.getFileDownloadUrl(file.id), "_blank", "noopener,noreferrer");
      return;
    }
    setDownloadingId(file.id);
    try {
      await downloadWorkspaceFile(file.fileId, file.name);
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not download the file"));
    } finally {
      setDownloadingId(null);
    }
  };

  // Files stored by the workspace server have a stable URL to copy; files-service files are private (no public link).
  const handleCopyLink = (file: WorkspaceFile) => {
    if (file.fileId) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}${file.url}` : file.url;
    navigator.clipboard?.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FolderOpen className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Files & Cloud Storage
              <Badge variant="outline" className="text-[11px] font-normal border-border/60">
                {files.length} documents
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Teams shared documents, attachments and storage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList className="h-8 p-0.5 bg-muted/60">
              <TabsTrigger value="list" className="text-xs h-7 px-2.5 gap-1.5">
                <ListFilter className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="text-xs h-7 px-2.5 gap-1.5">
                <Layers className="size-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            disabled={noStorage}
            className="gap-1.5 text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Upload className="size-3.5" />
            Upload File
          </Button>
        </div>
      </div>

      {/* ── Storage Status & Categories Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/40 px-4 md:px-6 py-2.5 bg-muted/20">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Files" },
            { id: "document", label: "Documents" },
            { id: "spreadsheet", label: "Spreadsheets" },
            { id: "media", label: "Media" },
            { id: "code", label: "Code" },
          ].map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={activeCategory === cat.id ? "default" : "ghost"}
              onClick={() => setActiveCategory(cat.id)}
              className="h-7 text-xs px-2.5"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="size-3.5 text-primary" />
            <span>
              {formatBytes(totalBytes)} used
              {storage ? ` · ${storage.nickname || storage.providerId}` : ""}
            </span>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      {/* ── Storage not configured ── */}
      {noStorage && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 md:mx-6">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{storageError ?? "This team has no storage connected yet."}</p>
            <p className="mt-0.5 opacity-90">
              Uploads (here and in chats) need a storage account. A team owner or admin can connect one in{" "}
              {activeTeamId ? (
                <Link href={settingsPath.team(activeTeamId, "storage")} className="font-semibold underline underline-offset-2">
                  team settings → Storage
                </Link>
              ) : (
                "team settings → Storage"
              )}
              .
            </p>
          </div>
        </div>
      )}

      {/* ── Files uploading to the files service ── */}
      {teamUploads.length > 0 && (
        <div className="mx-4 mt-3 space-y-1.5 md:mx-6">
          {teamUploads.map((u) => (
            <div
              key={u.id}
              className={
                u.status === "error"
                  ? "flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive"
                  : "flex items-center gap-2 rounded-md border border-border/50 bg-accent/40 px-3 py-1.5 text-xs"
              }
            >
              {u.status === "error" ? <AlertTriangle className="size-3.5 shrink-0" /> : <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {u.name} <span className="font-normal opacity-70">· {formatBytes(u.size)}</span>
                </p>
                {u.status === "error" ? (
                  <p className="truncate text-[11px]">{u.error ?? "Upload failed"}</p>
                ) : (
                  <Progress value={u.progress} className="mt-1 h-1" />
                )}
              </div>
              <button
                onClick={() => (u.status === "error" ? dismissUpload(u.id) : cancelUpload(u.id))}
                className="shrink-0 opacity-70 hover:opacity-100"
                aria-label={u.status === "error" ? "Dismiss" : "Cancel upload"}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Files Content: List or Grid ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="size-12 text-muted-foreground opacity-30 mb-2" />
              <p className="text-xs font-semibold text-foreground">No files found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Upload files to share with your team across channels and calls.
              </p>
              <Button size="sm" onClick={() => setUploadDialogOpen(true)} disabled={noStorage} className="mt-4 gap-1.5 text-xs">
                <Upload className="size-3.5" />
                Upload New File
              </Button>
            </div>
          ) : viewMode === "list" ? (
            /* Table / List View */
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/40 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6 sm:col-span-5">Name</div>
                <div className="col-span-3 sm:col-span-2 hidden sm:block">Channel</div>
                <div className="col-span-3 sm:col-span-2">Uploaded By</div>
                <div className="col-span-3 sm:col-span-2">Size</div>
                <div className="col-span-3 sm:col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border/30">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-accent/30 transition-colors text-xs"
                  >
                    {/* Name */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/60">
                        {getFileIcon(file.category)}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="font-medium text-foreground hover:text-primary transition-colors text-left truncate block max-w-full"
                        >
                          {file.name}
                        </button>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {file.extension}
                        </span>
                      </div>
                    </div>

                    {/* Channel */}
                    <div className="col-span-3 sm:col-span-2 hidden sm:flex items-center gap-1 text-muted-foreground truncate">
                      {file.channelName && (
                        <span className="bg-accent/60 px-1.5 py-0.5 rounded text-[11px]">
                          #{file.channelName}
                        </span>
                      )}
                    </div>

                    {/* Uploader */}
                    <div className="col-span-3 sm:col-span-2 flex items-center gap-2 text-muted-foreground truncate">
                      <Avatar className="size-5 shrink-0">
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                          {(file.uploaderName || file.uploadedBy || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{file.uploaderName}</span>
                    </div>

                    {/* Size */}
                    <div className="col-span-3 sm:col-span-2 text-muted-foreground text-[11px]">
                      {formatBytes(file.size)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file)}
                        disabled={downloadingId === file.id}
                        className="size-7"
                        title="Download"
                      >
                        {downloadingId === file.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                      </Button>
                      {!file.fileId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(file)}
                          className="size-7"
                          title="Copy file link"
                        >
                          {copiedId === file.id ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewFile(file)}
                        className="size-7"
                        title="Preview"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFile(file.id)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                        title="Delete file"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Grid Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group rounded-xl border border-border/40 bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-accent/60">
                      {getFileIcon(file.category)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFile(file.id)}
                      className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>

                  <div>
                    <h4
                      onClick={() => setPreviewFile(file)}
                      className="text-xs font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                    >
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatBytes(file.size)} • {file.uploaderName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">#{file.channelName || "general"}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      className="h-6 text-[10px] px-2 gap-1"
                    >
                      {downloadingId === file.id ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Upload File Dialog ── */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-5 text-indigo-500" />
              Upload to Workspace Files
            </DialogTitle>
            <DialogDescription>
              Upload documents, presentations, or spreadsheets to your team storage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>File</Label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/60 px-4 py-6 text-center text-xs transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <Upload className="size-5 text-muted-foreground" />
                {selectedFile ? (
                  <>
                    <span className="max-w-full truncate font-medium text-foreground">{selectedFile.name}</span>
                    <span className="text-muted-foreground">{formatBytes(selectedFile.size)} · click to change</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Click to choose a file</span>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <Label>Channel (optional)</Label>
              <Select value={fileChannelId} onValueChange={setFileChannelId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No channel</SelectItem>
                  {channelsInTeam.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      #{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || isUploading || noStorage}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isUploading && <Loader2 className="size-3.5 animate-spin" />}
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── File Preview Dialog ── */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 truncate pr-6">
              {previewFile && getFileIcon(previewFile.category)}
              <span className="truncate">{previewFile?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {formatBytes(previewFile?.size)} • Uploaded by {previewFile?.uploaderName}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/40 bg-muted/30 p-8 flex flex-col items-center justify-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              {previewFile && getFileIcon(previewFile.category)}
            </div>
            <h4 className="font-semibold text-sm text-foreground">{previewFile?.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Channel: #{previewFile?.channelName || "general"}
            </p>
            <p className="text-xs text-muted-foreground mt-3 bg-background border border-border/40 px-3 py-1.5 rounded-lg max-w-sm">
              Stored in your team&apos;s connected storage.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {previewFile && (
              <Button
                variant="outline"
                onClick={() => handleDownload(previewFile)}
                disabled={downloadingId === previewFile.id}
                className="gap-1.5"
              >
                {downloadingId === previewFile.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                Download
              </Button>
            )}
            {previewFile && !previewFile.fileId && (
              <Button
                variant="outline"
                onClick={() => handleCopyLink(previewFile)}
                className="gap-1.5"
              >
                <Copy className="size-3.5" />
                Copy Link
              </Button>
            )}
            <Button onClick={() => setPreviewFile(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
