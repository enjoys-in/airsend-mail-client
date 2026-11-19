import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/app/v2/(version-2)/(home)/files/_components/ui/sidebar";
import { Progress } from "@/app/v2/(version-2)/(home)/files/_components/ui/progress";
import { useDriveInfo } from "@/app/v2/(version-2)/(home)/files/_hooks/useDriveOps";
import { HardDrive, Moon, Settings, Sun } from "lucide-react";
import { formatFileSize } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function StorageFooter() {
	const { data, error, isError, isPending } = useDriveInfo();
	const [usedSpace, setUsedSpace] = useState<number>(0);
	const [totalSpace, setTotalSpace] = useState<number>(0);
	const [usagePercent, setUsagePercent] = useState<number>(0);
	const [isMounted, setIsMounted] = useState(false);

	// Theme belongs to AirSend (next-themes, set up by the host layout); this only reads and flips it. Nimbus used to
	// force the <html> class from localStorage on every mount, which fought the host's theme.
	const { resolvedTheme, setTheme } = useTheme();
	const theme = resolvedTheme === "dark" ? "dark" : "light";
	useEffect(() => setIsMounted(true), []);

	const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

	useEffect(() => {
		if (isError && error) {
			toast.error("Failed to load storage details.");
		}
	}, [isError, error]);

	useEffect(() => {
		if (data) {
			// Calculate percentage using the new data values to avoid race conditions
			const newUsedSpace = data.usedSpace;
			const newTotalSpace = data.totalSpace;
			const percent = Number(newTotalSpace) > 0 ? Math.floor((Number(newUsedSpace) / Number(newTotalSpace)) * 100) : 0;

			// Batch state updates to avoid race conditions
			setUsedSpace(newUsedSpace);
			setTotalSpace(newTotalSpace);
			setUsagePercent(percent);
		}
	}, [data]);

	return (
		<SidebarFooter className="flex flex-col items-start gap-2 self-stretch p-2 pb-0 transition-all duration-300 ease-linear">
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex flex-col items-start self-stretch rounded-lg border border-neutral-200 bg-neutral-200 dark:border-0 dark:border-transparent dark:bg-neutral-700">
						<div className="flex flex-col items-start gap-3 self-stretch rounded-lg bg-card p-3 shadow-sm">
							<div className="flex items-center justify-between self-stretch">
								<p className="text-sm font-medium text-neutral-800 dark:text-neutral-300">Storage Used</p>
								{isPending ? (
									<div className="h-4 w-12 animate-pulse rounded bg-neutral-300 dark:bg-neutral-500"></div>
								) : (
									<p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{usagePercent}% Used</p>
								)}
							</div>
							<Progress value={usagePercent} />
						</div>
						<div className="flex h-8 items-center justify-between self-stretch px-3">
							{isPending ? (
								<div className="h-4 w-32 animate-pulse rounded bg-neutral-300 dark:bg-neutral-500"></div>
							) : (
								<div className="flex flex-wrap items-center gap-1 text-sm font-medium text-neutral-500 dark:text-neutral-300">
									{fileSizeText(isError, usedSpace)}
									<span>of</span>
									{fileSizeText(isError, totalSpace)}
								</div>
							)}
						</div>
					</div>
				</SidebarMenuItem>
				<SidebarMenuButton
					onClick={toggleTheme}
					className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					{isMounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
					<span>Theme</span>
				</SidebarMenuButton>
				<SidebarMenuButton
					asChild
					className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					<Link to="/dashboard/settings">
						<Settings className="size-4" />
						<span>Settings</span>
					</Link>
				</SidebarMenuButton>
				<SidebarMenuButton
					asChild
					className="transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					<Link to="/configure/storage">
						<HardDrive className="size-4" />
						<span>Storage</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenu>
		</SidebarFooter>
	);
}

function fileSizeText(isError: boolean, num: number | undefined) {
	return <span>{isError || !num ? "--" : formatFileSize(num)}</span>;
}
