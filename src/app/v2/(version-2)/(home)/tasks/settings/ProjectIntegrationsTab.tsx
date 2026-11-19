"use client";

import React from "react";
import { Webhook, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProjectIntegrationsTab() {
  const integrations = [
    { id: "github", name: "GitHub", desc: "Link commits and PRs to tasks using issue key references.", connected: true },
    { id: "gitlab", name: "GitLab", desc: "Sync merge requests and issue pipeline statuses.", connected: false },
    { id: "slack", name: "Slack", desc: "Post task creation and status alerts to Slack channels.", connected: true },
    { id: "discord", name: "Discord", desc: "Send notifications to Discord channels via webhooks.", connected: false },
    { id: "webhook", name: "Custom Webhook", desc: "Trigger external HTTP webhooks on task mutations.", connected: false },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xs font-semibold text-foreground">Project Integrations</h3>
        <p className="text-[11px] text-muted-foreground">
          Connect your git repositories and notification channels for automated updates.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden">
        {integrations.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-xs">
            <div className="space-y-0.5 max-w-md">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.name}</span>
                {item.connected && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[10px] font-semibold">
                    <CheckCircle2 className="size-3" />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
            <Button
              variant={item.connected ? "outline" : "default"}
              size="sm"
              onClick={() => toast.info(`Configuring ${item.name}...`)}
              className="h-7 text-xs"
            >
              {item.connected ? "Configure" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ProjectIntegrationsTab;
