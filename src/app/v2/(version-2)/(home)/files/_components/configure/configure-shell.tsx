import { Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft, HardDrive, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/app/v2/(version-2)/(home)/files/_components/ui/badge";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Skeleton } from "@/app/v2/(version-2)/(home)/files/_components/ui/skeleton";
import { useOrganization, type OrganizationRole } from "@/app/v2/(version-2)/(home)/files/_lib/session";
import { cn } from "@/app/v2/(version-2)/(home)/files/_lib/utils";

const ROLE_LABEL: Record<OrganizationRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };

const navLink =
	"text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors";
const navLinkActive = "bg-accent text-accent-foreground";

/**
 * Frame of the /configure routes: a header with the way back to the files, the user's role in the organization, and a
 * left menu. Owners and admins get the extra "Add storage" entry; members only see where the files live.
 */
export function ConfigureShell() {
	const { organization, canManageStorage, isPending } = useOrganization();

	return (
		<div className="flex min-h-full flex-col">
			<header className="bg-background flex min-h-16 flex-wrap items-center gap-3 border-b px-4 py-3">
				<Button asChild variant="ghost" size="icon" className="h-9 w-9">
					<Link to="/dashboard">
						<ArrowLeft className="h-5 w-5" />
						<span className="sr-only">Back to files</span>
					</Link>
				</Button>
				<div className="min-w-0 flex-1">
					<h1 className="text-lg leading-tight font-semibold">Configure</h1>
					<p className="text-muted-foreground truncate text-xs">
						{organization ? `Storage for ${organization.name}` : "Storage for your organization"}
					</p>
				</div>
				{isPending ? (
					<Skeleton className="h-6 w-20 rounded-full" />
				) : (
					organization && (
						<Badge variant={canManageStorage ? "default" : "secondary"} className="gap-1">
							<ShieldCheck className="h-3 w-3" />
							{ROLE_LABEL[organization.role]}
						</Badge>
					)
				)}
			</header>

			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:flex-row md:p-6">
				<nav aria-label="Configure" className="flex shrink-0 gap-1 md:w-52 md:flex-col">
					<Link
						to="/configure/storage"
						activeOptions={{ exact: true }}
						className={navLink}
						activeProps={{ className: cn(navLink, navLinkActive), "aria-current": "page" }}
					>
						<HardDrive className="h-4 w-4" />
						Storage
					</Link>
					{canManageStorage && (
						<Link
							to="/configure/storage/new"
							className={navLink}
							activeProps={{ className: cn(navLink, navLinkActive), "aria-current": "page" }}
						>
							<Plus className="h-4 w-4" />
							Add storage
						</Link>
					)}
				</nav>

				<main className="min-w-0 flex-1">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
