"use client";

import React, { useState, useEffect, Suspense } from "react";
import { authClient } from "@nimbus/_lib/auth-shim";
import { Loader2 } from "lucide-react";

function DevelopersDebugContent() {
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
    <div className="bg-background min-h-screen p-8 overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="border-border bg-card rounded-lg border p-6">
          <h1 className="text-3xl font-bold">Nimbus Debug Information</h1>
          <p className="text-muted-foreground mt-2">Files Integration Debug & Status</p>
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
                <code className="bg-muted rounded px-2 py-1 text-sm">{authState?.data?.user ? "Yes" : "No"}</code>
              </div>
              {authState?.data?.user && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">User Email:</span>
                    <code className="bg-muted rounded px-2 py-1 text-sm">{authState.data.user.email}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">User Name:</span>
                    <code className="bg-muted rounded px-2 py-1 text-sm">{authState.data.user.name || "(not set)"}</code>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DevelopersDebugContent />
    </Suspense>
  );
}
