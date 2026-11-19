"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, FileText, Layers, Video, Bot, Calendar, ArrowRight } from "lucide-react";

const VerticalTabs = () => {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 mx-auto">
      <div className="rounded-3xl border border-white/10 bg-[#12141a] p-8 sm:p-12 text-white">
        <h2 className="text-2xl font-bold sm:text-3xl mb-4">
          Integrated Suite for Modern Teams
        </h2>
        <p className="text-sm text-neutral-400 mb-8 max-w-xl">
          Tasks, Files, Workspace, Google Meet-grade video, Meeting Bot, and Calendar all connected seamlessly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/v2/tasks" className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <CheckSquare className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-sm">Tasks & Tickets</h3>
            <p className="text-xs text-neutral-400 mt-1">Kanban boards and ticket workflows</p>
          </Link>
          <Link href="/v2/files" className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <FileText className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="font-semibold text-sm">Cloud Files</h3>
            <p className="text-xs text-neutral-400 mt-1">Upload and organize documents</p>
          </Link>
          <Link href="/v2/workspace" className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Layers className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="font-semibold text-sm">Workspace (Slack+Teams)</h3>
            <p className="text-xs text-neutral-400 mt-1">Channels and real-time collaboration</p>
          </Link>
          <Link href="/v2/workspace/calls" className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Video className="w-5 h-5 text-rose-400 mb-2" />
            <h3 className="font-semibold text-sm">Airsend Meet</h3>
            <p className="text-xs text-neutral-400 mt-1">Google Meet-grade video conferencing</p>
          </Link>
          <Link href="/v2/workspace/calls" className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Bot className="w-5 h-5 text-purple-400 mb-2" />
            <h3 className="font-semibold text-sm">Meeting Bot</h3>
            <p className="text-xs text-neutral-400 mt-1">Automated attendee and live transcripts</p>
          </Link>
          <Link href="/v2/calender" className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Calendar className="w-5 h-5 text-pink-400 mb-2" />
            <h3 className="font-semibold text-sm">Calendar & RSVP</h3>
            <p className="text-xs text-neutral-400 mt-1">CalDAV sync and event management</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerticalTabs;
