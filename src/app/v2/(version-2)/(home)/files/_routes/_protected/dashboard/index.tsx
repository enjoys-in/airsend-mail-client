import { useUserInfoProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/user-info-provider";
import { LoadingStatePage } from "@/app/v2/(version-2)/(home)/files/_components/loading-state-page";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { useOrganization } from "@/app/v2/(version-2)/(home)/files/_lib/session";
import { HardDrive, Plus } from "lucide-react";

export const Route = createFileRoute("/_protected/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { error, accounts, isLoading, refreshAccounts } = useUserInfoProvider();
	const { canManageStorage } = useOrganization();

	const title = "Loading your dashboard";
	const description = "Opening your organization's storage...";
	const errorTitle = "Error loading your dashboard";
	const errorDescription = "Please try again later.";

	// DefaultAccountProvider opens the organization's default storage as soon as there is one. With none, owners and admins
	// set it up here; everyone else is told whom to ask.
	if (!isLoading && !error && accounts && accounts.length === 0) {
		return (
			<div className="flex h-full items-center justify-center p-6">
				<div className="flex max-w-sm flex-col items-center gap-4 text-center">
					<HardDrive className="text-muted-foreground h-12 w-12" />
					{canManageStorage ? (
						<>
							<h2 className="text-lg font-semibold">Connect your organization&apos;s storage</h2>
							<p className="text-muted-foreground text-sm">
								Files are stored in your organization&apos;s own S3-compatible bucket or Telegram chat. Add it once and everyone in
								the organization uses it.
							</p>
							<Button asChild>
								<Link to="/configure/storage/new">
									<Plus className="mr-2 h-4 w-4" />
									Add storage
								</Link>
							</Button>
						</>
					) : (
						<>
							<h2 className="text-lg font-semibold">No storage yet</h2>
							<p className="text-muted-foreground text-sm">
								Your organization has not connected storage yet. Ask an owner or admin.
							</p>
							<Button asChild variant="outline">
								<Link to="/configure/storage">See storage details</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		);
	}

	return (
		<LoadingStatePage
			error={error}
			onRetry={() => void refreshAccounts()}
			title={title}
			description={description}
			errorTitle={errorTitle}
			errorDescription={errorDescription}
		/>
	);
}
