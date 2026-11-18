"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace Route Error:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[400px] flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 shadow-sm ring-8 ring-destructive/5">
        <AlertCircle className="size-8" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Workspace Error
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        {error?.message || "We encountered an issue loading this workspace section. Please try again or return to the workspace home."}
      </p>
      {error?.digest && (
        <span className="mt-2 rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          Digest: {error.digest}
        </span>
      )}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="size-4" />
          Reload Section
        </Button>
        <Link href="/v2/workspace">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
}
