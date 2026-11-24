import { TableCell, TableRow } from "@/app/v2/(version-2)/(home)/files/_components/ui/table";
import { formatFileSize, type File } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { cn } from "@/app/v2/(version-2)/(home)/files/_lib/utils";
import { flexRender, type Row } from "@tanstack/react-table";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { pointerIntersection } from "@dnd-kit/collision";
import { Pin } from "lucide-react";
import { useFileItemActions, isFolderFile, type FileItemActions } from "./use-file-item-actions";
import { FileContextMenu } from "./file-context-menu";
import { FileActions } from "./file-actions";
import { getModernFileIcon } from ".";

// One file or folder in the grid, list and details views. Each item owns its actions (one set of dialogs), its
// right-click menu and drag and drop (drag onto a folder to move it there).

const DROP_RING = "z-[100] rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500";

function useFileDnd(file: File) {
	const { ref: dropRef, isDropTarget } = useDroppable({
		id: `droppable-${file.id}`,
		accept: "files",
		data: { id: file.id },
		collisionDetector: pointerIntersection,
	});
	const { ref: dragRef, isDragging } = useDraggable({
		id: `draggable-${file.id}`,
		type: "files",
		data: { id: file.id, parentId: file.parentId },
	});
	const folder = isFolderFile(file);
	const ref = (node: HTMLElement | null) => {
		if (folder) dropRef(node);
		dragRef(node);
	};
	return { ref, active: isDragging || isDropTarget };
}

interface ItemProps {
	file: File;
	refresh: () => void;
	modified: string;
}

/** Shared shell: actions, menu, drag and drop; `render` draws the item with them. */
function FileItem({
	file,
	refresh,
	render,
}: {
	file: File;
	refresh: () => void;
	render: (a: FileItemActions, dnd: ReturnType<typeof useFileDnd>) => React.ReactElement;
}) {
	const actions = useFileItemActions(file);
	const dnd = useFileDnd(file);
	return (
		<>
			<FileContextMenu actions={actions} refresh={refresh}>
				{render(actions, dnd)}
			</FileContextMenu>
			{actions.dialogs}
		</>
	);
}

const PinMark = ({ on }: { on: boolean }) =>
	on ? <Pin className="text-muted-foreground size-3 shrink-0" aria-label="Pinned" /> : null;

export function FileGridItem({ file, refresh, modified }: ItemProps) {
	return (
		<FileItem
			file={file}
			refresh={refresh}
			render={(a, dnd) => (
				<div
					ref={dnd.ref}
					onDoubleClick={a.open}
					className={cn(
						"group hover:bg-accent/50 relative flex cursor-default flex-col items-center gap-2 rounded-lg border p-3 text-center",
						dnd.active && DROP_RING
					)}
				>
					<div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
						<FileActions actions={a} />
					</div>
					<div className="flex h-14 items-center [&_svg]:!size-10">{getModernFileIcon(file.mimeType, file.name)}</div>
					<p className="flex w-full items-center justify-center gap-1 text-sm">
						<PinMark on={a.isPinned} />
						<span className="truncate">{file.name}</span>
					</p>
					<p className="text-muted-foreground text-xs">
						{a.isFolder ? modified : `${formatFileSize(Number(file.size))} · ${modified}`}
					</p>
				</div>
			)}
		/>
	);
}

export function FileListItem({ file, refresh, modified }: ItemProps) {
	return (
		<FileItem
			file={file}
			refresh={refresh}
			render={(a, dnd) => (
				<div
					ref={dnd.ref}
					onDoubleClick={a.open}
					className={cn("hover:bg-accent/50 flex h-9 items-center gap-2 rounded-md px-2", dnd.active && DROP_RING)}
				>
					{getModernFileIcon(file.mimeType, file.name)}
					<span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
					<PinMark on={a.isPinned} />
					<span className="text-muted-foreground w-28 text-right text-xs">{modified}</span>
					<span className="text-muted-foreground w-20 text-right text-xs">
						{a.isFolder ? "—" : formatFileSize(Number(file.size))}
					</span>
					<FileActions actions={a} />
				</div>
			)}
		/>
	);
}

const FIXED_COLUMNS = new Set(["tags", "size", "modifiedTime"]);

/** A row of the details table (the columns come from the table definition; the actions cell is added here). */
export function FileDetailsRow({ row, refresh }: { row: Row<File>; refresh: () => void }) {
	return (
		<FileItem
			file={row.original}
			refresh={refresh}
			render={(a, dnd) => (
				<TableRow
					ref={dnd.ref}
					onDoubleClick={a.open}
					className={cn("h-8 rounded-md transition-all hover:bg-transparent", dnd.active && DROP_RING)}
				>
					{row.getVisibleCells().map(cell => (
						<TableCell
							key={cell.id}
							className="h-10 py-0 whitespace-nowrap"
							style={{ width: FIXED_COLUMNS.has(cell.column.id) ? `${cell.column.getSize()}px` : undefined }}
						>
							{cell.column.id === "name" ? (
								<div className="flex items-center gap-1.5">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
									<PinMark on={a.isPinned} />
								</div>
							) : (
								flexRender(cell.column.columnDef.cell, cell.getContext())
							)}
						</TableCell>
					))}
					<TableCell className="h-10 w-[50px] py-0">
						<FileActions actions={a} />
					</TableCell>
				</TableRow>
			)}
		/>
	);
}
