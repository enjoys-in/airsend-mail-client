import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/app/v2/(version-2)/(home)/files/_components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/app/v2/(version-2)/(home)/files/_components/ui/avatar";
import { ArrowLeft, ChevronsUpDown } from "lucide-react";
import { useSession } from "@/app/v2/(version-2)/(home)/files/_lib/session";
import Profile from "@/app/v2/(version-2)/(home)/files/_components/user-profile";

export default function UserAccount() {
	const { data: session, isPending } = useSession();

	const userName = session?.user?.name;
	const userEmail = session?.user?.email;
	// TODO: Cache the user image
	const userImage = session?.user?.image;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="flex h-10 items-center justify-between self-stretch rounded-lg py-1 pr-3 pl-2 transition-all duration-200 ease-linear hover:bg-neutral-200 dark:hover:bg-neutral-700"
						>
							{isPending ? (
								<div className="flex items-center gap-2">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarFallback className="h-8 w-8 rounded-lg bg-neutral-300 dark:bg-neutral-700" />
									</Avatar>
									<span className="text-sm leading-[normal] font-medium dark:text-neutral-200">Loading...</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Profile url={userImage || null} name={userName || ""} size="default" className="rounded-lg" />

									<span className="text-sm leading-[normal] font-medium dark:text-neutral-200">{userName}</span>
								</div>
							)}
							<ChevronsUpDown className="h-3.5 w-3.5 shrink-0" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
						<div className="px-2 py-1.5">
							<p className="text-sm font-medium dark:text-neutral-200">{userName}</p>
							<p className="text-muted-foreground truncate text-xs">{userEmail}</p>
						</div>
						<DropdownMenuSeparator />

						{/* AirSend owns sign-in and sign-out; this just returns to the mailbox. */}
						<DropdownMenuItem asChild className="cursor-pointer gap-2 px-2 py-1.5 text-sm">
							<a href="/v2/u/mail">
								<ArrowLeft className="h-4 w-4" />
								<span>Back to AirSend</span>
							</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
