import { Link, createFileRoute } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";

import { useUserInfoProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/user-info-provider";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import { useOrganization } from "@/app/v2/(version-2)/(home)/files/_lib/session";

import { OrganizationSection } from "@/app/v2/(version-2)/(home)/files/_components/settings/organization-section";
import { ProfileSection } from "@/app/v2/(version-2)/(home)/files/_components/settings/profile-section";
import { SettingsHeader } from "@/app/v2/(version-2)/(home)/files/_components/settings/header";

export const Route = createFileRoute("/_protected/dashboard/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user } = useUserInfoProvider();
	const { organization, canManageStorage } = useOrganization();

	return (
		<div className="flex flex-1 flex-col">
			<SettingsHeader />
			<div className="container mx-auto w-200 flex-1 space-y-6 p-6">
				<ProfileSection name={user?.name || ""} email={user?.email || ""} previewUrl={user?.image || null} />

				<OrganizationSection organization={organization} />

				<Card className="py-6">
					<CardHeader>
						<CardTitle>Organization storage</CardTitle>
						<CardDescription>
							{canManageStorage
								? "Connect, rename or remove where your organization keeps its files."
								: "See where your organization keeps its files. Only an owner or admin can change it."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline">
							<Link to="/configure/storage">
								<HardDrive className="mr-2 h-4 w-4" />
								{canManageStorage ? "Manage storage" : "View storage"}
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
