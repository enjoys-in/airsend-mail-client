"use client";

import React, { useState } from "react";
import { User, Mail, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AccountProfileTab() {
  const [name, setName] = useState("Mullayam S");
  const [email] = useState("mullayam06@outlook.com");
  const [bio, setBio] = useState("Engineering Lead & Product Architect");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile information updated");
    }, 400);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
          MS
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Display Name</label>
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-8 h-8 text-xs" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input value={email} disabled className="pl-8 h-8 text-xs bg-muted/40 text-muted-foreground cursor-not-allowed" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="text-xs h-20 resize-none" />
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 flex justify-end">
        <Button size="sm" type="submit" disabled={saving} className="h-8 text-xs gap-1.5">
          <Save className="size-3.5" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
export default AccountProfileTab;
