import { AccountProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/account-provider";
import { DefaultAccountProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/default-account-provider";
import { UserInfoProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/user-info-provider";
import { ConfigureShell } from "@/app/v2/(version-2)/(home)/files/_components/configure/configure-shell";
import { createFileRoute } from "@tanstack/react-router";

// /configure/*: where the organization's storage is set up. The default-account provider is here for the hooks that read it
// (removing a storage account), but it only redirects from exactly /dashboard, so an owner or admin stays on this page.
export const Route = createFileRoute("/_protected/configure")({
	component: ConfigureLayout,
});

function ConfigureLayout() {
	return (
		<AccountProvider>
			<UserInfoProvider>
				<DefaultAccountProvider>
					<ConfigureShell />
				</DefaultAccountProvider>
			</UserInfoProvider>
		</AccountProvider>
	);
}
