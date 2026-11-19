"use client";

import React, { Suspense } from "react";
import { PrivacyPageContent } from "@nimbus/_components/landing-page/privacy-content";
import { Loader2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <div className="flex-1 overflow-auto bg-background">
        <PrivacyPageContent />
      </div>
    </Suspense>
  );
}
