import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { S3Icon, TelegramIcon } from "@/app/v2/(version-2)/(home)/files/_components/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import { S3_SERVICES } from "@/app/v2/(version-2)/(home)/files/_lib/s3-services";

export const Route = createFileRoute("/_protected/configure/storage/new/")({
	component: ChooseStorageKind,
});

const rowClass =
	"hover:bg-accent focus-visible:ring-ring flex items-center gap-3 rounded-lg border p-4 text-left transition-colors outline-none focus-visible:ring-2";

function ChooseStorageKind() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Add storage</h2>
				<p className="text-muted-foreground text-sm">Choose where your organization&apos;s files are kept.</p>
			</div>

			<Card className="py-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<S3Icon className="h-5 w-5" />
						S3-compatible storage
					</CardTitle>
					<CardDescription>A bucket you own, at Amazon or at any provider that speaks the S3 API.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-2">
					{S3_SERVICES.map(service => (
						<Link key={service.id} to="/configure/storage/new/s3" search={{ service: service.id }} className={rowClass}>
							<span className="flex min-w-0 flex-1 flex-col">
								<span className="text-sm font-medium">{service.label}</span>
								<span className="text-muted-foreground truncate text-xs">{service.description}</span>
							</span>
							<ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
						</Link>
					))}
				</CardContent>
			</Card>

			<Card className="py-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TelegramIcon className="h-5 w-5" />
						Telegram
					</CardTitle>
					<CardDescription>Keep files in a chat or channel through your own bot.</CardDescription>
				</CardHeader>
				<CardContent>
					<Link to="/configure/storage/new/telegram" className={rowClass}>
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="text-sm font-medium">Connect a Telegram chat</span>
							<span className="text-muted-foreground text-xs">Needs a bot token and the chat or channel ID</span>
						</span>
						<ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
