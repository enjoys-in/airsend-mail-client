'use client';

import { Loader2 } from "lucide-react";


export default function Loading() {
  return (
    <div className="flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex flex-col items-center gap-4" >
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading Emails
          </p>
        </div>
      </div>
    </div>
  );
}