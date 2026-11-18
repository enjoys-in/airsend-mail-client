"use client";

import React, { useState } from "react";
import { KeyRound, Plus, Trash2, Copy, Check, AlertCircle } from "lucide-react";
import { type TaskApiKey } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function WorkspaceApiKeysTab() {
  const [keys, setKeys] = useState<TaskApiKey[]>([
    {
      id: "key-1",
      name: "Default CLI Key",
      keyPreview: "kn_live_...94a2",
      createdAt: new Date().toISOString(),
      expiresAt: null,
    },
  ]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const rawKey = `kn_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const newEntry: TaskApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyPreview: `${rawKey.slice(0, 10)}...${rawKey.slice(-4)}`,
      createdAt: new Date().toISOString(),
      expiresAt: null,
    };

    setKeys((prev) => [newEntry, ...prev]);
    setCreatedKey(rawKey);
    setNewKeyName("");
  };

  const handleDeleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success("API key revoked");
  };

  const handleCopyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-foreground">API Keys</h4>
          <p className="text-[11px] text-muted-foreground">
            Manage personal tokens for CLI, scripts, and MCP server integrations
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="h-7 text-xs gap-1">
          <Plus className="size-3" />
          Create Key
        </Button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {keys.map((k) => (
          <div
            key={k.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="size-3.5 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">{k.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{k.keyPreview}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteKey(k.id)}
              className="size-6 text-muted-foreground hover:text-destructive"
              title="Revoke Key"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Generate New API Key</DialogTitle>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-3 py-2">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>Make sure to copy your key now. You will not be able to view it again!</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={createdKey} readOnly className="h-8 text-xs font-mono" />
                <Button size="sm" onClick={handleCopyKey} className="h-8 text-xs gap-1 shrink-0">
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <DialogFooter className="pt-2">
                <Button size="sm" onClick={() => { setCreatedKey(null); setCreateOpen(false); }}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateKey} className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Key Name</label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. My Mac CLI"
                  className="h-8 text-xs"
                  required
                  autoFocus
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!newKeyName.trim()}>
                  Generate
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
