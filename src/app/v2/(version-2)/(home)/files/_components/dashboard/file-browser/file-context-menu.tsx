import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/context-menu";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { FILE_MENU, type FileMenuEntry } from "./file-menu-items";
import type { FileItemActions } from "./use-file-item-actions";

function MenuEntries({ entries }: { entries: FileMenuEntry[] }) {
	return entries.map((entry, i) =>
		entry === "separator" ? (
			<ContextMenuSeparator key={i} />
		) : (
			<ContextMenuItem key={entry.label} onSelect={entry.run} variant={entry.destructive ? "destructive" : "default"}>
				<entry.icon /> {entry.label}
			</ContextMenuItem>
		)
	);
}

/** Right-click menu of one file or folder (grid, list and details views). */
export function FileContextMenu({
	actions,
	refresh,
	children,
}: {
	actions: FileItemActions;
	refresh: () => void;
	children: ReactNode;
}) {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<MenuEntries entries={FILE_MENU(actions, refresh)} />
			</ContextMenuContent>
		</ContextMenu>
	);
}

/** Right-click on empty space in the file area: Refresh only (reloads the list, not the page). */
export function EmptyAreaContextMenu({ refresh, children }: { refresh: () => void; children: ReactNode }) {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<MenuEntries entries={[{ label: "Refresh", icon: RefreshCw, run: refresh }]} />
			</ContextMenuContent>
		</ContextMenu>
	);
}
