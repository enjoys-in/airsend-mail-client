import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, HardDrive, Minus, Plus } from "lucide-react";

import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import { Skeleton } from "@/app/v2/(version-2)/(home)/files/_components/ui/skeleton";
import { OrgAccessDenied } from "@/app/v2/(version-2)/(home)/files/_components/org-access-denied";
import { OrgStorageSection } from "@/app/v2/(version-2)/(home)/files/_components/settings/org-storage-section";
import { useUserInfoProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/user-info-provider";
import { useStorageActions } from "@/app/v2/(version-2)/(home)/files/_hooks/useStorageActions";
import { useOrganization } from "@/app/v2/(version-2)/(home)/files/_lib/session";

export const Route = createFileRoute("/_protected/configure/storage/")({
	component: StoragePage,
});

/** What each kind of member can do with the organization's storage. Mirrors the backend's rules. */
const CAPABILITIES: { label: string; managers: boolean }[] = [
	{ label: "Browse and upload files in the default storage", managers: false },
	{ label: "See which storage the organization uses", managers: false },
	{ label: "Connect S3-compatible or Telegram storage", managers: true },
	{ label: "Rename storage and choose the default", managers: true },
	{ label: "Remove storage", managers: true },
];

function StoragePage() {
	const { accounts, error, isLoading, refreshAccounts } = useUserInfoProvider();
	const { canManageStorage, organization } = useOrganization();
	const { isSettingDefault, disconnect, makeDefault, rename } = useStorageActions();

	if (error) {
		return (
			<OrgAccessDenied
				title="Couldn't load the storage"
				message={error.message || "The files service could not be reached."}
				onRetry={() => void refreshAccounts()}
			/>
		);
	}

	if (isLoading || !accounts) return <StoragePageSkeleton />;

	return (
		<div className="space-y-6">
			<AccessCard canManage={canManageStorage} role={organization?.role} />

			{accounts.length === 0 ? (
				<EmptyStorage canManage={canManageStorage} />
			) : (
				<OrgStorageSection
					accounts={accounts}
					canManage={canManageStorage}
					isSettingDefault={isSettingDefault}
					onDisconnect={disconnect}
					onSetDefault={makeDefault}
					onUpdateAccount={rename}
				/>
			)}
		</div>
	);
}

function AccessCard({ canManage, role }: { canManage: boolean; role?: string }) {
	return (
		<Card className="py-6">
			<CardHeader>
				<CardTitle>{canManage ? "You manage this organization's storage" : "You use this organization's storage"}</CardTitle>
				<CardDescription>
					{canManage
						? `As ${role === "owner" ? "the owner" : "an admin"}, you decide where everyone's files are kept.`
						: "An owner or admin decides where files are kept. Ask them if you need it changed."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="space-y-2 text-sm">
					{CAPABILITIES.map(item => {
						const allowed = !item.managers || canManage;
						return (
							<li key={item.label} className={allowed ? "flex items-center gap-2" : "text-muted-foreground flex items-center gap-2"}>
								{allowed ? <Check className="h-4 w-4 text-green-500" /> : <Minus className="h-4 w-4" />}
								<span>{item.label}</span>
								{!allowed && <span className="text-xs">(owner or admin)</span>}
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}

function EmptyStorage({ canManage }: { canManage: boolean }) {
	return (
		<Card className="py-10">
			<CardContent className="flex flex-col items-center gap-4 text-center">
				<HardDrive className="text-muted-foreground h-12 w-12" />
				{canManage ? (
					<>
						<div className="space-y-1">
							<h2 className="text-lg font-semibold">Connect your organization&apos;s storage</h2>
							<p className="text-muted-foreground max-w-md text-sm">
								Files are kept in your organization&apos;s own S3-compatible bucket or Telegram chat. Add it once and everyone in
								the organization uses it.
							</p>
						</div>
						<Button asChild>
							<Link to="/configure/storage/new">
								<Plus className="mr-2 h-4 w-4" />
								Add storage
							</Link>
						</Button>
					</>
				) : (
					<div className="space-y-1">
						<h2 className="text-lg font-semibold">No storage yet</h2>
						<p className="text-muted-foreground max-w-md text-sm">
							Your organization has not connected storage yet. Ask an owner or admin to set it up.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function StoragePageSkeleton() {
	return (
		<div className="space-y-6" aria-busy="true" aria-label="Loading storage">
			<Skeleton className="h-52 w-full rounded-xl" />
			<Skeleton className="h-64 w-full rounded-xl" />
		</div>
	);
}
