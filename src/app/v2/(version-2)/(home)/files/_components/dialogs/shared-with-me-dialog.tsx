import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/dialog";
import { getModernFileIcon } from "@/app/v2/(version-2)/(home)/files/_components/dashboard/file-browser";
import { useSharedWithMe } from "@/app/v2/(version-2)/(home)/files/_hooks/useShares";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { formatFileSize } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";

/** Files other people shared with me (from the Files app and from workspace chats and teams). */
export function SharedWithMeDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const { list, download } = useSharedWithMe(isOpen);
	const items = list.data ?? [];
	return (
		<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between pr-6">
						Shared with me
						<Button variant="ghost" size="icon" onClick={() => void list.refetch()} title="Refresh">
							<RefreshCw className={list.isFetching ? "animate-spin" : undefined} />
						</Button>
					</DialogTitle>
					<DialogDescription>Files people in your organization shared with you.</DialogDescription>
				</DialogHeader>
				<div className="max-h-[60vh] space-y-1 overflow-y-auto">
					{list.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
					{list.error && <p className="text-destructive text-sm">{list.error.message}</p>}
					{!list.isLoading && !list.error && !items.length && (
						<p className="text-muted-foreground text-sm">Nothing has been shared with you yet.</p>
					)}
					{items.map(item => (
						<div key={item.id} className="hover:bg-accent/50 flex items-center gap-2 rounded-md px-2 py-1.5">
							{getModernFileIcon(item.mimeType, item.name)}
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm">{item.name}</p>
								<p className="text-muted-foreground text-xs">
									{formatFileSize(item.size)} · {item.sharedBy} · {format(new Date(item.createdAt), "MMM d, yyyy")}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								title="Download"
								disabled={download.isPending && download.variables?.id === item.id}
								onClick={() => download.mutate(item)}
							>
								<Download />
							</Button>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
