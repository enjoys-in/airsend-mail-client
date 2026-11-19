import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import type { Organization } from "@/app/v2/(version-2)/(home)/files/_lib/session";
import { Badge } from "@/app/v2/(version-2)/(home)/files/_components/ui/badge";

const ROLE_LABEL: Record<Organization["role"], string> = { owner: "Owner", admin: "Admin", member: "Member" };

// Storage belongs to the organization, so settings show whose storage this is and what the signed-in user may do with it.
export function OrganizationSection({ organization }: { organization: Organization | null }) {
	return (
		<Card id="organization" className="py-6">
			<CardHeader>
				<CardTitle>Organization</CardTitle>
				<CardDescription>Files are stored with your organization&apos;s own storage keys</CardDescription>
			</CardHeader>
			<CardContent className="flex items-center justify-between gap-4">
				<div>
					<p className="font-medium">{organization?.name ?? "—"}</p>
					<p className="text-muted-foreground text-sm">
						{organization?.canManageStorage
							? "You can add, change and remove the organization's storage."
							: "Only an owner or admin can change the organization's storage."}
					</p>
				</div>
				{organization && <Badge variant="secondary">{ROLE_LABEL[organization.role]}</Badge>}
			</CardContent>
		</Card>
	);
}
