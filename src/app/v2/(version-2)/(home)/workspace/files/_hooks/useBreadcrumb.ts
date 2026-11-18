"use client";

import { useMemo } from "react";
import { useSearch } from "../_lib/router-shim";

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export function useBreadcrumb() {
  const search = useSearch();
  const folderId = search.folderId || "root";

  // Build breadcrumb items based on folderId
  const items = useMemo<BreadcrumbItem[]>(() => {
    if (folderId === "root") {
      return [{ id: "root", name: "My Drive" }];
    }
    return [
      { id: "root", name: "My Drive" },
      { id: folderId, name: folderId },
    ];
  }, [folderId]);

  return { items };
}
