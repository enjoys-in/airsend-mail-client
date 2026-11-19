"use client";

import React from "react";
import { CreditCard, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WorkspaceBillingTab() {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AirSend Business Plan</h3>
              <p className="text-xs text-muted-foreground">Self-hosted Organization Instance</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 text-emerald-500 font-semibold px-2.5 py-0.5 text-xs">
            Active
          </span>
        </div>

        <div className="space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="size-3.5 text-emerald-500" />
            <span>Unlimited teams and projects</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-3.5 text-emerald-500" />
            <span>PostgreSQL dedicated schema storage (<code className="font-mono text-primary">tasks</code>)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="size-3.5 text-emerald-500" />
            <span>Multi-channel webhooks & developer APIs</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Payment Method</h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-foreground" />
            <span>Invoiced via Organization Account</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info("Billing invoices opened")} className="h-7 text-xs">
            View Invoices
          </Button>
        </div>
      </div>
    </div>
  );
}
export default WorkspaceBillingTab;
