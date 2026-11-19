import { DefaultAccountProvider } from "@nimbus/_components/providers/default-account-provider";
import { UserInfoProvider } from "@nimbus/_components/providers/user-info-provider";
import { AccountProvider } from "@nimbus/_components/providers/account-provider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<AccountProvider>
			<UserInfoProvider>
				<DefaultAccountProvider>
					<Outlet />
				</DefaultAccountProvider>
			</UserInfoProvider>
		</AccountProvider>
	);
}
