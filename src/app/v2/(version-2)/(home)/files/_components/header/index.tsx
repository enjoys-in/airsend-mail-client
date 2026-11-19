"use client";

import React from "react";
import { UploadButton } from "../upload-button";
import { FileBreadcrumb } from "./file-path";

export function Header() {
  return (
    <header className="bg-background border-b px-4 py-2 flex items-center justify-between">
      <FileBreadcrumb />
      <div className="flex items-center gap-2">
        <UploadButton name="New" />
      </div>
    </header>
  );
}

export default Header;
