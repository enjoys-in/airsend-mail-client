"use client";

import React, { useState } from "react";
import { Check, Minus, Sparkles, HelpCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanDetail {
  feature: string;
  category: "Core & Limits" | "Security & Deliverability" | "Automation & Mail" | "Suite & Collaboration" | "Developer & API";
  tooltip?: string;
  free: string;
  startup: string;
  scaler: string;
  professional: string;
  team: string;
  highlight?: boolean;
}

const PLAN_DETAILS: PlanDetail[] = [
  // Suite & Collaboration (New additions + Core)
  {
    category: "Suite & Collaboration",
    feature: "Workspace (Channels & DMs)",
    tooltip: "Slack + MS Teams alternative: public/private channels and direct messages",
    free: "-",
    startup: "-",
    scaler: "true",
    professional: "true",
    team: "Available",
    highlight: true,
  },
  {
    category: "Suite & Collaboration",
    feature: "Airsend Meet (Video Calls)",
    tooltip: "Google Meet-grade video conferencing with room codes and screen sharing",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
    highlight: true,
  },
  {
    category: "Suite & Collaboration",
    feature: "AI Meeting Bot",
    tooltip: "Automated AI assistant to attend meetings, transcribe, and take action items",
    free: "-",
    startup: "5 hrs/mo",
    scaler: "25 hrs/mo",
    professional: "Unlimited",
    team: "Unlimited",
    highlight: true,
  },
  {
    category: "Suite & Collaboration",
    feature: "Tasks & Ticket Manager",
    tooltip: "Kanban boards, sprint tasks, and ticketing system with custom stages",
    free: "10 tickets",
    startup: "Unlimited",
    scaler: "Unlimited",
    professional: "Unlimited",
    team: "Unlimited",
    highlight: true,
  },
  {
    category: "Suite & Collaboration",
    feature: "Files & Cloud Drive",
    tooltip: "Upload, preview, tag, and organize team files with pluggable storage",
    free: "1 GB",
    startup: "25 GB",
    scaler: "50 GB",
    professional: "Unlimited",
    team: "Unlimited",
    highlight: true,
  },
  {
    category: "Suite & Collaboration",
    feature: "Calender & Events",
    tooltip: "Calendar event management, scheduling, CalDAV sync, and inbox RSVP",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Suite & Collaboration",
    feature: "Workflows & Automations",
    tooltip: "Low-code DAG visual workflow automation engine (Triggers, filters, webhooks)",
    free: "Upcoming",
    startup: "Upcoming",
    scaler: "Upcoming",
    professional: "Upcoming",
    team: "Upcoming",
    highlight: true,
  },

  // Core & Limits
  {
    category: "Core & Limits",
    feature: "Number of Domains",
    tooltip: "Custom domains you can link and verify with MX/SPF/DKIM/DMARC",
    free: "10",
    startup: "Up to 25",
    scaler: "Up to 50",
    professional: "Unlimited",
    team: "Up to 10",
  },
  {
    category: "Core & Limits",
    feature: "Mailboxes",
    tooltip: "Individual user inboxes and mailbox accounts per domain",
    free: "Unlimited",
    startup: "Unlimited",
    scaler: "Unlimited",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Core & Limits",
    feature: "Storage",
    tooltip: "Total storage capacity across all emails, files, and attachments",
    free: "1 GB",
    startup: "25 GB",
    scaler: "50 GB",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Core & Limits",
    feature: "Attachments Size Limit",
    tooltip: "Maximum upload size for email attachments and shared files",
    free: "100 MB",
    startup: "500 MB",
    scaler: "true",
    professional: "true",
    team: "true",
  },
  {
    category: "Core & Limits",
    feature: "Per Day Emails",
    tooltip: "Daily sending quota across standard SMTP, webmail, and API endpoints",
    free: "300",
    startup: "600",
    scaler: "850",
    professional: "100",
    team: "1000",
  },
  {
    category: "Core & Limits",
    feature: "Organization",
    tooltip: "Multiple independent sub-organizations or workspaces",
    free: "1",
    startup: "10",
    scaler: "25",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Core & Limits",
    feature: "Per User Limit",
    tooltip: "Fine-grained per-user sending rate and storage limits",
    free: "-",
    startup: "-",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },

  // Security & Deliverability
  {
    category: "Security & Deliverability",
    feature: "Anti Spam",
    tooltip: "Machine learning anti-spam filtering with heuristic score analysis",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Anti Virus",
    tooltip: "Real-time automated scanning of inbound and outbound attachments",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Anti Phishing",
    tooltip: "Link verification and sender spoofing prevention mechanisms",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Anti Malware",
    tooltip: "Zero-day attachment sandbox inspection and malware signatures",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Ip Whitelist/Blacklist",
    tooltip: "Filter SMTP connections and API requests by CIDR ranges",
    free: "-",
    startup: "-",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Domain Whitelist/Blacklist",
    tooltip: "Global domain inbound rule management and reputation filtering",
    free: "-",
    startup: "-",
    scaler: "true",
    professional: "",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Relay Server",
    tooltip: "Dedicated smart-host relay forwarding for high volume traffic",
    free: "-",
    startup: "-",
    scaler: "-",
    professional: "-",
    team: "Unlimited",
  },
  {
    category: "Security & Deliverability",
    feature: "Mail Exchanger",
    tooltip: "Custom dedicated MX clustering with multi-region failover",
    free: "-",
    startup: "-",
    scaler: "-",
    professional: "-",
    team: "true",
  },

  // Automation & Mail
  {
    category: "Automation & Mail",
    feature: "Drag & Drop Editor",
    tooltip: "Visual WYSIWYG responsive email and template builder",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "true",
  },
  {
    category: "Automation & Mail",
    feature: "Email Templates",
    tooltip: "Saved reusable HTML and markdown email templates",
    free: "10",
    startup: "25",
    scaler: "50",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Email Forwarding",
    tooltip: "Automated routing and forwarding rules across mailboxes",
    free: "-",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Email Aliases",
    tooltip: "Alternative email handles forwarding to primary inbox",
    free: "",
    startup: "10",
    scaler: "30",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "UseEmail Alises as SMTP",
    tooltip: "Send outbound emails with alias headers directly via SMTP",
    free: "-",
    startup: "-",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Catch All Emails",
    tooltip: "Receive all emails sent to any unassigned address on your domain",
    free: "5",
    startup: "25",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Multi SMTP",
    tooltip: "Configure multiple outbound relay pools for failover",
    free: "-",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Auto Responder",
    tooltip: "Out of office and automated holiday responses",
    free: "-",
    startup: "5",
    scaler: "20",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Auto Forwarder",
    tooltip: "Server-side forwarding rules without client open",
    free: "-",
    startup: "10",
    scaler: "30",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Campaigns",
    tooltip: "Email blast campaigns with audience segmentation",
    free: "true",
    startup: "25",
    scaler: "250",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Automation & Mail",
    feature: "Alerts",
    tooltip: "Real-time deliverability warnings, bounce alerts, and threshold triggers",
    free: "-",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },

  // Developer & API
  {
    category: "Developer & API",
    feature: "API Access",
    tooltip: "RESTful HTTP API with full programmatic email and domain control",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "true",
  },
  {
    category: "Developer & API",
    feature: "SMTP",
    tooltip: "Standard SMTP server connectivity on ports 25, 465, 587",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "true",
  },
  {
    category: "Developer & API",
    feature: "IMAP",
    tooltip: "Full IMAP client sync for Apple Mail, Thunderbird, Outlook",
    free: "-",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Developer & API",
    feature: "Webhooks",
    tooltip: "Real-time HTTP delivery, bounce, open, and click notifications",
    free: "5",
    startup: "20",
    scaler: "100",
    professional: "Unlimited",
    team: "Unlimited",
  },
  {
    category: "Developer & API",
    feature: "RealTime Mail Receive",
    tooltip: "Instant WebSocket and push event notifications on new incoming mail",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
  {
    category: "Developer & API",
    feature: "Incoming Outgoing Logs",
    tooltip: "Detailed searchable audit trails for every SMTP handshake and message",
    free: "-",
    startup: "-",
    scaler: "true",
    professional: "true",
    team: "true",
  },
  {
    category: "Developer & API",
    feature: "Mail Tracking",
    tooltip: "Open rate, link click telemetry, and recipient device analytics",
    free: "-",
    startup: "",
    scaler: "",
    professional: "",
    team: "Unlimited",
  },
  {
    category: "Developer & API",
    feature: "Req Limit/min on Send",
    tooltip: "Maximum rate limit of outbound send API calls per minute",
    free: "3",
    startup: "25",
    scaler: "60",
    professional: "100",
    team: "Unlimited",
  },
  {
    category: "Developer & API",
    feature: "Req Limit/min on Get",
    tooltip: "Maximum rate limit of read API queries per minute",
    free: "10",
    startup: "50",
    scaler: "100",
    professional: "200",
    team: "Unlimited",
  },
  {
    category: "Developer & API",
    feature: "Integrations",
    tooltip: "Pre-built connectors with Zapier, Slack, Discord, and Webhooks",
    free: "true",
    startup: "true",
    scaler: "true",
    professional: "true",
    team: "Unlimited",
  },
];

const CATEGORIES = [
  "All Features",
  "Suite & Collaboration",
  "Core & Limits",
  "Security & Deliverability",
  "Automation & Mail",
  "Developer & API",
] as const;

export const Available = () => (
  <span className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
    <Check className="size-3.5 stroke-[2.5]" />
  </span>
);

export const NotAvailable = () => (
  <span className="inline-flex items-center justify-center size-5 rounded-full text-neutral-500 dark:text-neutral-600">
    <Minus className="size-3.5" />
  </span>
);

const ValidInput = ({ text }: { text: string }) => {
  if (text === "true" || text.toLowerCase() === "available") {
    return <Available />;
  }
  if (text === "-" || !text) {
    return <NotAvailable />;
  }
  if (text.toLowerCase() === "upcoming") {
    return (
      <Badge
        variant="outline"
        className="text-[10px] uppercase font-semibold px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30"
      >
        Upcoming
      </Badge>
    );
  }
  return (
    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
      {text}
    </span>
  );
};

const ComparePlanDetails = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All Features");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlans = PLAN_DETAILS.filter((plan) => {
    const matchesCategory =
      activeCategory === "All Features" || plan.category === activeCategory;
    const matchesSearch =
      plan.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="relative py-16 md:py-24 bg-neutral-50/60 dark:bg-[#0b0d11]/80 border-t border-b border-neutral-200/60 dark:border-white/5">
      <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          >
            Detailed Comparison
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Compare all features side-by-side
          </h2>
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
            From single developer hobby projects to enterprise-scale email delivery and team collaboration.
          </p>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/50 dark:bg-white/5 backdrop-blur-md rounded-xl border border-neutral-300/40 dark:border-white/10 w-full sm:w-auto overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-white dark:bg-blue-600 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#12141a] border border-neutral-300 dark:border-white/10 rounded-lg text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Comparison Table Container */}
        <div className="relative overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-[#111317]/90 backdrop-blur-xl shadow-xl">
          {/* Sticky Table Header */}
          <div className="min-w-[860px] sticky top-0 z-20 bg-neutral-100/95 dark:bg-[#15181f]/95 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Feature / Capability
                </span>
              </div>
              <div className="col-span-8 grid grid-cols-5 gap-2 text-center">
                <div className="px-2">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Free</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">₹0 forever</div>
                </div>
                <div className="px-2">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Startup</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">₹29/mo</div>
                </div>
                <div className="px-2 bg-blue-500/10 rounded-lg py-1 border border-blue-500/20">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Scaler</div>
                  <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80">₹44/mo</div>
                </div>
                <div className="px-2">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Professional</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">₹149/mo</div>
                </div>
                <div className="px-2">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">Teams</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">₹260/mo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="min-w-[860px] divide-y divide-neutral-200/60 dark:divide-white/5">
            {filteredPlans.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No features matched your search &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "grid grid-cols-12 gap-4 items-center px-6 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.02]",
                    plan.highlight && "bg-blue-500/[0.02] dark:bg-blue-500/[0.04]"
                  )}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      {plan.feature}
                    </span>
                    {plan.highlight && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-full border border-blue-500/20">
                        <Sparkles className="size-2.5" /> New
                      </span>
                    )}
                    {plan.tooltip && (
                      <span
                        title={plan.tooltip}
                        className="cursor-help text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        <HelpCircle className="size-3" />
                      </span>
                    )}
                  </div>

                  <div className="col-span-8 grid grid-cols-5 gap-2 text-center items-center">
                    <div className="flex justify-center">
                      <ValidInput text={plan.free} />
                    </div>
                    <div className="flex justify-center">
                      <ValidInput text={plan.startup} />
                    </div>
                    <div className="flex justify-center bg-blue-500/[0.03] py-1 rounded">
                      <ValidInput text={plan.scaler} />
                    </div>
                    <div className="flex justify-center">
                      <ValidInput text={plan.professional} />
                    </div>
                    <div className="flex justify-center">
                      <ValidInput text={plan.team} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note underneath table */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            * Workflows &amp; DAG automation engine is currently in preview and will be rolled out as an included upgrade for Scaler, Professional, and Teams plans.
          </div>
          <div>
            Need custom limits or high-volume IP pools?{" "}
            <a href="mailto:support@airsend.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact Enterprise Sales &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparePlanDetails;