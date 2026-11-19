import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/dialog";
import { UploadZone } from "@/app/v2/(version-2)/(home)/files/_components/upload/upload-zone";
import { useEffect, useState, type FormEvent } from "react";
import { useUploadFile } from "@/app/v2/(version-2)/(home)/files/_hooks/useFileOperations";
import type { UploadFileDialogProps } from "@/app/v2/(version-2)/(home)/files/_lib/types";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Loader } from "@/app/v2/(version-2)/(home)/files/_components/loader";
import { toast } from "sonner";

export function UploadFileDialog({ open, onOpenChange, parentId }: UploadFileDialogProps) {
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const { mutate: uploadFile, isPending } = useUploadFile();

	// Reset states when dialog closes
	useEffect(() => {
		if (!open) {
			setSelectedFiles(null);
			setIsUploading(false);
			setUploadProgress(0);
		}
	}, [open]);

	const handleKeyDown = async (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			await handleUploadFile(e);
		}
	};

	const handleUploadFile = async (event: FormEvent) => {
		event.preventDefault();
		if (!selectedFiles || selectedFiles.length === 0) return;

		setIsUploading(true);
		setUploadProgress(0);

		// Convert FileList to array and upload each file
		const files = Array.from(selectedFiles);
		let completedUploads = 0;
		// TODO: Consider how we want to handle errors on multifile uploads. I think we should stop all uploads before they go, but this would require validating files on our system as a batch vs as they come.
		files.forEach((file, index) => {
			uploadFile(
				{
					file,
					parentId,
					// TODO: The bar gets hung up on multi-file uploads. Make a progress bar that actually works correctly.
					// onProgress: progress => {
					// 	// Calculate overall progress across all files
					// 	const progressPerFile = Math.floor(100 / files.length);
					// 	const currentFileProgress = (progress / 100) * progressPerFile;
					// 	const previousFilesProgress = (completedUploads * 100) / files.length;
					// 	setUploadProgress(previousFilesProgress + currentFileProgress);
					// },
				},
				{
					onSuccess: () => {
						completedUploads++;

						// last file
						if (completedUploads === files.length) {
							setUploadProgress(100);
							onOpenChange(false);
							setIsUploading(false);
							toast.success(`Successfully uploaded ${files.length} ${files.length === 1 ? "file" : "files"}`);
						}
					},
					onError: error => {
						console.error("Upload error:", error);
						setIsUploading(false);
						const fileName = files[index]?.name || "file";
						const errorMessage = error.message || `Failed to upload file: ${fileName}`;
						toast.error(errorMessage);
					},
				}
			);
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Upload Files</DialogTitle>
					<DialogDescription>Click or drag and drop files below to upload.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleUploadFile}>
					<UploadZone
						onFilesSelected={files => setSelectedFiles(files as FileList)}
						isUploading={isUploading}
						uploadProgress={uploadProgress}
					/>
					<DialogFooter>
						{!isUploading && (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										onOpenChange(false);
										setSelectedFiles(null);
									}}
									className="cursor-pointer"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={!selectedFiles || selectedFiles.length === 0 || isPending}
									className="cursor-pointer"
								>
									{isPending ? (
										<Loader />
									) : (
										`Upload ${selectedFiles && selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`
									)}
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
