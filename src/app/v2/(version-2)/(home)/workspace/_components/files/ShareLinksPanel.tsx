"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Link as LinkIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createShareLink,
  filesErrorMessage,
  listShareLinks,
  revokeShareLink,
  type ShareLink,
} from "../../_lib/files-api";
import { formatFileDate } from "../../_lib/file-utils";

const EXPIRY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "1", label: "1 day" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

/** "Link" tab of the share dialog: public download links for one files-service file. */
export function ShareLinksPanel({ fileId }: { fileId: string }) {
  const [links, setLinks] = useState<ShareLink[] | null>(null);
  const [expiry, setExpiry] = useState("7");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLinks(null);
    listShareLinks(fileId)
      .then((l) => !cancelled && setLinks(l))
      .catch((err) => {
        if (cancelled) return;
        setLinks([]);
        toast.error(filesErrorMessage(err, "Could not load the share links"));
      });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  const copy = async (link: ShareLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId((id) => (id === link.id ? null : id)), 2000);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const create = async () => {
    setCreating(true);
    try {
      const link = await createShareLink(fileId, expiry === "never" ? null : Number(expiry));
      setLinks((l) => [link, ...(l ?? [])]);
      await copy(link);
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not create the link"));
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (link: ShareLink) => {
    setBusyId(link.id);
    try {
      await revokeShareLink(link.id);
      setLinks((l) => (l ?? []).filter((x) => x.id !== link.id));
      toast.success("Link revoked");
    } catch (err) {
      toast.error(filesErrorMessage(err, "Could not revoke the link"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Link expires</Label>
          <Select value={expiry} onValueChange={setExpiry}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={create} disabled={creating} className="h-8 gap-1.5 text-xs">
          {creating ? <Loader2 className="size-3.5 animate-spin" /> : <LinkIcon className="size-3.5" />}
          Create link
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Active links</Label>
        {links === null ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : links.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">No links yet.</p>
        ) : (
          <ul className="max-h-56 divide-y divide-border/40 overflow-y-auto rounded-lg border border-border/40">
            {links.map((link) => (
              <li key={link.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px]">{link.url}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {link.expiresAt ? `Expires ${formatFileDate(link.expiresAt)}` : "Never expires"}
                    {` · ${link.downloadCount ?? 0} downloads`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="size-7" title="Copy link" onClick={() => copy(link)}>
                  {copiedId === link.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  title="Revoke link"
                  disabled={busyId === link.id}
                  onClick={() => revoke(link)}
                >
                  {busyId === link.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
