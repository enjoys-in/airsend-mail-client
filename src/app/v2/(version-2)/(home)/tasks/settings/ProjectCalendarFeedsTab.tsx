"use client";

import React, { useState } from "react";
import { Calendar, Copy, Check, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTasks } from "../_lib/tasks-context";
import { toast } from "sonner";

export function ProjectCalendarFeedsTab() {
  const { currentProject } = useTasks();
  const [copied, setCopied] = useState(false);
  const feedUrl = `https://airsend.in/api/v2/tasks/calendar/${currentProject?.id || "demo"}.ics?token=cal_sec_991847192`;

  const handleCopy = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    toast.success("Calendar subscription URL copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-xs font-semibold text-foreground">iCal Calendar Feed</h3>
        <p className="text-[11px] text-muted-foreground">
          Subscribe to tasks in Apple Calendar, Google Calendar, or Outlook via iCal.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Subscription URL</span>
        </div>
        <div className="flex items-center gap-2">
          <Input value={feedUrl} readOnly className="h-8 text-xs font-mono bg-muted/30" />
          <Button size="sm" onClick={handleCopy} className="h-8 text-xs gap-1.5 shrink-0">
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Tasks with start or due dates will automatically appear as all-day events in your calendar.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
        <h4 className="text-xs font-semibold text-foreground">Feed Security</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Anyone with this private URL can view the titles and due dates of tasks in this project.
        </p>
        <Button variant="outline" size="sm" onClick={() => toast.success("Token regenerated")} className="h-7 text-xs gap-1.5">
          <RotateCw className="size-3" />
          Reset Feed Token
        </Button>
      </div>
    </div>
  );
}
export default ProjectCalendarFeedsTab;
