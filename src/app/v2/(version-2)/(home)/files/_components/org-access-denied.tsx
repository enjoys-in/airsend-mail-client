import { ShieldAlert } from "lucide-react";
import { Button } from "@nimbus/_components/ui/button";

type OrgAccessDeniedProps = {
	title?: string;
	message: string;
	onRetry?: () => void;
};

/** Full-page message: the account cannot use files (not in an organization, or no files scope), or the backend failed. */
export function OrgAccessDenied({ title = "Files are not available for this account", message, onRetry }: OrgAccessDeniedProps) {
	return (
		<div role="alert" className="flex min-h-screen items-center justify-center p-6">
			<div className="flex max-w-md flex-col items-center gap-4 text-center">
				<ShieldAlert className="text-muted-foreground h-12 w-12" />
				<h2 className="text-lg font-semibold">{title}</h2>
				<p className="text-muted-foreground text-sm">{message}</p>
				<div className="flex gap-2">
					{onRetry && (
						<Button variant="outline" onClick={onRetry}>
							Try again
						</Button>
					)}
					<Button asChild>
						<a href="/v2/u/mail">Back to AirSend</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
