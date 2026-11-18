"use client";

import React, { useState } from "react";
import { X, Copy, Check, Edit3, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MeetWhiteboardDrawerProps {
  onClose: () => void;
}

export default function MeetWhiteboardDrawer({ onClose }: MeetWhiteboardDrawerProps) {
  const [notes, setNotes] = useState(
    `# Engineering Standup Notes\n\n• Blocker: Redis stream replication timeout resolved.\n• Sprint goal: Complete Google Meet lobby + live layout parity.\n• Action: Raj to deploy migration 000007_workflows.\n• Next sync: Tomorrow 10:00 AM IST.`
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-80 md:w-96 flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur-md text-slate-100 z-30 shadow-2xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-2">
          <Edit3 className="size-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Meeting Notes & Whiteboard</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="size-8 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Shared with all call participants</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 text-xs gap-1 text-slate-300 hover:text-white"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            <span>{copied ? "Copied" : "Copy notes"}</span>
          </Button>
        </div>

        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take collaborative meeting notes..."
          className="flex-1 resize-none bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs leading-relaxed p-3 focus-visible:ring-emerald-500 rounded-xl"
        />

        <div className="flex items-center justify-between pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNotes((prev) => prev + `\n• Action item: `)}
            className="h-8 text-xs gap-1 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Plus className="size-3" />
            Add item
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setNotes("")}
            className="h-8 text-xs gap-1 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="size-3" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
