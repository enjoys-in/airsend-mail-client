"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  FileText,
  Layers,
  Video,
  Bot,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SUITE_TABS = [
  {
    id: "tasks",
    title: "Tasks & Tickets",
    tag: "TICKETS",
    heading: "Agile ticket tracking & Kanban boards",
    desc: "Manage customer tickets, sprint backlogs, and bug fixes with customizable Kanban boards, priorities, and workflow states.",
    route: "/v2/tasks",
    icon: CheckSquare,
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    color: "text-emerald-400",
    bgGradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
    bullets: [
      "Kanban boards with real-time ticket reordering",
      "Priority matrix: Urgent, High, Medium, Low",
      "Markdown descriptions, tags, and member assignment",
    ],
  },
  {
    id: "files",
    title: "Cloud Files",
    tag: "STORAGE",
    heading: "Upload, preview, and share assets",
    desc: "Upload files securely with fast multi-file queues, in-browser document previews, organized directory hierarchies, and shareable links.",
    route: "/v2/files",
    icon: FileText,
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    color: "text-amber-400",
    bgGradient: "from-amber-500/20 via-amber-600/10 to-transparent",
    bullets: [
      "Drag-and-drop uploads with upload verification",
      "Instant preview for PDFs, images, docs, and audio",
      "Custom tags, folder trees, and storage limits",
    ],
  },
  {
    id: "workspace",
    title: "Workspace (Slack + Teams)",
    tag: "COLLAB",
    heading: "Channels, DMs, and voice lounges",
    desc: "The collaboration of Slack combined with the enterprise power of Microsoft Teams: public & private channels, direct messages, and presence.",
    route: "/v2/workspace",
    icon: Layers,
    badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/20 via-indigo-600/10 to-transparent",
    bullets: [
      "Team channels, direct messages, and threads",
      "Voice lounges for quick spontaneous syncs",
      "Rich formatting, emoji reactions, and live presence",
    ],
  },
  {
    id: "meet",
    title: "Airsend Meet",
    tag: "GOOGLE MEET",
    heading: "Google Meet-grade video conferencing",
    desc: "Instant meetings or scheduled video conferences with screen sharing, participant tile grid, green room preview, and interactive whiteboard.",
    route: "/v2/workspace/calls",
    icon: Video,
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    color: "text-rose-400",
    bgGradient: "from-rose-500/20 via-rose-600/10 to-transparent",
    bullets: [
      "Instant room generation with 10-character code",
      "Dynamic speaker grid, HD video, and screen sharing",
      "Built-in collaborative whiteboard and host controls",
    ],
  },
  {
    id: "meeting-bot",
    title: "Meeting Bot",
    tag: "AI ASSISTANT",
    heading: "Automated bot to attend & transcribe",
    desc: "Invite your AI Meeting Bot to attend scheduled calls, transcribe discussions live, capture key decisions, and compile action items automatically.",
    route: "/v2/workspace/calls",
    icon: Bot,
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    color: "text-purple-400",
    bgGradient: "from-purple-500/20 via-purple-600/10 to-transparent",
    bullets: [
      "1-click invite to any active or scheduled meeting",
      "Live transcription with accurate speaker labels",
      "Auto-generates meeting summary & action items",
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    tag: "CALDAV",
    heading: "Event scheduling & RSVP in inbox",
    desc: "Full CalDAV-backed calendar with timezone adjustments, event reminders, upcoming meetings list in mail, and 1-click email RSVP buttons.",
    route: "/v2/calender",
    icon: Calendar,
    badgeColor: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    color: "text-pink-400",
    bgGradient: "from-pink-500/20 via-pink-600/10 to-transparent",
    bullets: [
      "RSVP directly from emails without opening message",
      "Multi-timezone scheduling and repeating event rules",
      "Seamless integration with Airsend Meet & Google Meet",
    ],
  },
];

const Features = () => {
  const [activeTab, setActiveTab] = useState<string>("tasks");
  const current = SUITE_TABS.find((t) => t.id === activeTab) || SUITE_TABS[0];

  return (
    <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 mx-auto">
      <div className="rounded-3xl border border-white/10 bg-[#12141a]/95 p-6 sm:p-12 lg:p-16 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />

        {/* Section Header */}
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Suite Features</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Everything your team needs, under one roof
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Tasks, Files, Workspace, Google Meet-grade calls, Meeting Bot, and Calendar are deeply integrated.
          </p>
        </div>

        {/* Grid: Left Tab Buttons, Right Active Feature Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Buttons List */}
          <div className="lg:col-span-5 space-y-2">
            {SUITE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200",
                    isActive
                      ? "bg-white/[0.08] border-white/20 shadow-lg text-white"
                      : "bg-transparent border-transparent hover:bg-white/[0.03] text-neutral-400 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "p-2 rounded-lg border shrink-0 transition-colors",
                        isActive
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-white/5 text-neutral-400 border-white/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {tab.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {tab.tag}
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon active={isActive} />
                </button>
              );
            })}
          </div>

          {/* Right Active Preview Card */}
          <div className="lg:col-span-7">
            <div
              className={cn(
                "rounded-2xl border border-white/15 p-6 sm:p-8 bg-gradient-to-br shadow-xl transition-all duration-300",
                current.bgGradient,
                "bg-[#151720]/95"
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <Badge className={cn("text-[10px] font-bold tracking-wider uppercase px-2 py-0.5", current.badgeColor)}>
                  {current.tag}
                </Badge>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {current.route}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {current.heading}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                {current.desc}
              </p>

              {/* Bullet highlights */}
              <div className="space-y-2.5 mb-8 border-t border-white/10 pt-4">
                {current.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  asChild
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 shadow-md shadow-blue-600/25"
                >
                  <Link href={current.route}>
                    Launch {current.title}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 text-xs"
                >
                  <Link href="/features">All Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = ({ active }: { active: boolean }) => (
  <svg
    className={cn(
      "w-4 h-4 transition-transform duration-200 shrink-0",
      active ? "translate-x-1 text-blue-400" : "text-neutral-600 opacity-60"
    )}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default Features;
