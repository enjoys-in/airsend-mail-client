import { useDefaultAccountProvider } from "@nimbus/_components/providers/default-account-provider";
import { useUserInfoProvider } from "@nimbus/_components/providers/user-info-provider";
import { ConnectAccountDialog } from "@nimbus/_components/dialogs/connect-account-dialog";
import { LoadingStatePage } from "@nimbus/_components/loading-state-page";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { providerToSlug, type DriveProvider } from "@nimbus/_packages/shared";
import { Button } from "@nimbus/_components/ui/button";
import { HardDrive, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_protected/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const { error, accounts, isLoading } = useUserInfoProvider();
	const { defaultAccountId } = useDefaultAccountProvider();
	const navigate = useNavigate();
	const [isConnectOpen, setIsConnectOpen] = useState(false);

	const title = "Loading your dashboard";
	const description = "Opening your storage...";
	const errorTitle = "Error loading your dashboard";
	const errorDescription = "Please try again later.";

	// DefaultAccountProvider navigates to the default account /dashboard/:providerSlug/:accountId. When there is no
	// default yet (nothing marks one after a connect) open the first connected account instead.
	const firstAccount = accounts?.[0];
	useEffect(() => {
		if (isLoading || defaultAccountId || !firstAccount) return;
		const providerSlug = providerToSlug(firstAccount.providerId as DriveProvider);
		if (!providerSlug) return;
		navigate({
			to: "/dashboard/$providerSlug/$accountId",
			params: { providerSlug, accountId: firstAccount.accountId },
			replace: true,
		});
	}, [isLoading, defaultAccountId, firstAccount, navigate]);

	// Nothing connected yet: ask the user to add a source.
	if (!isLoading && !error && accounts && accounts.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="flex max-w-sm flex-col items-center gap-4 text-center">
					<HardDrive className="text-muted-foreground h-12 w-12" />
					<h2 className="text-lg font-semibold">No storage connected</h2>
					<p className="text-muted-foreground text-sm">
						Connect an S3-compatible bucket or a Telegram chat to start managing your files.
					</p>
					<Button onClick={() => setIsConnectOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Add a storage source
					</Button>
				</div>
				<ConnectAccountDialog open={isConnectOpen} onOpenChange={setIsConnectOpen} />
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
