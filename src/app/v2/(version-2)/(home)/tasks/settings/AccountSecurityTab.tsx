"use client";

import React from "react";
import { KeyRound, Shield, Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AccountSecurityTab() {
  const sessions = [
    { id: "1", device: "Chrome on Windows (Current)", ip: "185.193.19.118", time: "Active now", icon: Laptop },
    { id: "2", device: "Safari on iPhone", ip: "103.212.14.8", time: "Yesterday", icon: Smartphone },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      {/* 2FA */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="size-4 text-emerald-500" />
            <div>
              <h4 className="text-xs font-semibold text-foreground">Two-Factor Authentication (2FA)</h4>
              <p className="text-[11px] text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info("2FA setup prompt opened")} className="h-7 text-xs">
            Enable 2FA
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Active Sessions</h4>
        <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center justify-between p-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{s.device}</p>
                    <p className="text-[10px] text-muted-foreground">{s.ip} · {s.time}</p>
                  </div>
                </div>
                {s.id !== "1" && (
                  <Button variant="ghost" size="sm" onClick={() => toast.success("Session revoked")} className="h-6 text-[10px] text-destructive hover:bg-destructive/10">
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Password Change */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-foreground text-xs font-semibold">
          <KeyRound className="size-4 text-primary" />
          Password Management
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Authentication is integrated with your AirSend organization SSO credentials.
        </p>
      </div>
    </div>
  );
}
export default AccountSecurityTab;
