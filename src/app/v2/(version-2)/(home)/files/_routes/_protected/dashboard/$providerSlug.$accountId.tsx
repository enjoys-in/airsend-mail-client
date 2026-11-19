import { ConnectAccountDialog } from "@nimbus/_components/dialogs/connect-account-dialog";
import { AccountProvider } from "@nimbus/_components/providers/account-provider";
import { SidebarInset, SidebarProvider } from "@nimbus/_components/ui/sidebar";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import DndKitProvider from "@nimbus/_components/providers/dnd-kit-provider";
import { FileTable } from "@nimbus/_components/dashboard/file-browser";
import { AppSidebar } from "@nimbus/_components/dashboard/sidebar";
import { useGetFiles } from "@nimbus/_hooks/useFileOperations";
import { Header } from "@nimbus/_components/dashboard/header";
import { Suspense } from "react";

type DashboardSearch = {
	folderId?: string;
	type?: string;
	id?: string;
	connectAccount?: boolean;
};

export const Route = createFileRoute("/_protected/dashboard/$providerSlug/$accountId")({
	component: DrivePage,
	validateSearch: (search: Record<string, unknown>): DashboardSearch => {
		return {
			folderId: (search.folderId as string) || undefined,
			type: (search.type as string) || undefined,
			id: (search.id as string) || undefined,
			connectAccount: (search.connectAccount as boolean) || undefined,
		};
	},
});

function DrivePage() {
	const { folderId, connectAccount } = Route.useSearch();
	const navigate = useNavigate({ from: "/dashboard/$providerSlug/$accountId" });
	const currentFolderId = folderId ?? "root";

	const handleConnectOpenChange = (open: boolean) => {
		navigate({
			replace: true,
			search: prev => {
				const next = { ...prev };
				if (open) {
					next.connectAccount = true;
				} else {
					delete next.connectAccount;
				}
				return next;
			},
		});
	};

	const { data, isLoading, refetch, error } = useGetFiles({
		parentId: currentFolderId,
		pageSize: 30,
		pageToken: undefined,
		// TODO: implement sorting, filtering, pagination, and a generalized web content/view interfaces
		returnedValues: ["id", "name", "mimeType", "size", "modifiedTime", "webContentLink", "webViewLink"],
	});

	return (
		<AccountProvider>
			<Suspense fallback={null}>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset className="p-1 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0">
						<DndKitProvider parentId={currentFolderId}>
							<Header />
							<FileTable files={data || []} isLoading={isLoading} refetch={refetch} error={error} />
						</DndKitProvider>
						<ConnectAccountDialog open={!!connectAccount} onOpenChange={handleConnectOpenChange} />
					</SidebarInset>
				</SidebarProvider>
			</Suspense>
		</AccountProvider>
	);
}
