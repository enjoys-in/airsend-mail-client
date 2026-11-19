"use client";

import React, { useState } from "react";
import { Users, UserPlus, Search, ShieldCheck, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatar: string;
}

export function MembersView() {
  const [query, setQuery] = useState("");
  const [members] = useState<Member[]>([
    { id: "1", name: "Mullayam S", email: "mullayam06@outlook.com", role: "admin", avatar: "MS" },
    { id: "2", name: "Engineering Team", email: "dev@airsend.in", role: "member", avatar: "ET" },
    { id: "3", name: "Product Design", email: "design@airsend.in", role: "member", avatar: "PD" },
    { id: "4", name: "Support Team", email: "support@airsend.in", role: "viewer", avatar: "ST" },
  ]);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col h-full bg-background overflow-hidden p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Workspace Members</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              People with access to teams, tasks, and discussions in this workspace.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => {
            const email = prompt("Enter email address to invite to workspace:");
            if (email) toast.success(`Invitation sent to ${email}`);
          }}
          className="h-8 text-xs gap-1.5 shadow-xs"
        >
          <UserPlus className="size-3.5" />
          Invite People
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="h-8 pl-8 text-xs bg-muted/20"
        />
      </div>

      {/* Members Table */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="grid grid-cols-12 border-b border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-6">Member</div>
          <div className="col-span-4">Role</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border/40">
          {filtered.map((m) => (
            <div key={m.id} className="grid grid-cols-12 items-center px-4 py-3 text-xs hover:bg-muted/20 transition-colors">
              <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                  {m.avatar}
                </div>
                <div className="truncate min-w-0">
                  <p className="font-semibold text-foreground truncate">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                </div>
              </div>

              <div className="col-span-4">
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize bg-primary/10 text-primary">
                  <ShieldCheck className="size-3" />
                  {m.role}
                </span>
              </div>

              <div className="col-span-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toast.info(`Managing permissions for ${m.name}`)}
                  className="size-7 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default MembersView;
