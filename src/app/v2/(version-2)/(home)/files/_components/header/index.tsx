"use client";

import React from "react";
import { UploadButton } from "../upload-button";
import { HeaderContent } from "@/components/common/header-slot";
import { FileBreadcrumb } from "./file-path";

export function Header() {
  const content = (
    <>
      <FileBreadcrumb />
      <div className="flex items-center gap-2">
        <UploadButton name="New" />
      </div>
    </>
  );

  // On desktop the breadcrumb and upload button live in the AirSend top bar.
  return (
    <HeaderContent
      fallback={
        <header className="bg-background border-b px-4 py-2 flex items-center justify-between">
          {content}
        </header>
      }
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-2">
        {content}
      </div>
    </HeaderContent>
  );
}

export default Header;
