"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen, ArrowRight, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkspaceFile } from "../_lib/chat-types";

interface WorkspaceFilesCardProps {
  files: WorkspaceFile[];
}

export function WorkspaceFilesCard({ files }: WorkspaceFilesCardProps) {
  const recent = files.slice(0, 4);

  return (
    <Card className="border-border/40 shadow-sm flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen className="size-4 text-indigo-500" />
            Team Documents & Files
          </CardTitle>
          <CardDescription className="text-xs">Shared via channels & meetings</CardDescription>
        </div>
        <Link href="/v2/workspace/files">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            Browse all <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2 flex-1">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No files shared in this workspace yet.
          </div>
        ) : (
          recent.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-accent/10 hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(f.size / 1024 / 1024).toFixed(1)} MB • Uploaded by {f.uploaderName}
                  </p>
                </div>
              </div>
              <Link href="/v2/workspace/files">
                <Button variant="ghost" size="icon" className="size-7">
                  <ExternalLink className="size-3.5" />
                </Button>
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
