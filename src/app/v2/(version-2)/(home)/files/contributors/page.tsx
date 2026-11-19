"use client";

import React, { Suspense } from "react";
import Contributors from "@nimbus/_components/contributors/contributors";
import { Loader2 } from "lucide-react";

export default function ContributorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <div className="flex-1 overflow-auto bg-background">
        <Contributors />
      </div>
    </Suspense>
  );
}
