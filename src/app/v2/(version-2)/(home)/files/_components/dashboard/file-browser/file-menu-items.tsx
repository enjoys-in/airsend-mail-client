import { Copy, Download, ExternalLink, Info, Pencil, Pin, PinOff, RefreshCw, Share2, Trash2 } from "lucide-react";
import type { FileItemActions } from "./use-file-item-actions";

// One list of menu items for both the "⋮" dropdown and the right-click menu, so they never drift apart.

export type FileMenuEntry =
	| "separator"
	| { label: string; icon: typeof Copy; run: () => void; destructive?: boolean };

export function FILE_MENU(a: FileItemActions, refresh?: () => void): FileMenuEntry[] {
	const entries: (FileMenuEntry | false)[] = [
		{ label: a.isFolder ? "Open" : "Open / Preview", icon: ExternalLink, run: a.open },
		!a.isFolder && { label: "Download", icon: Download, run: a.download },
		"separator",
		{ label: a.isPinned ? "Unpin" : "Pin", icon: a.isPinned ? PinOff : Pin, run: a.togglePin },
		!a.isFolder && { label: "Share…", icon: Share2, run: a.share },
		{ label: "Copy link", icon: Copy, run: a.copyLink },
		{ label: "Details", icon: Info, run: a.details },
		"separator",
		{ label: "Rename", icon: Pencil, run: a.rename },
		{ label: "Delete", icon: Trash2, run: a.remove, destructive: true },
		!!refresh && "separator",
		!!refresh && { label: "Refresh", icon: RefreshCw, run: refresh },
	];
	return entries.filter((e): e is FileMenuEntry => e !== false);
}
