import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@nimbus/_components/ui/dialog";
import { TelegramAccountForm } from "@nimbus/_components/settings/telegram-account-form";
import { S3AccountForm } from "@nimbus/_components/settings/s3-account-form";
import { S3Icon, TelegramIcon } from "@nimbus/_components/icons";
import { Button } from "@nimbus/_components/ui/button";
import { useEffect, useState } from "react";

type ViewMode = "select" | "s3" | "telegram";

type ConnectAccountDialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
};

// Connect a storage account: an S3-compatible bucket, or a Telegram chat used through a bot.
export function ConnectAccountDialog({ open, onOpenChange }: ConnectAccountDialogProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("select");

	// Start from the choice again whenever the dialog is reopened
	useEffect(() => {
		if (!open) setViewMode("select");
	}, [open]);

	const close = () => onOpenChange?.(false);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showBackButton={viewMode !== "select"} onBack={() => setViewMode("select")}>
				{viewMode === "select" && (
					<>
						<DialogHeader>
							<DialogTitle>Add a storage source</DialogTitle>
							<DialogDescription>Choose where your files are stored</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-3 py-2">
							<Button variant="outline" className="h-14 justify-start gap-3" onClick={() => setViewMode("s3")}>
								<S3Icon className="h-6 w-6" />
								<span className="flex flex-col items-start">
									<span className="font-medium">S3-compatible storage</span>
									<span className="text-muted-foreground text-xs font-normal">AWS S3, MinIO, Cloudflare R2, Spaces...</span>
								</span>
							</Button>
							<Button variant="outline" className="h-14 justify-start gap-3" onClick={() => setViewMode("telegram")}>
								<TelegramIcon className="h-6 w-6" />
								<span className="flex flex-col items-start">
									<span className="font-medium">Telegram</span>
									<span className="text-muted-foreground text-xs font-normal">Keep files in a chat or channel through a bot</span>
								</span>
							</Button>
						</div>
					</>
				)}

				{viewMode === "s3" && (
					<>
						<DialogHeader>
							<DialogTitle>Connect S3-compatible storage</DialogTitle>
							<DialogDescription>Enter the credentials of a bucket you own</DialogDescription>
						</DialogHeader>
						<S3AccountForm onSuccess={close} onCancel={() => setViewMode("select")} />
					</>
				)}

				{viewMode === "telegram" && (
					<>
						<DialogHeader>
							<DialogTitle>Connect Telegram</DialogTitle>
							<DialogDescription>Files are kept in a Telegram chat or channel through your own bot</DialogDescription>
						</DialogHeader>
						<TelegramAccountForm onSuccess={close} onCancel={() => setViewMode("select")} />
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
