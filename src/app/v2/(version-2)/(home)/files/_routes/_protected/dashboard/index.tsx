import { useUserInfoProvider } from "@nimbus/_components/providers/user-info-provider";
import { ConnectAccountDialog } from "@nimbus/_components/dialogs/connect-account-dialog";
import { LoadingStatePage } from "@nimbus/_components/loading-state-page";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@nimbus/_components/ui/button";
import { useOrganization } from "@nimbus/_lib/session";
import { HardDrive, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_protected/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { error, accounts, isLoading } = useUserInfoProvider();
	const { canManageStorage } = useOrganization();
	const [isConnectOpen, setIsConnectOpen] = useState(false);

	const title = "Loading your dashboard";
	const description = "Opening your organization's storage...";
	const errorTitle = "Error loading your dashboard";
	const errorDescription = "Please try again later.";

	// DefaultAccountProvider opens the organization's default storage as soon as there is one. With none, owners and admins
	// set it up here; everyone else is told whom to ask.
	if (!isLoading && !error && accounts && accounts.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="flex max-w-sm flex-col items-center gap-4 text-center">
					<HardDrive className="text-muted-foreground h-12 w-12" />
					{canManageStorage ? (
						<>
							<h2 className="text-lg font-semibold">Connect your organization&apos;s storage</h2>
							<p className="text-muted-foreground text-sm">
								Files are stored in your organization&apos;s own S3-compatible bucket or Telegram chat. Add it once and everyone in
								the organization uses it.
							</p>
							<Button onClick={() => setIsConnectOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Add storage
							</Button>
						</>
					) : (
						<>
							<h2 className="text-lg font-semibold">No storage yet</h2>
							<p className="text-muted-foreground text-sm">
								Your organization has not connected storage yet. Ask an owner or admin.
							</p>
						</>
					)}
				</div>
				{canManageStorage && <ConnectAccountDialog open={isConnectOpen} onOpenChange={setIsConnectOpen} />}
			</div>
		);
	}

	return (
		<LoadingStatePage
			error={error}
			title={title}
			description={description}
			errorTitle={errorTitle}
			errorDescription={errorDescription}
		/>
	);
}
