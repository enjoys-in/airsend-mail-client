"use client";

import React from "react";
import Link from "next/link";
import { Workflow, Webhook, ChevronRight } from "lucide-react";
import { useTeamSettings } from "../_components/use-team-settings";
import { NoPermission, SettingsHeader } from "../_components/settings-ui";

export default function IntegrationsSettingsPage() {
  const s = useTeamSettings();
  if (!s.can("manage_integrations")) {
    return (
      <>
        <SettingsHeader title="Integrations" />
        <NoPermission what="manage integrations in this team" />
      </>
    );
  }

  const items = [
    {
      href: "/v2/workspace/workflows",
      icon: Workflow,
      title: "Workflows & automations",
      description: "Triggers, scheduled jobs and actions that run in this team's channels.",
    },
    {
      href: "/v2/workspace/workflows",
      icon: Webhook,
      title: "Incoming webhooks",
      description: "Post into a channel from external services with a webhook URL.",
    },
  ];

  return (
    <>
      <SettingsHeader title="Integrations" description="Connect external services to this team." />
      <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-card">
        {items.map((i) => (
          <Link key={i.title} href={i.href} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <i.icon className="size-4 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{i.title}</p>
              <p className="text-xs text-muted-foreground">{i.description}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </>
  );
}
