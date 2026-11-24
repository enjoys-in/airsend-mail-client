import { useDeleteFile, useDownloadFile, useUpdateFile } from "@/app/v2/(version-2)/(home)/files/_hooks/useFileOperations";
import { usePinFile, usePinnedFiles, useUnpinFile } from "@/app/v2/(version-2)/(home)/files/_hooks/useDriveOps";
import { useDownloadContext } from "@/app/v2/(version-2)/(home)/files/_components/providers/download-provider";
import { useAccountProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/account-provider";
import { RenameFileDialog } from "@/app/v2/(version-2)/(home)/files/_components/dialogs/rename-file-dialog";
import { DeleteFileDialog } from "@/app/v2/(version-2)/(home)/files/_components/dialogs/delete-file-dialog";
import { ShareFileDialog } from "@/app/v2/(version-2)/(home)/files/_components/dialogs/share-file-dialog";
import { FileDetailsDialog } from "@/app/v2/(version-2)/(home)/files/_components/dialogs/file-details-dialog";
import type { File } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

// Every action on one file or folder, shared by the "⋮" dropdown (file-actions.tsx) and the right-click menu
// (file-context-menu.tsx). Render `dialogs` once next to whichever menu uses it.

type DialogName = "delete" | "rename" | "share" | "details";

export const isFolderFile = (file: File) => file.type === "folder" || file.mimeType?.includes("folder");

export function useFileItemActions(file: File) {
	const isFolder = isFolderFile(file);
	const navigate = useNavigate({ from: "/dashboard/$providerSlug/$accountId" });
	const search = useSearch({ from: "/_protected/dashboard/$providerSlug/$accountId" });
	const { providerId, accountId } = useAccountProvider();
	const { mutate: deleteFile } = useDeleteFile();
	const { mutate: renameFile } = useUpdateFile();
	const { mutate: downloadFile } = useDownloadFile();
	const { mutate: pinFile } = usePinFile();
	const { mutate: unpinFile } = useUnpinFile();
	const { data: pins } = usePinnedFiles();
	const downloads = useDownloadContext();
	const [dialog, setDialog] = useState<DialogName | null>(null);

	const pin = pins?.find(p => p.fileId === file.id && p.accountId === accountId);

	const download = () => {
		if (isFolder) return void toast.error("Folders can't be downloaded");
		if (file.webContentLink) return void window.open(file.webContentLink, "_blank");
		downloads.startDownload?.(file.id, file.name);
		downloadFile(
			{ fileId: file.id, fileName: file.name, onProgress: p => downloads.updateProgress?.(file.id, p) },
			{
				onSuccess: () => downloads.completeDownload?.(file.id),
				onError: e => downloads.errorDownload?.(file.id, e instanceof Error ? e.message : "Download failed"),
			}
		);
	};

	const open = () => {
		if (isFolder) return void navigate({ search: { ...search, folderId: file.id } });
		if (file.webViewLink) return void window.open(file.webViewLink, "_blank");
		download();
	};

	const togglePin = () => {
		if (pin) return unpinFile(pin.id, { onSuccess: () => toast.success("Unpinned") });
		if (!providerId) return;
		pinFile(
			{ fileId: file.id, name: file.name, type: isFolder ? "folder" : "file", mimeType: file.mimeType, provider: providerId },
			{ onSuccess: () => toast.success("Pinned"), onError: e => toast.error(e.message) }
		);
	};

	/** The provider's own link when it has one, else a link to this item inside the app. */
	const copyLink = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("folderId", isFolder ? file.id : (search.folderId ?? "root"));
		if (!isFolder) url.searchParams.set("id", file.id);
		navigator.clipboard.writeText(file.webViewLink || url.toString()).then(
			() => toast.success("Link copied"),
			() => toast.error("Could not copy the link")
		);
	};

	const close = () => setDialog(null);
	const kind = isFolder ? "folder" : "file";
	const dialogs = (
		<>
			<DeleteFileDialog
				isOpen={dialog === "delete"}
				onClose={close}
				onDelete={async () => deleteFile({ fileId: file.id })}
				fileName={file.name}
				fileType={kind}
			/>
			<RenameFileDialog
				isOpen={dialog === "rename"}
				onClose={close}
				onRename={async name => renameFile({ fileId: file.id, name })}
				currentName={file.name}
				fileType={kind}
			/>
			{dialog === "share" && <ShareFileDialog isOpen onClose={close} fileId={file.id} fileName={file.name} />}
			<FileDetailsDialog isOpen={dialog === "details"} onClose={close} file={file} isFolder={isFolder} />
		</>
	);

	return {
		isFolder,
		isPinned: !!pin,
		open,
		download,
		togglePin,
		copyLink,
		share: () => setDialog("share"),
		details: () => setDialog("details"),
		rename: () => setDialog("rename"),
		remove: () => setDialog("delete"),
		dialogs,
	};
}

export type FileItemActions = ReturnType<typeof useFileItemActions>;
