"use client";

// ============================================================================
// Files staged in the composer of one conversation (kept in its draft), with
// duplicate detection: a file with the same name and size that was already
// shared in this conversation prompts "use the existing file / upload again".
// ============================================================================

import { useState } from "react";
import { toast } from "sonner";
import { useChatStore } from "./chat-store";
import { draftFileFrom, useDrafts, type DraftFile } from "./drafts";
import type { MessageAttachment } from "./chat-types";
import type { OutgoingFile } from "./outbox";
import type { DuplicateFile } from "../_components/DuplicateFileDialog";

const EMPTY: DraftFile[] = [];
const keyOf = (name: string, size: number) => `${name}\u0000${size}`;

interface Duplicate {
  file: File;
  existing: MessageAttachment;
  sharedAt: string;
}

/** Files already shared in the conversation (with a files-service id), by name + size; newest wins. */
function sharedFiles(conversationId: string): Map<string, { att: MessageAttachment; at: string }> {
  const s = useChatStore.getState();
  const list = s.messages.some((m) => m.channelId === conversationId)
    ? s.messages.filter((m) => m.channelId === conversationId)
    : (s.dmMessages[conversationId] ?? []);
  const out = new Map<string, { att: MessageAttachment; at: string }>();
  for (const m of list) {
    if (m.isDeleted) continue;
    for (const a of m.attachments) {
      if (a.fileId && a.uploadProgress === undefined) out.set(keyOf(a.name, a.size), { att: a, at: m.createdAt });
    }
  }
  return out;
}

function reuseOf(existing: MessageAttachment): DraftFile {
  return {
    id: `df-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: existing.name,
    size: existing.size,
    type: existing.mimeType,
    existingFileId: existing.fileId,
    extension: existing.extension,
  };
}

/** What the outbox needs to send a staged file. */
function toOutgoing(f: DraftFile): OutgoingFile {
  if (f.existingFileId) {
    return { reuse: { fileId: f.existingFileId, name: f.name, size: f.size, type: f.type, extension: f.extension } };
  }
  const blob = f.blob as Blob;
  return { file: blob instanceof File ? blob : new File([blob], f.name, { type: f.type }) };
}

export function useComposerFiles(conversationId: string) {
  const files = useDrafts((s) => s.drafts[conversationId]?.files) ?? EMPTY;
  const addFiles = useDrafts((s) => s.addFiles);
  const removeFile = useDrafts((s) => s.removeFile);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);

  /** Stage picked / dropped files; known ones queue up for the duplicate prompt. */
  const stage = (picked: File[]) => {
    const shared = sharedFiles(conversationId);
    const staged = new Set(files.map((f) => keyOf(f.name, f.size)));
    const fresh: DraftFile[] = [];
    const dups: Duplicate[] = [];
    for (const file of picked) {
      const key = keyOf(file.name, file.size);
      if (staged.has(key)) {
        toast.info(`${file.name} is already attached`);
        continue;
      }
      staged.add(key);
      const known = shared.get(key);
      if (known) dups.push({ file, existing: known.att, sharedAt: known.at });
      else fresh.push(draftFileFrom(file));
    }
    if (fresh.length) addFiles(conversationId, fresh);
    if (dups.length) setDuplicates((q) => [...q, ...dups]);
  };

  const current = duplicates[0];
  const duplicate: DuplicateFile | null = current
    ? { name: current.file.name, size: current.file.size, sharedAt: current.sharedAt }
    : null;

  const resolveDuplicate = (choice: "existing" | "again" | "cancel") => {
    if (!current) return;
    if (choice === "existing") addFiles(conversationId, [reuseOf(current.existing)]);
    if (choice === "again") addFiles(conversationId, [draftFileFrom(current.file)]);
    setDuplicates((q) => q.slice(1));
  };

  return {
    files,
    stage,
    remove: (id: string) => removeFile(conversationId, id),
    outgoing: () => files.map(toOutgoing),
    duplicate,
    resolveDuplicate,
  };
}
