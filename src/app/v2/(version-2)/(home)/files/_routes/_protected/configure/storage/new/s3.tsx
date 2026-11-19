import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { S3Icon } from "@/app/v2/(version-2)/(home)/files/_components/icons";
import { S3AccountForm } from "@/app/v2/(version-2)/(home)/files/_components/settings/s3-account-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import { DEFAULT_S3_SERVICE, S3_SERVICES, getS3Service, isS3ServiceId, type S3ServiceId } from "@/app/v2/(version-2)/(home)/files/_lib/s3-services";
import { cn } from "@/app/v2/(version-2)/(home)/files/_lib/utils";

type S3Search = { service?: S3ServiceId };

export const Route = createFileRoute("/_protected/configure/storage/new/s3")({
	validateSearch: (search: Record<string, unknown>): S3Search => ({
		service: isS3ServiceId(search.service) ? search.service : undefined,
	}),
	component: ConnectS3,
});

function ConnectS3() {
	const { service: serviceId = DEFAULT_S3_SERVICE } = Route.useSearch();
	const service = getS3Service(serviceId);
	const navigate = useNavigate();

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<Link
					to="/configure/storage/new"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					All storage types
				</Link>
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<S3Icon className="h-6 w-6" />
					Connect {service.label}
				</h2>
				<p className="text-muted-foreground text-sm">Enter the credentials of a bucket you own. They are stored encrypted.</p>
			</div>

			<div className="flex flex-wrap gap-2" role="tablist" aria-label="S3-compatible service">
				{S3_SERVICES.map(item => (
					<Link
						key={item.id}
						to="/configure/storage/new/s3"
						search={{ service: item.id }}
						replace
						role="tab"
						aria-selected={item.id === service.id}
						className={cn(
							"rounded-full border px-3 py-1 text-xs font-medium transition-colors",
							item.id === service.id ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent"
						)}
					>
						{item.label}
					</Link>
				))}
			</div>

			<Card className="py-6">
				<CardHeader>
					<CardTitle>{service.label}</CardTitle>
					<CardDescription>{service.description}</CardDescription>
				</CardHeader>
				<CardContent>
					{/* The form moves on to the new storage's files itself once the bucket is connected. */}
					<S3AccountForm
						key={service.id}
						service={service}
						onSuccess={() => undefined}
						onCancel={() => navigate({ to: "/configure/storage/new" })}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
