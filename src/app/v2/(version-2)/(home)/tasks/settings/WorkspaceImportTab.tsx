"use client";

import React from "react";
import { Import, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WorkspaceImportTab() {
  const sources = [
    { id: "jira", name: "Jira Software", desc: "Import issues, sprints, and epics from Jira Cloud or Server." },
    { id: "linear", name: "Linear", desc: "Import issues, cycles, and project roadmaps from Linear." },
    { id: "trello", name: "Trello", desc: "Import boards, cards, labels, and checklists from Trello." },
    { id: "github", name: "GitHub Issues", desc: "Import repository issues and milestones directly into tasks." },
    { id: "csv", name: "CSV / JSON", desc: "Upload custom spreadsheet or exported task lists." },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xs font-semibold text-foreground">Import Data to Workspace</h3>
        <p className="text-[11px] text-muted-foreground">
          Migrate your existing projects and task hierarchies from external tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sources.map((src) => (
          <div key={src.id} className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Import className="size-4 text-primary" />
                <h4 className="text-xs font-semibold text-foreground">{src.name}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{src.desc}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(`Starting ${src.name} import wizard...`)}
              className="mt-3 h-7 text-xs gap-1.5 w-fit"
            >
              <Upload className="size-3" />
              Import from {src.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default WorkspaceImportTab;
