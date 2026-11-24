import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/dialog";
import { formatFileSize, type File } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { format } from "date-fns";

interface FileDetailsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	file: File;
	isFolder: boolean;
}

const when = (iso?: string) => (iso ? format(new Date(iso), "MMM d, yyyy · HH:mm") : "—");

export function FileDetailsDialog({ isOpen, onClose, file, isFolder }: FileDetailsDialogProps) {
	const rows: [string, string][] = [
		["Name", file.name],
		["Type", isFolder ? "Folder" : file.mimeType || "Unknown"],
		["Size", isFolder ? "—" : formatFileSize(Number(file.size ?? 0))],
		["Created", when(file.createdTime)],
		["Modified", when(file.modifiedTime)],
		["Tags", file.tags?.map(t => t.name).join(", ") || "—"],
	];
	return (
		<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Details</DialogTitle>
				</DialogHeader>
				<dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
					{rows.map(([label, value]) => (
						<div key={label} className="contents">
							<dt className="text-muted-foreground">{label}</dt>
							<dd className="break-all">{value}</dd>
						</div>
					))}
				</dl>
			</DialogContent>
		</Dialog>
	);
}
