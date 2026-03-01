"use client";

import React from "react";
import { useParams } from "next/navigation";
import { sentenceCase } from "change-case";
import { MobileMailSidebar } from "../../../_components/mail/MobileMailSidebar";

// ==========================================================================
// MobileMailHeader — shown on mobile only with hamburger + current folder
// ==========================================================================

export function MobileMailHeader() {
  const params = useParams();
  const folder = (params?.folder as string) || "Inbox";

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/40 px-3 md:hidden">
      <MobileMailSidebar />
      <h2 className="text-sm font-semibold truncate">
        {sentenceCase(decodeURIComponent(folder))}
      </h2>
    </div>
  );
}
