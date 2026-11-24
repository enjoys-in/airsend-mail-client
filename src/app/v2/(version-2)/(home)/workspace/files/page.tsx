"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  Download,
  Copy,
  Search,
  Layers,
  ListFilter,
  Table2,
  HardDrive,
  Loader2,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  downloadSharedWithMe,
  downloadWorkspaceFile,
  filesErrorMessage,
  getOrgStorage,
  getFilesOrganization,
  FILES_SETUP_PATH,
  type FilesOrganization,
  type SharedWithMe,
  type StorageAccount,
} from "../_lib/files-api";
import { formatBytes } from "../_lib/file-utils";
import { useFilePins } from "../_lib/file-pins";
import { useSharedWithMe } from "../_lib/use-shared-with-me";
import { useFilesViewMode } from "../_lib/use-files-view-mode";
import { useAutoRefresh } from "../_lib/use-auto-refresh";
import { revalidate, ROUTE_TTL_MS, AUTO_REFRESH_MS } from "../_lib/workspace-cache";
import {
  FilesAreaContextMenu,
  isFilePinned,
  type FileActions,
  type FileViewProps,
} from "../_components/files/FileContextMenu";
import { FileTypeIcon } from "../_components/files/FileTypeIcon";
import { FilesListView } from "../_components/files/FilesListView";
import { FilesGridView } from "../_components/files/FilesGridView";
import { FilesDetailsView } from "../_components/files/FilesDetailsView";
import { SharedWithMeView } from "../_components/files/SharedWithMeView";
import { FileShareDialog } from "../_components/files/FileShareDialog";
import {
  FileDetailsDialog,
  sharedFileDetails,
  workspaceFileDetails,
  type FileDetails,
} from "../_components/files/FileDetailsDialog";

const CATEGORIES = [
  { id: "all", label: "All Files" },
  { id: "pinned", label: "Pinned" },
  { id: "document", label: "Documents" },
  { id: "spreadsheet", label: "Spreadsheets" },
  { id: "media", label: "Media" },
  { id: "code", label: "Code" },
  { id: "shared", label: "Shared with me" },
];

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
  const [viewMode, setViewMode] = useFilesViewMode("list");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<WorkspaceFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareFile, setShareFile] = useState<WorkspaceFile | null>(null);
  const [details, setDetails] = useState<FileDetails | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pins (files-service files only) and files shared with me.
  const pinned = useFilePins((s) => s.pinned);
  const togglePin = useFilePins((s) => s.toggle);
  const showShared = activeCategory === "shared";
  const shared = useSharedWithMe(showShared);
  const [sharedDownloadingId, setSharedDownloadingId] = useState<string | null>(null);

  // One refresh at a time, manual or automatic; both drive the same spinner.
  const refreshingRef = useRef(false);
  const withSpinner = async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    if (refreshingRef.current) return undefined;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      return await task();
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  // Team files (the IndexedDB-cached list stays on screen), pins, and the shared list once opened. Opening the page
  // or switching team reuses data fetched in the last 30 s; it refreshes every minute (not while the tab is hidden);
  // `force` = the Refresh button.
  const refreshAll = (force = false) => {
    const team = activeTeamId ?? undefined;
    const fresh = (key: string, run: () => Promise<unknown>) => revalidate(key, run, ROUTE_TTL_MS, force);
    return Promise.allSettled([
      fresh(`files:${team ?? "all"}`, () => useChatStore.getState().fetchFiles(team)),
      fresh("file-pins", () => useFilePins.getState().load(true)),
      shared.loaded ? fresh("shared-with-me", () => shared.reload()) : null,
    ]);
  };
  useAutoRefresh(() => withSpinner(() => refreshAll()), AUTO_REFRESH_MS, activeTeamId);

  // Upload form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileChannelId, setFileChannelId] = useState<string>("none");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The organization's default storage account (undefined = still loading, null = not configured) and the user's role
  // in it: owners and admins set storage up in Files, everyone else asks them.
  const [storage, setStorage] = useState<StorageAccount | null | undefined>(undefined);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<FilesOrganization | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStorage(undefined);
    setStorageError(null);
    Promise.all([getOrgStorage(), getFilesOrganization()])
      .then(([s, org]) => {
        if (cancelled) return;
        setStorage(s);
        setOrganization(org);
      })
      .catch((err) => {
        if (cancelled) return;
        setStorage(null);
        setStorageError(filesErrorMessage(err, "Could not check your organization's storage"));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const teamUploads = pendingUploads.filter((u) => u.contextType === "team" && u.contextId === activeTeamId);
  const channelsInTeam = channels.filter((c) => isValidUUID(c.id) && (!activeTeamId || c.teamId === activeTeamId));
  const noStorage = storage === null;

  const q = searchQuery.trim().toLowerCase();
  const filteredFiles = files
    .filter((f) => {
      if (activeCategory === "pinned") {
        if (!isFilePinned(f, pinned)) return false;
      } else if (activeCategory !== "all" && f.category !== activeCategory) return false;
      if (q) {
        return (
          f.name.toLowerCase().includes(q) ||
          f.uploaderName.toLowerCase().includes(q) ||
          (f.channelName && f.channelName.toLowerCase().includes(q))
        );
      }
      return true;
    })
    // Pinned files first (stable: otherwise the server's order).
    .sort((a, b) => Number(isFilePinned(b, pinned)) - Number(isFilePinned(a, pinned)));

  const sharedItems = shared.items.filter(
    (s) => !q || `${s.name ?? ""} ${s.sharedBy ?? ""}`.toLowerCase().includes(q),
  );

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

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
    toast.success("Link copied");
  };

  // Reloads only the list on screen (team files, or files shared with me), never the page.
  const handleRefresh = () =>
    withSpinner(async () => {
      if (showShared) {
        if (await shared.reload()) toast.success("Shared files refreshed");
        else toast.error("Could not refresh the shared files");
      } else {
        await refreshAll(true);
        toast.success("Files refreshed");
      }
    });

  const handleSharedDownload = async (item: SharedWithMe) => {
    if (sharedDownloadingId) return;
    setSharedDownloadingId(item.id);
    try {
      await downloadSharedWithMe(item.id, item.name);
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not download the file"));
    } finally {
      setSharedDownloadingId(null);
    }
  };

  const fileActions: FileActions = {
    onOpen: setPreviewFile,
    onDownload: handleDownload,
    onCopyLink: handleCopyLink,
    onShare: (f) => f.fileId && setShareFile(f),
    onDetails: (f) => setDetails(workspaceFileDetails(f)),
    onTogglePin: (f) => f.fileId && void togglePin(f.fileId),
    onDelete: (f) => deleteFile(f.id),
    onRefresh: handleRefresh,
  };

  const viewProps: FileViewProps = {
    files: filteredFiles,
    actions: fileActions,
    pinned,
    downloadingId,
    copiedId,
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
              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={refreshing}
                title="Refresh (updates every minute on its own)"
                aria-label="Refresh files"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
              >
                <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              </button>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Teams shared documents, attachments and storage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
            <TabsList className="h-8 p-0.5 bg-muted/60">
              <TabsTrigger value="list" className="text-xs h-7 px-2.5 gap-1.5">
                <ListFilter className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="text-xs h-7 px-2.5 gap-1.5">
                <Layers className="size-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs h-7 px-2.5 gap-1.5">
                <Table2 className="size-3.5" />
                <span className="hidden sm:inline">Details</span>
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
          {CATEGORIES.map((cat) => (
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
            <p className="font-medium">{storageError ?? "Your organization has not set up file storage yet."}</p>
            <p className="mt-0.5 opacity-90">
              Uploads (here and in chats) go to your organization&apos;s storage.{" "}
              {organization?.canManageStorage ? (
                <>
                  Connect it in{" "}
                  <Link href={FILES_SETUP_PATH} className="font-semibold underline underline-offset-2">
                    Files
                  </Link>
                  .
                </>
              ) : (
                "Ask an organization owner or admin to set it up."
              )}
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

      {/* ── Main Files Content: Grid, List or Details (right-click empty space to refresh) ── */}
      <FilesAreaContextMenu onRefresh={handleRefresh}>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {showShared ? (
              <SharedWithMeView
                items={sharedItems}
                loading={shared.loading}
                error={shared.error}
                downloadingId={sharedDownloadingId}
                onDownload={handleSharedDownload}
                onDetails={(s) => setDetails(sharedFileDetails(s))}
                onRefresh={handleRefresh}
              />
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="size-12 text-muted-foreground opacity-30 mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  {activeCategory === "pinned" ? "No pinned files" : "No files found"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {activeCategory === "pinned"
                    ? "Right-click a file and choose Pin to keep it here."
                    : "Upload files to share with your team across channels and calls."}
                </p>
                <Button
                  size="sm"
                  onClick={() => setUploadDialogOpen(true)}
                  disabled={noStorage}
                  className="mt-4 gap-1.5 text-xs"
                >
                  <Upload className="size-3.5" />
                  Upload New File
                </Button>
              </div>
            ) : viewMode === "list" ? (
              <FilesListView {...viewProps} />
            ) : viewMode === "details" ? (
              <FilesDetailsView {...viewProps} />
            ) : (
              <FilesGridView {...viewProps} />
            )}
          </div>
        </div>
      </FilesAreaContextMenu>

      {/* ── Upload File Dialog ── */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-5 text-indigo-500" />
              Upload to Workspace Files
            </DialogTitle>
            <DialogDescription>
              Upload documents, presentations, or spreadsheets to your organization&apos;s storage.
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
              {previewFile && <FileTypeIcon category={previewFile.category} />}
              <span className="truncate">{previewFile?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {formatBytes(previewFile?.size)} • Uploaded by {previewFile?.uploaderName}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/40 bg-muted/30 p-8 flex flex-col items-center justify-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              {previewFile && <FileTypeIcon category={previewFile.category} />}
            </div>
            <h4 className="font-semibold text-sm text-foreground">{previewFile?.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Channel: #{previewFile?.channelName || "general"}
            </p>
            <p className="text-xs text-muted-foreground mt-3 bg-background border border-border/40 px-3 py-1.5 rounded-lg max-w-sm">
              Stored in your organization&apos;s storage.
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

      {/* ── Share (files-service files) & Details ── */}
      <FileShareDialog file={shareFile} onClose={() => setShareFile(null)} />
      <FileDetailsDialog details={details} onClose={() => setDetails(null)} />
    </div>
  );
}
