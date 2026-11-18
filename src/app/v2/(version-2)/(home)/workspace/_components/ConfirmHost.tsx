"use client";

// One confirmation dialog for the whole workspace, opened imperatively:
//   if (await confirmAction({ title, description, confirmLabel, destructive })) …
// Mounted once in the workspace layout.

import React, { useState } from "react";
import { create } from "zustand";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  /** Ask for an optional reason (e.g. timeouts); resolved as `reason`. */
  withReason?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((r: { ok: boolean; reason: string }) => void) | null;
  show: (o: ConfirmOptions) => Promise<{ ok: boolean; reason: string }>;
  close: (ok: boolean, reason?: string) => void;
}

const useConfirmStore = create<ConfirmState>()((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  show: (options) =>
    new Promise((resolve) => {
      get().resolve?.({ ok: false, reason: "" }); // a newer dialog cancels the old one
      set({ open: true, options, resolve });
    }),
  close: (ok, reason = "") => {
    get().resolve?.({ ok, reason });
    set({ open: false, resolve: null });
  },
}));

/** Resolves true when confirmed. */
export async function confirmAction(o: ConfirmOptions): Promise<boolean> {
  return (await useConfirmStore.getState().show(o)).ok;
}

/** Like confirmAction, also returning the typed reason (null when cancelled). */
export async function confirmWithReason(o: ConfirmOptions): Promise<string | null> {
  const r = await useConfirmStore.getState().show({ ...o, withReason: true });
  return r.ok ? r.reason : null;
}

export default function ConfirmHost() {
  const { open, options, close } = useConfirmStore();
  const [reason, setReason] = useState("");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          close(false);
          setReason("");
        }
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title}</AlertDialogTitle>
          {options?.description && (
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">{options.description}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {options?.withReason && (
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional, visible in the audit log)"
            maxLength={500}
            className="h-20 resize-none text-sm"
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(options?.destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            onClick={() => {
              close(true, reason.trim());
              setReason("");
            }}
          >
            {options?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
