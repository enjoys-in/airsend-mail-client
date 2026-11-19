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
  Mail,
  Shield,
  Terminal,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Lock,
  Globe,
  Users,
  Search,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/constants/version";

// Core Suite Pillars added in this release
const CORE_SUITE_PILLARS = [
  {
    id: "tasks",
    title: "Tasks & Ticket Tracker",
    tag: "TICKETS",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckSquare,
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    route: "/v2/tasks",
    description:
      "Manage tickets, customer issues, bug reports, and sprint tasks with Kaneo-powered Kanban boards, custom workflows, priorities, and tags.",
    highlights: [
      "Visual Kanban boards with drag-and-drop status stages",
      "Custom ticket priority matrix (Urgent, High, Medium, Low)",
      "Multi-label classification, subtasks, and rich markdown descriptions",
      "Integrated with user roles and workspace projects",
    ],
  },
  {
    id: "files",
    title: "Files & Cloud Storage",
    tag: "STORAGE",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: FileText,
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    route: "/v2/files",
    description:
      "A centralized file manager to upload, organize, tag, preview, and securely share documents, attachments, and multimedia across your team.",
    highlights: [
      "Fast multi-file drag-and-drop upload with status verification",
      "Instant in-browser document, image, audio, and PDF previews",
      "Hierarchical folder trees, search by tag, and storage quotas",
      "Pluggable storage backends (S3-compatible, Telegram, Local)",
    ],
  },
  {
    id: "workspace",
    title: "Workspace (Slack + Teams)",
    tag: "COLLAB",
    badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    icon: Layers,
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    route: "/v2/workspace",
    description:
      "The best of Slack and Microsoft Teams in one place: real-time channels, direct messages, voice rooms, message threads, reactions, and team presence.",
    highlights: [
      "Public and private team channels with pin & notification controls",
      "Direct 1-on-1 messages with live typing indicators & presence",
      "Voice lounges for spontaneous audio drop-in conversations",
      "Reactions, rich file attachments, and searchable message history",
    ],
  },
  {
    id: "meet",
    title: "Airsend Meet",
    tag: "GOOGLE MEET",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: Video,
    iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    route: "/v2/workspace/calls",
    description:
      "Google Meet-grade video conferencing: instant meetings, shareable 10-character room codes (`xxx-yyyy-zzz`), dynamic participant grid, and whiteboard.",
    highlights: [
      "Instant 1-click meeting creation and green room preview lobby",
      "Crisp HD video, active speaker detection, and screen sharing",
      "Built-in collaborative whiteboard and host meeting controls",
      "Interactive hand raising, emojis, and live captions overlay",
    ],
  },
  {
    id: "meeting-bot",
    title: "Meeting Bot Assistant",
    tag: "AI ASSISTANT",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    icon: Bot,
    iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    route: "/v2/workspace/calls",
    description:
      "An intelligent automated bot that attends your meetings, records audio, transcribes conversations in real time, and produces concise meeting minutes.",
    highlights: [
      "Summon bot to any instant or scheduled meeting room with 1 click",
      "Live speech-to-text transcript generation with speaker labels",
      "Automated summary generation and action item extraction",
      "Posts meeting notes directly to your workspace channel or email",
    ],
  },
  {
    id: "calendar",
    title: "Calendar & Scheduling",
    tag: "CALDAV",
    badgeColor: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    icon: Calendar,
    iconBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    route: "/v2/calender",
    description:
      "A complete CalDAV-integrated schedule manager: day/week/month views, timezone adjustments, event reminders, and inbox RSVP buttons.",
    highlights: [
      "RSVP directly from inbox emails (Yes, Maybe, No) with event preview",
      "Repeating events (daily, weekly, monthly, yearly) and timezone sync",
      "One-click launch of attached Google Meet or Airsend video rooms",
      "Live two-way CalDAV synchronization across all your devices",
    ],
  },
  {
    id: "workflows",
    title: "Workflows & Automation",
    tag: "UPCOMING",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    icon: Workflow,
    iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    route: "/v2/workspace/workflows",
    isUpcoming: true,
    description:
      "Visual low-code automation engine: connect email webhooks, triggers, background jobs, and approval pipelines without complex code.",
    highlights: [
      "Visual DAG pipeline builder with conditional branching & retries",
      "Event triggers: new email, webhook, form submission, or cron",
      "Compatible with Windmill, Kestra, and Activepieces runners",
      "Full step-level execution logs, secret management & payload replay",
    ],
  },
];

// Security & Platform Capabilities
const PLATFORM_CAPABILITIES = [
  {
    category: "Security & Privacy",
    icon: Shield,
    items: [
      { title: "End-to-End PGP Encryption", desc: "Password-protected or key-based encryption for confidential communications." },
      { title: "Zero-Tracker Privacy", desc: "Blocks spy pixels, tracker domains, and link tracking redirects automatically." },
      { title: "Sieve Filter Engine", desc: "Custom server-side scripting rules to sort, tag, auto-reply, or forward emails." },
      { title: "BIMI, SPF, DKIM & DMARC", desc: "Cryptographically authenticated email with verified brand logo badges." },
    ],
  },
  {
    category: "Developer & API Power",
    icon: Terminal,
    items: [
      { title: "Transactional REST API", desc: "Modern developer-first API to send, queue, track, and parse messages." },
      { title: "Custom SMTP & IMAP Relay", desc: "Plug any client or server directly into our high-deliverability cluster." },
      { title: "Webhooks & Event Bridge", desc: "Real-time socket and HTTP webhooks for message events, delivery, and sync." },
      { title: "Disposable Burner Inboxes", desc: "Create instant temporary inboxes via API or UI for test suites and privacy." },
    ],
  },
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  return (
    <div className="min-h-screen bg-[#0d0f12] text-neutral-100 selection:bg-blue-600/30">
      {/* ── Ambient Glow Background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[500px] bg-gradient-to-r from-emerald-600/10 to-transparent blur-[130px]" />
        <div className="absolute top-[65%] -right-[10%] w-[600px] h-[500px] bg-gradient-to-l from-purple-600/10 to-transparent blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* ── Top Breadcrumbs ── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200 font-medium">Features</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1">
              v{APP_VERSION} Live
            </Badge>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-neutral-300 mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Airsend Platform v{APP_VERSION}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-500" />
            <span className="text-blue-400 font-semibold">Unified Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Every Tool Your Team Needs,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              All in One Workspace.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Manage tickets, upload files, collaborate in real-time channels, host Google Meet-grade video calls, and summon automated meeting bots—seamlessly linked together.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 gap-2"
            >
              <Link href="/v2/tasks">
                Launch Workspace Apps
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <Link href="/change-logs">View v{APP_VERSION} Changelog</Link>
            </Button>
          </div>
        </div>

        {/* ── Six Core Suite Pillars (Cards Grid) ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The 6 Core Suite Pillars
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Click any app below to open its dedicated module directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_SUITE_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#14161d]/90 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-[#161821] hover:shadow-2xl hover:scale-[1.01]"
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110",
                        pillar.iconBg
                      )}
                    >
                      <pillar.icon className="size-5" />
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border",
                        pillar.badgeColor
                      )}
                    >
                      {pillar.tag}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Highlights List */}
                  <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
                    {pillar.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  {pillar.isUpcoming ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400">
                      <Sparkles className="size-3.5" />
                      <span>Upcoming Release</span>
                    </span>
                  ) : (
                    <Link
                      href={pillar.route}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Open {pillar.title.split(" ")[0]}</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {pillar.isUpcoming ? "Coming Soon" : pillar.route}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security, Platform & Developer Capabilities ── */}
        <div className="mb-20 rounded-3xl border border-white/10 bg-[#12141a]/95 p-6 sm:p-10 shadow-xl">
          <div className="max-w-3xl mb-8">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1 mb-3">
              <Shield className="size-3" />
              Enterprise Architecture
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built on High-Performance Security & Protocols
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Beyond workspace and meetings, Airsend provides battle-tested infrastructure for transactional relay, domain authentication, and end-to-end privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PLATFORM_CAPABILITIES.map((group) => (
              <div key={group.category} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <group.icon className="size-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">{group.category}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                    >
                      <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="text-center rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 p-8 sm:p-12 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to experience the unified Airsend Suite?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto mt-3">
            Tasks, Files, Workspace, Google Meet-grade calls, and Meeting Bot are all ready.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30"
            >
              <Link href="/v2/u/mail">Open Webmail</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-6 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm"
            >
              <Link href="/v2/workspace">Open Workspace</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
