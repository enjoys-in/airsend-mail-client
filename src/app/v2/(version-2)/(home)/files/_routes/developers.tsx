import { withFilesBasePath } from "../_lib/base-path";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@nimbus/_packages/auth/auth-client";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/developers")({
	component: DebugPage,
});

function DebugPage() {
	const [authState, setAuthState] = useState<any>(null);
	const [authError, setAuthError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const session = await authClient.getSession();
				setAuthState(session);
			} catch (error) {
				setAuthError(error instanceof Error ? error.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};
		checkAuth();
	}, []);

	return (
		<div className="bg-background min-h-screen p-8">
			<div className="mx-auto max-w-4xl space-y-6">
				<div className="border-border bg-card rounded-lg border p-6">
					<h1 className="text-3xl font-bold">Debug Information</h1>
					<p className="text-muted-foreground mt-2">TanStack Router + Vite Migration Debug Page</p>
				</div>

				{/* Router Status */}
				<div className="border-border bg-card rounded-lg border p-6">
					<h2 className="text-xl font-semibold">✅ Router Status</h2>
					<p className="text-muted-foreground mt-2">If you can see this page, TanStack Router is working correctly!</p>
					<div className="mt-4 space-y-2">
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">Current Path:</span>
							<code className="bg-muted rounded px-2 py-1 text-sm">{window.location.pathname}</code>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">Search:</span>
							<code className="bg-muted rounded px-2 py-1 text-sm">{window.location.search || "(none)"}</code>
						</div>
					</div>
				</div>

				{/* Authentication Status */}
				<div className="border-border bg-card rounded-lg border p-6">
					<h2 className="text-xl font-semibold">🔐 Authentication Status</h2>
					{loading ? (
						<p className="text-muted-foreground mt-2">Checking authentication...</p>
					) : authError ? (
						<div className="mt-4">
							<p className="text-red-600">Error: {authError}</p>
						</div>
					) : (
						<div className="mt-4 space-y-2">
							<div className="flex items-center gap-2">
								<span className="font-mono text-sm">Authenticated:</span>
								<code className="bg-muted rounded px-2 py-1 text-sm">{authState?.user ? "Yes" : "No"}</code>
							</div>
							{authState?.user && (
								<>
									<div className="flex items-center gap-2">
										<span className="font-mono text-sm">User Email:</span>
										<code className="bg-muted rounded px-2 py-1 text-sm">{authState.user.email}</code>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-mono text-sm">User Name:</span>
										<code className="bg-muted rounded px-2 py-1 text-sm">{authState.user.name || "(not set)"}</code>
									</div>
								</>
							)}
						</div>
					)}
				</div>

				{/* Environment Check */}
				<div className="border-border bg-card rounded-lg border p-6">
					<h2 className="text-xl font-semibold">🌍 Environment</h2>
					<div className="mt-4 space-y-2">
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">Mode:</span>
							<code className="bg-muted rounded px-2 py-1 text-sm">{process.env.NODE_ENV}</code>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">Dev:</span>
							<code className="bg-muted rounded px-2 py-1 text-sm">{(process.env.NODE_ENV !== "production") ? "Yes" : "No"}</code>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">Prod:</span>
							<code className="bg-muted rounded px-2 py-1 text-sm">{(process.env.NODE_ENV === "production") ? "Yes" : "No"}</code>
						</div>
					</div>
				</div>

				{/* Quick Links */}
				<div className="border-border bg-card rounded-lg border p-6">
					<h2 className="text-xl font-semibold">🔗 Quick Links</h2>
					<div className="mt-4 grid grid-cols-2 gap-2">
						<a href={withFilesBasePath("/")} className="text-primary hover:underline">
							→ Home
						</a>
						<a href={withFilesBasePath("/signin")} className="text-primary hover:underline">
							→ Sign In
						</a>
						<a href={withFilesBasePath("/signup")} className="text-primary hover:underline">
							→ Sign Up
						</a>
						<a href={withFilesBasePath("/dashboard")} className="text-primary hover:underline">
							→ Dashboard
						</a>
						<a href={withFilesBasePath("/terms")} className="text-primary hover:underline">
							→ Terms
						</a>
						<a href={withFilesBasePath("/privacy")} className="text-primary hover:underline">
							→ Privacy
						</a>
						<a href={withFilesBasePath("/contributors")} className="text-primary hover:underline">
							→ Contributors
						</a>
						<a href={withFilesBasePath("/nonexistent")} className="text-primary hover:underline">
							→ 404 Test
						</a>
					</div>
				</div>

				{/* System Info */}
				<div className="border-border bg-card rounded-lg border p-6">
					<h2 className="text-xl font-semibold">💻 System Info</h2>
					<div className="mt-4 space-y-2">
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">User Agent:</span>
							<code className="bg-muted rounded px-2 py-1 text-xs">{navigator.userAgent}</code>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm">Viewport:</span>
							<code className="bg-muted rounded px-2 py-1 text-sm">
								{window.innerWidth} x {window.innerHeight}
							</code>
						</div>
					</div>
				</div>

				{/* Console Log */}
				<div className="border-border bg-card rounded-lg border p-6">
					<h2 className="text-xl font-semibold">📝 Instructions</h2>
					<div className="text-muted-foreground mt-4 space-y-2 text-sm">
						<p>1. Open your browser's developer console (F12)</p>
						<p>2. Check the Console tab for any errors</p>
						<p>3. Check the Network tab to see if all assets are loading</p>
						<p>4. Try navigating to different routes using the links above</p>
						<p>5. If you see a blank page on other routes, check the console for errors</p>
					</div>
				</div>
			</div>
		</div>
	);
}
