import { type ComponentProps } from "react";
import { createPortal } from "react-dom";

import { Sidebar, SidebarContent, SidebarHeader } from "@/app/v2/(version-2)/(home)/files/_components/ui/sidebar";
import SidebarPinnedFiles from "@/app/v2/(version-2)/(home)/files/_components/dashboard/sidebar/sidebar-folders";
import StorageFooter from "@/app/v2/(version-2)/(home)/files/_components/dashboard/sidebar/sidebar-footer";
import UserAccount from "@/app/v2/(version-2)/(home)/files/_components/dashboard/sidebar/user-account";
// import { SearchBar } from "@/app/v2/(version-2)/(home)/files/_components/dashboard/sidebar/search-bar";
import TagMenu from "@/app/v2/(version-2)/(home)/files/_components/dashboard/sidebar/tag-menu";
import { useIsMobile } from "@/app/v2/(version-2)/(home)/files/_hooks/use-mobile";
import { useFilesSidebarSlot } from "../../../_lib/sidebar-slot";

function SidebarSections() {
	return (
		<>
			<SidebarHeader className="gap-4 p-2 pt-0">
				<UserAccount />
				{/* <SearchBar /> */}
			</SidebarHeader>

			<SidebarContent>
				{/* Notification button
				Starred Button */}

				{/* Pinned files */}
				<SidebarPinnedFiles />

				{/* Tags */}
				<TagMenu />
			</SidebarContent>

			<StorageFooter />
		</>
	);
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
	const hostSlot = useFilesSidebarSlot();
	const isMobile = useIsMobile();

	// Desktop, inside the AirSend shell: the sections live in the AirSend sidebar's panel. The wrapper
	// carries the attributes Nimbus's `Sidebar` would have put on its own root, because the menu
	// components style themselves from them. A portal keeps the app's router and query context.
	if (hostSlot && !isMobile) {
		return createPortal(
			<div
				className="group flex h-full min-h-0 w-full flex-col py-2 text-sidebar-foreground"
				data-collapsible=""
				data-side="left"
				data-slot="sidebar"
				data-state="expanded"
				data-variant="sidebar"
			>
				<SidebarSections />
			</div>,
			hostSlot,
		);
	}

	// Mobile drawer, or no AirSend panel to render into: Nimbus's own sidebar.
	return (
		<Sidebar {...props} className="px-0 py-2 dark:bg-neutral-800">
			<SidebarSections />
		</Sidebar>
	);
}
