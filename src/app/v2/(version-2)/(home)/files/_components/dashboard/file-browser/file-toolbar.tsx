import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { cn } from "@/app/v2/(version-2)/(home)/files/_lib/utils";
import { LayoutGrid, List, RefreshCw, Rows3, Users } from "lucide-react";
import { useState } from "react";

// View switch (grid / list / details, remembered per browser), Refresh and "Shared with me".

export type FileViewMode = "grid" | "list" | "details";

const KEY = "files:view-mode";
const MODES: { mode: FileViewMode; label: string; icon: typeof List }[] = [
	{ mode: "grid", label: "Grid", icon: LayoutGrid },
	{ mode: "list", label: "List", icon: List },
	{ mode: "details", label: "Details", icon: Rows3 },
];

function readMode(): FileViewMode {
	try {
		const saved = window.localStorage.getItem(KEY);
		return MODES.some(m => m.mode === saved) ? (saved as FileViewMode) : "details";
	} catch {
		return "details";
	}
}

export function useFileViewMode() {
	const [mode, setMode] = useState<FileViewMode>(readMode);
	const change = (next: FileViewMode) => {
		setMode(next);
		try {
			window.localStorage.setItem(KEY, next);
		} catch {
			// private mode: the choice just isn't remembered
		}
	};
	return [mode, change] as const;
}

interface FileToolbarProps {
	mode: FileViewMode;
	onMode: (mode: FileViewMode) => void;
	onRefresh: () => void;
	refreshing: boolean;
	onSharedWithMe: () => void;
}

export function FileToolbar({ mode, onMode, onRefresh, refreshing, onSharedWithMe }: FileToolbarProps) {
	return (
		<div className="flex items-center justify-end gap-1 px-2 pb-1">
			<Button variant="ghost" size="sm" onClick={onSharedWithMe}>
				<Users /> Shared with me
			</Button>
			<Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh" disabled={refreshing}>
				<RefreshCw className={cn(refreshing && "animate-spin")} />
			</Button>
			<div className="flex rounded-md border p-0.5">
				{MODES.map(({ mode: m, label, icon: Icon }) => (
					<Button
						key={m}
						variant={m === mode ? "secondary" : "ghost"}
						size="icon"
						className="size-7"
						onClick={() => onMode(m)}
						title={label}
						aria-pressed={m === mode}
					>
						<Icon />
					</Button>
				))}
			</div>
		</div>
	);
}
