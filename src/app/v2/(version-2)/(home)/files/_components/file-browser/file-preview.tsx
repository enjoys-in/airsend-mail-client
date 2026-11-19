"use client";

import React from "react";
import { useNavigate, useSearch } from "../../_lib/router-shim";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

export function FilePreview() {
  const navigate = useNavigate();
  const searchParams = useSearch();

  const handleClose = () => {
    const { id, ...restSearchParams } = searchParams;
    navigate({
      search: restSearchParams,
      replace: true,
    });
  };

  return (
    <Sheet open={!!searchParams.id} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>File Preview</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Previewing file {searchParams.id}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
