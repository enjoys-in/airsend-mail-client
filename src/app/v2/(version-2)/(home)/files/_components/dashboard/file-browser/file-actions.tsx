"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/dropdown-menu";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { MoreVertical } from "lucide-react";
import { FILE_MENU } from "./file-menu-items";
import type { FileItemActions } from "./use-file-item-actions";

/** The "⋮" button of a file: the same items as its right-click menu. The item renders `actions.dialogs`. */
export function FileActions({ actions }: { actions: FileItemActions }) {
	return (
		<div className="flex w-fit items-center justify-start" onClick={e => e.stopPropagation()}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="relative h-8 w-8">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{FILE_MENU(actions).map((entry, i) =>
						entry === "separator" ? (
							<DropdownMenuSeparator key={i} />
						) : (
							<DropdownMenuItem
								key={entry.label}
								onClick={entry.run}
								variant={entry.destructive ? "destructive" : "default"}
								className="cursor-pointer"
							>
								<entry.icon /> {entry.label}
							</DropdownMenuItem>
						)
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
