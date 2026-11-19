import { withFilesBasePath } from "../_lib/base-path";
import { ReactQueryProvider } from "@/app/v2/(version-2)/(home)/files/_components/providers/query-provider";
import { useTheme } from "next-themes";
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { geistSans, geistMono, manrope } from "@/app/v2/(version-2)/(home)/files/_utils/fonts";
import { Toaster } from "sonner";
import { Suspense, useEffect } from "react";
import { setFilesSidebarReady } from "../_lib/sidebar-slot";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				name: "Nimbus",
				content: "File storage made simple",
			},
			{
				title: "Nimbus - Better file storage",
			},
		],
		links: [
			{
				rel: "icon",
				href: "../public/favicon.ico",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFound,
	errorComponent: RootErrorComponent,
});

function RootComponent() {
	// Tell the AirSend sidebar panel the first route has resolved, so its skeleton can go away (an empty
	// panel afterwards means "this page has no sidebar", e.g. the storage setup screen).
	const idle = useRouterState({ select: s => s.status === "idle" });
	useEffect(() => {
		if (idle) setFilesSidebarReady(true);
	}, [idle]);
	useEffect(() => () => setFilesSidebarReady(false), []);

	const { resolvedTheme } = useTheme();

	// No nested theme provider (the host's next-themes owns the <html> class) and no router / query devtools overlays
	// inside the AirSend shell. `h-full`, not `min-h-screen`: the app lives in a box below the AirSend header.
	return (
		<ReactQueryProvider>
			<div
				className={`bg-background text-foreground relative h-full ${geistSans.variable} ${geistMono.variable} ${manrope.variable}`}
			>
				<Suspense>
					<Outlet />
				</Suspense>
				<Toaster position="bottom-right" richColors theme={resolvedTheme === "light" ? "light" : "dark"} />
			</div>
		</ReactQueryProvider>
	);
}

function RootErrorComponent({ error }: { error: Error }) {
	return (
		<div className="flex h-full items-center justify-center p-4">
			<div className="max-w-md text-center">
				<h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
				<p className="text-muted-foreground mt-4">{error.message}</p>
				<div className="mt-4 space-x-2">
					<button
						onClick={() => window.location.reload()}
						className="bg-primary text-primary-foreground rounded px-4 py-2"
					>
						Reload Page
					</button>
					<a href={withFilesBasePath("/")} className="text-primary underline">
						Go Home
					</a>
				</div>
			</div>
		</div>
	);
}

function NotFound() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold">404</h1>
				<p className="text-muted-foreground mt-4 text-xl">Page not found</p>
				<a href={withFilesBasePath("/")} className="text-primary mt-6 inline-block text-lg underline">
					Return Home
				</a>
			</div>
		</div>
	);
}
