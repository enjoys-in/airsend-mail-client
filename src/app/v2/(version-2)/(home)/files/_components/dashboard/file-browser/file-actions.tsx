// TODO: this should be more provider agnostic, especially around the folder logic

"use-client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@nimbus/_components/ui/dropdown-menu";
import { Copy, Download, ExternalLink, MoreVertical, Pin } from "lucide-react";
import { useDeleteFile, useDownloadFile, useUpdateFile } from "@nimbus/_hooks/useFileOperations";
import { useDownloadContext } from "@nimbus/_components/providers/download-provider";
import { useAccountProvider } from "@nimbus/_components/providers/account-provider";
import { RenameFileDialog } from "@nimbus/_components/dialogs/rename-file-dialog";
import { DeleteFileDialog } from "@nimbus/_components/dialogs/delete-file-dialog";
import { usePinFile } from "@nimbus/_hooks/useDriveOps";
import { Button } from "@nimbus/_components/ui/button";
import type { File } from "@nimbus/_packages/shared";
import { useState } from "react";
import { toast } from "sonner";

export function FileActions({ file, fileType }: { file: File; fileType: "file" | "folder" }) {
	const { mutate: deleteFile } = useDeleteFile();
	const { mutate: renameFile } = useUpdateFile();
	const { mutate: downloadFile } = useDownloadFile();
	const { mutate: pinFile } = usePinFile();
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
		if (!providerId) return;
		pinFile({
			fileId: file.id,
			name: file.name,
			type: fileType,
			mimeType: file.mimeType,
			provider: providerId,
		});
	};

	const handleDownloadError = (error: unknown, fileId: string) => {
		const errorMessage = error instanceof Error ? error.message : "Download failed";
		if (errorDownload) {
			errorDownload(fileId, errorMessage);
		} else {
			toast.error(errorMessage);
		}
	};

	const handleDownloadSuccess = (fileId: string) => {
		if (completeDownload) completeDownload(fileId);
	};

	const handleDownload = async () => {
		if (fileType === "folder") {
			return toast.error("Cannot download folders");
		}

		// Start download progress tracking if available
		startDownload?.(file.id, file.name);

		try {
			// A provider-supplied direct link wins; otherwise the backend streams the file.
			if (file.webContentLink) {
				window.open(file.webContentLink, "_blank");
				handleDownloadSuccess(file.id);
				return true;
			}

			downloadFile(
				{
					fileId: file.id,
					fileName: file.name,
					onProgress: progress => updateProgress?.(file.id, progress),
				},
				{
					onSuccess: () => handleDownloadSuccess(file.id),
					onError: error => handleDownloadError(error, file.id),
				}
			);
			return true;
		} catch (error) {
			handleDownloadError(error, file.id);
		}
	};

	return (
		<>
			<div className="flex w-fit items-center justify-start" onClick={e => e.stopPropagation()}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="relative h-8 w-8">
							<MoreVertical className="h-4 w-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handlePinFile} className="cursor-pointer">
							<Pin className="mr-2 h-4 w-4" />
							Pin
						</DropdownMenuItem>
						{file.webViewLink && (
							<DropdownMenuItem onClick={handleOpenInDrive} className="cursor-pointer">
								<ExternalLink className="mr-2 h-4 w-4" />
								Open
							</DropdownMenuItem>
						)}
						{file.webViewLink && (
							<DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
								<Copy className="mr-2 h-4 w-4" />
								Copy link
							</DropdownMenuItem>
						)}
						{fileType === "file" && (
							<DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
								<Download className="mr-2 h-4 w-4" />
								Download
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)} className="cursor-pointer">
							Rename
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setIsDeleteDialogOpen(true)}>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<DeleteFileDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onDelete={handleDelete}
				fileName={file.name}
				fileType={fileType}
			/>

			<RenameFileDialog
				isOpen={isRenameDialogOpen}
				onClose={() => setIsRenameDialogOpen(false)}
				onRename={handleRename}
				currentName={file.name}
				fileType={fileType}
			/>
		</>
	);
}
