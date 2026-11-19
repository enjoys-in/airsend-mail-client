"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  CheckCircle2,
  Bug,
  Calendar,
  Layers,
  CheckSquare,
  FileText,
  Video,
  Bot,
  Mail,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Tag,
  Clock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CHANGE_LOGS } from "./data";
import { APP_VERSION } from "@/constants/version";

// Suite Products Quick Links
const SUITE_PRODUCTS = [
  {
    name: "Tasks",
    icon: CheckSquare,
    href: "/v2/tasks",
    badge: "Tickets & Agile",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
  },
  {
    name: "Files",
    icon: FileText,
    href: "/v2/files",
    badge: "Cloud Storage",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
  },
  {
    name: "Workspace",
    icon: Layers,
    href: "/v2/workspace",
    badge: "Slack + Teams",
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40",
  },
  {
    name: "Meet",
    icon: Video,
    href: "/v2/workspace/calls",
    badge: "Google Meet",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40",
  },
  {
    name: "Meeting Bot",
    icon: Bot,
    href: "/v2/workspace/calls",
    badge: "AI Assistant",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
  },
  {
    name: "Calendar",
    icon: Calendar,
    href: "/v2/calender",
    badge: "CalDAV Sync",
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40",
  },
  {
    name: "Webmail",
    icon: Mail,
    href: "/v2/u/mail",
    badge: "Encrypted Mail",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
  },
];

export default function ChangelogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajorVersion, setSelectedMajorVersion] = useState<string>("all");

  const majorVersions = useMemo(() => {
    const set = new Set<string>();
    CHANGE_LOGS.forEach((log) => {
      const parts = log.versionNumber.split(".");
      if (parts.length >= 2) {
        set.add(`v${parts[0]}.${parts[1]}`);
      }
    });
    return Array.from(set).slice(0, 7);
  }, []);

  const filteredLogs = useMemo(() => {
    return CHANGE_LOGS.filter((log) => {
      // Filter by major version
      if (selectedMajorVersion !== "all") {
        const prefix = selectedMajorVersion.replace("v", "");
        if (!log.versionNumber.startsWith(prefix)) return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesVersion = log.versionNumber.toLowerCase().includes(q);
        const matchesDate = log.date.toLowerCase().includes(q);
        const matchesImprovements = log.improvements.some((item) =>
          item.toLowerCase().includes(q)
        );
        const matchesBugfixes = log.bugfixes.some((item) =>
          item.toLowerCase().includes(q)
        );
        return matchesVersion || matchesDate || matchesImprovements || matchesBugfixes;
      }
      return true;
    });
  }, [searchQuery, selectedMajorVersion]);

  // Helper to extract product link if an improvement refers to one of our suite features
  const getProductPill = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("task") || lower.includes("ticket")) {
      return { name: "Open Tasks", href: "/v2/tasks", icon: CheckSquare, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
    if (lower.includes("file") || lower.includes("storage")) {
      return { name: "Open Files", href: "/v2/files", icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
    if (lower.includes("workspace") || lower.includes("channel")) {
      return { name: "Open Workspace", href: "/v2/workspace", icon: Layers, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
    }
    if (lower.includes("meet") || lower.includes("video call")) {
      return { name: "Open Meet", href: "/v2/workspace/calls", icon: Video, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    if (lower.includes("bot") || lower.includes("transcribe")) {
      return { name: "Meeting Bot", href: "/v2/workspace/calls", icon: Bot, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    }
    if (lower.includes("calendar") || lower.includes("rsvp")) {
      return { name: "Open Calendar", href: "/v2/calender", icon: Calendar, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-neutral-100 selection:bg-blue-600/30">
      {/* ── Ambient Background Glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-[35%] -left-[10%] w-[600px] h-[500px] bg-gradient-to-r from-purple-600/10 to-transparent blur-[130px]" />
        <div className="absolute top-[60%] -right-[10%] w-[600px] h-[500px] bg-gradient-to-l from-emerald-600/10 to-transparent blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* ── Top Breadcrumb & Back Link ── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200 font-medium">Changelog</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1">
              Current: v{APP_VERSION}
            </Badge>
          </div>
        </div>

        {/* ── Hero Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-neutral-300 mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Airsend Release Stream</span>
            <span className="w-1 h-1 rounded-full bg-neutral-500" />
            <span className="text-blue-400 font-semibold">Live Updates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            What's New in{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Airsend
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Explore feature releases, suite integrations, and major performance updates across Tasks, Files, Workspaces, Video Meet, Meeting Bot, and Calendar.
          </p>

          {/* ── Suite Products Quick Link Bar ── */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-3">
              Explore Added Products
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {SUITE_PRODUCTS.map((prod) => (
                <Link
                  key={prod.name}
                  href={prod.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:scale-[1.03]",
                    prod.color
                  )}
                >
                  <prod.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{prod.name}</span>
                  <span className="text-[10px] opacity-70 hidden sm:inline">
                    ({prod.badge})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="mb-10 sm:mb-14 rounded-2xl bg-[#14161d]/80 border border-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search releases, tasks, files, meet, bugfixes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm bg-black/40 border-white/10 text-white placeholder:text-neutral-500 rounded-xl focus-visible:ring-blue-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Version Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedMajorVersion("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all",
                  selectedMajorVersion === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                All Versions
              </button>
              {majorVersions.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedMajorVersion(v)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all",
                    selectedMajorVersion === v
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {searchQuery && (
            <div className="mt-3 text-xs text-neutral-400 flex items-center justify-between">
              <span>Found {filteredLogs.length} matching release{filteredLogs.length !== 1 ? "s" : ""}</span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMajorVersion("all");
                }}
                className="text-blue-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* ── Timeline of Releases ── */}
        <div className="relative pl-6 sm:pl-10 space-y-12 sm:space-y-16">
          {/* Vertical Timeline Guide Line */}
          <div className="absolute left-[11px] sm:left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500 via-indigo-500/50 to-transparent" />

          {filteredLogs.map((log, index) => {
            const isLatest = index === 0 && selectedMajorVersion === "all" && !searchQuery;
            return (
              <div key={log.versionNumber} className="relative group">
                {/* Timeline Dot Node */}
                <div
                  className={cn(
                    "absolute -left-[23px] sm:-left-[31px] top-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    isLatest
                      ? "border-blue-400 bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                      : "border-neutral-700 bg-[#16181f]"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isLatest ? "bg-white animate-ping" : "bg-neutral-500"
                    )}
                  />
                </div>

                {/* Release Card */}
                <div
                  className={cn(
                    "rounded-2xl border p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 shadow-xl",
                    isLatest
                      ? "bg-gradient-to-br from-[#161a26]/95 via-[#13151f]/90 to-[#101217]/95 border-blue-500/30 shadow-blue-950/20"
                      : "bg-[#14161d]/85 border-white/[0.08] hover:border-white/15 hover:bg-[#161821]/90"
                  )}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          v{log.versionNumber}
                        </span>
                        {isLatest && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-[10px] tracking-wider uppercase px-2 py-0.5">
                            Latest Suite Release
                          </Badge>
                        )}
                      </div>
                      <span className="text-neutral-500 text-sm hidden sm:inline">•</span>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{log.date}</span>
                      </div>
                    </div>

                    {isLatest && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          asChild
                          className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 font-medium shadow-md shadow-blue-600/20"
                        >
                          <Link href="/v2/tasks">
                            Launch Apps Suite
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Improvements & New Features */}
                  {log.improvements.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
                        <Zap className="w-4 h-4" />
                        <span>What's New & Improvements</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {log.improvements.map((imp, i) => {
                          const pill = getProductPill(imp);
                          const parts = imp.split("—");
                          const title = parts[0]?.trim();
                          const desc = parts.slice(1).join("—").trim();

                          return (
                            <div
                              key={i}
                              className="group/item flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-white">
                                    {title}
                                  </span>
                                  {pill && (
                                    <Link
                                      href={pill.href}
                                      className={cn(
                                        "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-medium transition-colors hover:scale-[1.02]",
                                        pill.color
                                      )}
                                    >
                                      <pill.icon className="w-3 h-3" />
                                      <span>{pill.name}</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </Link>
                                  )}
                                </div>
                                {desc && (
                                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bugfixes */}
                  {log.bugfixes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-3">
                        <Bug className="w-4 h-4" />
                        <span>Bug Fixes & Hardening</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {log.bugfixes.map((fix, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-500/[0.04] border border-rose-500/15 text-xs text-neutral-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{fix}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#14161d] border border-white/10">
              <Search className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No changelog entries found</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Try searching with a different keyword or reset your version filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMajorVersion("all");
                }}
                className="mt-4 text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
