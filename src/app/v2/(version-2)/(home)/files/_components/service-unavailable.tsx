import { RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { cn } from "@/app/v2/(version-2)/(home)/files/_lib/utils";

type ServiceUnavailableProps = {
	onRetry?: () => void;
	/** Overrides the heading; the default is the same for every "backend is down" screen. */
	title?: string;
	message?: string;
	className?: string;
};

/**
 * The state shown instead of a skeleton, an empty list or fake data when the files backend cannot be reached.
 * Fills its parent (`h-full`), so it works as a whole page or inside a pane.
 */
export function ServiceUnavailable({
	onRetry,
	title = "Something went wrong",
	message = "Service is not available right now. Please try again in a moment.",
	className,
}: ServiceUnavailableProps) {
	return (
		<div role="alert" className={cn("flex h-full min-h-64 items-center justify-center p-6", className)}>
			<div className="flex max-w-sm flex-col items-center gap-4 text-center">
				<div className="bg-destructive/10 rounded-full p-4">
					<ServerCrash className="text-destructive h-8 w-8" />
				</div>
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="text-muted-foreground text-sm">{message}</p>
				</div>
				{onRetry && (
					<Button variant="outline" onClick={onRetry}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Try again
					</Button>
				)}
			</div>
		</div>
	);
}
