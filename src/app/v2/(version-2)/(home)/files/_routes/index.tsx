import { createFileRoute, redirect } from "@tanstack/react-router";
import Hero from "@nimbus/_components/home/hero";
import { Suspense } from "react";

// Inside AirSend the user is already signed in, so the marketing landing page is skipped.
export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: "/dashboard" });
	},
	component: HomePage,
});

function HomePage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
				</div>
			}
		>
			<Hero />
		</Suspense>
	);
}
