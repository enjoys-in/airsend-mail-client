"use client";

import React, { useState } from "react";
import { X, Copy, Check, Link2, Phone, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMeetUrl } from "../_lib/api";

interface MeetDetailsDrawerProps {
  callId: string;
  title: string;
  onClose: () => void;
}

export default function MeetDetailsDrawer({
  callId,
  title,
  onClose,
}: MeetDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"info" | "attachments">("info");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const meetUrl = formatMeetUrl(callId);
  const dialIn = "+1 415-555-0199";
  const pin = "738 291 042#";

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(meetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `Meeting: ${title}\nLink: ${meetUrl}\nDial-in: ${dialIn} (PIN: ${pin})\nAirSend Meet`;
    navigator.clipboard?.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex h-full w-80 md:w-96 flex-col border-l border-slate-800 bg-slate-900/95 backdrop-blur-md text-slate-100 z-30 shadow-2xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <h3 className="text-sm font-semibold text-white">Meeting details</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="size-8 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-4">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 py-3 px-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "info"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Link2 className="size-3.5" />
          Joining info
        </button>
        <button
          onClick={() => setActiveTab("attachments")}
          className={`flex items-center gap-2 py-3 px-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "attachments"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Paperclip className="size-3.5" />
          Attachments (2)
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {activeTab === "info" ? (
          <>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Meeting link
              </span>
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                <span className="font-mono text-slate-200 truncate pr-2 select-all">
                  {meetUrl}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="size-7 shrink-0 text-slate-400 hover:text-white"
                >
                  {copiedLink ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Dial-in phone numbers
              </span>
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-slate-400" />
                    (US) {dialIn}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  PIN: <span className="font-mono text-slate-200">{pin}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCopyAll}
              className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs gap-2 border border-slate-700"
            >
              {copiedAll ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copiedAll ? "Copied joining info" : "Copy joining info"}</span>
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs">
              Files and documents attached to this meeting calendar invite:
            </p>
            <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 truncate">
                <span className="font-semibold text-slate-200 block truncate">
                  Sprint_Architecture_Plan_v2.pdf
                </span>
                <span className="text-[10px] text-slate-500">2.4 MB • PDF</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 truncate">
                <span className="font-semibold text-slate-200 block truncate">
                  Engineering_Q4_Roadmap.xlsx
                </span>
                <span className="text-[10px] text-slate-500">1.1 MB • Spreadsheet</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
