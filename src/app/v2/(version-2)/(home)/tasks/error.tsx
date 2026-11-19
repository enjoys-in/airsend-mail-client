"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Next-level boundary for the tasks segment. It only catches what the Kaneo app can't catch
// itself: the lazy chunk failing to load, or its stylesheet/host wrapper throwing. Everything
// inside the app is handled by the router's pending/error/not-found components.
export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tasks route error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] w-full flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
        <AlertCircle className="size-7" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Tasks couldn&apos;t load
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        Something went wrong while opening tasks. Try again, and if it keeps
        happening, reload the page.
      </p>
      <Button onClick={() => reset()} variant="outline" className="mt-5 gap-2">
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
