import { HeaderContent } from "@/components/common/header-slot";
import { UploadButton } from "@nimbus/_components/upload-button";
// import { SidebarTrigger } from "@nimbus/_components/ui/sidebar";
import { FileBreadcrumb } from "./file-path";

export function Header() {
	// On desktop the breadcrumb and upload button live in the AirSend top bar.
	return (
		<HeaderContent
			fallback={
		<header className="bg-background">
			<div className="flex items-center justify-center gap-2.5 self-stretch py-1 pr-2 pl-6">
				{/* <SidebarTrigger className="block size-9 cursor-pointer md:hidden" /> */}
				{/* Bread Crumb */}
				<FileBreadcrumb />
				{/* Filter Button */}

				{/* Share button */}

				{/* Upload files button */}
				<UploadButton name="New" />
			</div>
		</header>
			}
		>
			<div className="flex w-full min-w-0 items-center justify-between gap-2">
				<FileBreadcrumb />
				<UploadButton name="New" />
			</div>
		</HeaderContent>
	);
}
