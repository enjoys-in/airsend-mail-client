import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@nimbus/_components/ui/dialog";
import { AuthProviderButtons } from "@nimbus/_components/auth/shared/auth-provider-buttons";
import { useLocation } from "@tanstack/react-router";
import { useIsMounted } from "@nimbus/_hooks/useIsMounted";
import { useEffect, useState } from "react";

type SigninAccountDialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
};

// Connect a storage provider. There is no subscription gate inside AirSend.
export function SigninAccountDialog({ open, onOpenChange }: SigninAccountDialogProps) {
	const isMounted = useIsMounted();

	// Build callback URL safely after mount
	const pathname = useLocation({
		select: location => location.pathname,
	});

	const [callbackURL, setCallbackURL] = useState<string>("");

	useEffect(() => {
		if (isMounted) {
			const url = `${window.location.origin}${pathname}`;
			setCallbackURL(url);
		}
	}, [isMounted, pathname]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Sign in with an account</DialogTitle>
					<DialogDescription>Connect a storage provider to access your data</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 py-4">
					<AuthProviderButtons action="signin" callbackURL={callbackURL} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
