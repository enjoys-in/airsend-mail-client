import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { TelegramIcon } from "@/app/v2/(version-2)/(home)/files/_components/icons";
import { TelegramAccountForm } from "@/app/v2/(version-2)/(home)/files/_components/settings/telegram-account-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";

export const Route = createFileRoute("/_protected/configure/storage/new/telegram")({
	component: ConnectTelegram,
});

function ConnectTelegram() {
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
					<TelegramIcon className="h-6 w-6" />
					Connect Telegram
				</h2>
				<p className="text-muted-foreground text-sm">
					Files are kept in a Telegram chat or channel through your own bot.
				</p>
			</div>

			<Card className="py-6">
				<CardHeader>
					<CardTitle>Bot and chat</CardTitle>
					<CardDescription>Create the bot with @BotFather, then add it as an admin of the chat or channel.</CardDescription>
				</CardHeader>
				<CardContent>
					{/* The form moves on to the new storage's files itself once the chat is connected. */}
					<TelegramAccountForm onSuccess={() => undefined} onCancel={() => navigate({ to: "/configure/storage/new" })} />
				</CardContent>
			</Card>
		</div>
	);
}
