"use client";

import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "../ui/breadcrumb";
import { type BreadcrumbItem as BreadcrumbItemType, useBreadcrumb } from "../../_hooks/useBreadcrumb";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useNavigate, useSearch } from "../../_lib/router-shim";
import { pointerIntersection } from "@dnd-kit/collision";
import { SourceSelector } from "./source-selector";
import { useDroppable } from "@dnd-kit/react";
import { HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      ease: "easeInOut",
      duration: 0.2,
    },
  },
};

export function FileBreadcrumb() {
  const searchParams = useSearch();
  const navigate = useNavigate();
  const { items } = useBreadcrumb();

  function handleFolderClick(id: string) {
    navigate({
      search: { ...searchParams, folderId: id },
    });
  }

  function handleHomeClick() {
    if (!searchParams.folderId) return;
    const { folderId, ...restSearchParams } = searchParams;
    navigate({
      search: restSearchParams,
    });
  }

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: `droppable-root`,
    accept: "files",
    data: { id: "root" },
    collisionDetector: pointerIntersection,
  });

  return (
    <div className="flex flex-1 items-center gap-2">
      <SourceSelector />
      <Breadcrumb>
        <AnimatePresence mode="popLayout">
          <BreadcrumbList className="flex items-center px-1">
            <div ref={droppableRef as any}>
              <BreadcrumbItem
                className={cn(
                  "flex items-center justify-center",
                  isDropTarget && "rounded-md bg-blue-500/20 text-blue-500 ring-2 ring-blue-500"
                )}
              >
                <BreadcrumbLink
                  onClick={handleHomeClick}
                  className="flex items-center gap-1 rounded-md p-1 cursor-pointer"
                >
                  <HomeIcon className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>

            {items && items.length > 1 && (
              <span className="text-muted-foreground px-1">/</span>
            )}

            {items?.slice(1).map((item, index) => (
              <React.Fragment key={item.id}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => handleFolderClick(item.id)}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {item.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < items.length - 2 && <span className="text-muted-foreground px-1">/</span>}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </AnimatePresence>
      </Breadcrumb>
    </div>
  );
}

export default FileBreadcrumb;
