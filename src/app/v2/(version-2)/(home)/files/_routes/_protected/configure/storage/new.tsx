import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Card, CardContent } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import { Skeleton } from "@/app/v2/(version-2)/(home)/files/_components/ui/skeleton";
import { useOrganization } from "@/app/v2/(version-2)/(home)/files/_lib/session";

export const Route = createFileRoute("/_protected/configure/storage/new")({
	component: NewStorageLayout,
});

// Connecting storage is for the organization's owner and admins. The backend enforces it too; this is the page a member
// sees when they open the address anyway.
function NewStorageLayout() {
	const { canManageStorage, isPending } = useOrganization();

	if (isPending) return <Skeleton className="h-72 w-full rounded-xl" aria-label="Loading" />;
	if (canManageStorage) return <Outlet />;

	return (
		<Card className="py-10">
			<CardContent className="flex flex-col items-center gap-4 text-center">
				<Lock className="text-muted-foreground h-12 w-12" />
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">Only an owner or admin can add storage</h2>
					<p className="text-muted-foreground max-w-md text-sm">
						Your organization&apos;s storage is managed by its owner and admins. Ask one of them to connect it or change it.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link to="/configure/storage">See the organization&apos;s storage</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
