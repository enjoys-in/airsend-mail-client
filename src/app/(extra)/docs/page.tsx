import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BookOpen,
  Mail,
  Globe,
  Shield,
  Server,
  Users,
  Calendar,
  ScrollText,
  AlertTriangle,
  Send,
  Settings,
  ArrowRight,
  MonitorSmartphone,
  CheckSquare,
  FileText,
  Layers,
  Video,
  Bot,
  Workflow,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { APP_VERSION } from "@/constants/version";

// Suite applications added in v2.9
const SUITE_PRODUCTS = [
  {
    title: "Tasks & Ticket Tracker",
    description: "Manage tickets, sprint tasks, and Kaneo Kanban boards with custom stages.",
    href: "/v2/tasks",
    icon: <CheckSquare className="h-5 w-5 text-emerald-400" />,
    badge: "v2.9",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    title: "Files & Cloud Drive",
    description: "Upload, preview documents, organize media, and securely share team attachments.",
    href: "/v2/files",
    icon: <FileText className="h-5 w-5 text-amber-400" />,
    badge: "v2.9",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    title: "Workspace (Slack + Teams)",
    description: "Team chat channels, direct messages, voice rooms, typing indicators, and threads.",
    href: "/v2/workspace",
    icon: <Layers className="h-5 w-5 text-indigo-400" />,
    badge: "v2.9",
    tagColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  {
    title: "Airsend Meet",
    description: "Google Meet-grade video conferencing, instant room codes, and whiteboard.",
    href: "/v2/workspace/calls",
    icon: <Video className="h-5 w-5 text-rose-400" />,
    badge: "v2.9",
    tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    title: "AI Meeting Bot",
    description: "Automated meeting attendee that transcribes audio, summarizes, and logs tasks.",
    href: "/v2/workspace/calls",
    icon: <Bot className="h-5 w-5 text-cyan-400" />,
    badge: "v2.9",
    tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    title: "Workflows & Automations",
    description: "Low-code DAG visual pipelines, triggers, and multi-service automation engine.",
    href: "/features#workflows",
    icon: <Workflow className="h-5 w-5 text-amber-400" />,
    badge: "Upcoming",
    tagColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    upcoming: true,
  },
];

// Core Email and System Documentation
const sections = [
  {
    title: "Getting Started",
    description: "Set up your account and start using Airsend in minutes.",
    href: "/docs/getting-started",
    icon: <Settings className="h-5 w-5 text-blue-500" />,
  },
  {
    title: "Account & Workspace",
    description: "Create accounts, manage workspaces, and generate API keys.",
    href: "/docs/account",
    icon: <Users className="h-5 w-5 text-indigo-500" />,
  },
  {
    title: "Domain Setup",
    description: "Add and verify your custom domain for sending emails.",
    href: "/docs/domain",
    icon: <Globe className="h-5 w-5 text-emerald-500" />,
  },
  {
    title: "DNS Records",
    description: "Configure MX, SPF, DKIM, DMARC, and PTR records for email authentication.",
    href: "/docs/dns-records",
    icon: <Shield className="h-5 w-5 text-violet-500" />,
  },
  {
    title: "Sending Emails",
    description: "Learn how to compose, send, and manage emails with Airsend.",
    href: "/docs/sending-emails",
    icon: <Send className="h-5 w-5 text-cyan-500" />,
  },
  {
    title: "Bulk Sending",
    description: "Guidelines for sending at scale while maintaining deliverability.",
    href: "/docs/bulk-sending",
    icon: <Mail className="h-5 w-5 text-amber-500" />,
  },
  {
    title: "Calendar",
    description: "Manage events and scheduling with the built-in calendar.",
    href: "/docs/calendar",
    icon: <Calendar className="h-5 w-5 text-rose-500" />,
  },
  {
    title: "Logs",
    description: "Track activity, email delivery, and bounce logs.",
    href: "/docs/logs",
    icon: <ScrollText className="h-5 w-5 text-teal-500" />,
  },
  {
    title: "Error Messages",
    description: "Understand common email server errors and how to resolve them.",
    href: "/docs/error-messages",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
  },
  {
    title: "IMAP & SMTP Setup",
    description: "Configure email clients with IMAP and SMTP server settings.",
    href: "/docs/imap-smtp",
    icon: <MonitorSmartphone className="h-5 w-5 text-purple-500" />,
  },
  {
    title: "SMTP Response Codes",
    description: "Complete reference of SMTP status codes and their meanings.",
    href: "/docs/smtp-codes",
    icon: <Server className="h-5 w-5 text-sky-500" />,
  },
];

export default function DocsHome() {
  return (
    <div className="space-y-12">
      {/* Header section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Airsend Documentation
          </h1>
          <Badge
            variant="outline"
            className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          >
            v{APP_VERSION}
          </Badge>
        </div>
        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Everything you need to build, deliver, and collaborate with Airsend. From custom domain DNS authentication to workspace channels, video calls, ticket tracking, and automated workflows.
        </p>
      </div>

      {/* Section 1: Suite Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="size-4 text-blue-500" /> Suite Products &amp; Tools
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Integrated collaboration apps powered by Airsend Suite v{APP_VERSION}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUITE_PRODUCTS.map((item) => (
            <Link key={item.title} href={item.href} className="group">
              <div
                className={`h-full rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  item.upcoming
                    ? "bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/40"
                    : "bg-white/80 dark:bg-[#111317]/80 backdrop-blur-md border-neutral-200 dark:border-white/10 hover:border-blue-500/40 shadow-xs hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="size-9 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${item.tagColor}`}>
                      {item.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-blue-500">
                  <span>{item.upcoming ? "View Roadmap" : "Open App"}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 2: Core Email & Infrastructure Docs */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Email Delivery &amp; Infrastructure Guides
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Set up DNS records, configure SMTP/IMAP clients, review error codes, and audit logs
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full bg-white/80 dark:bg-[#111317]/80 backdrop-blur-md border-neutral-200 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-200 rounded-2xl shadow-xs hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                        {section.icon}
                      </div>
                      <CardTitle className="text-base text-neutral-900 dark:text-white">
                        {section.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Interactive API Helper Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
            Looking for interactive API documentation?
          </h4>
          <p className="mt-1 text-xs text-blue-700/80 dark:text-blue-300/70 max-w-xl">
            Explore our interactive endpoints for sending transactional emails, retrieving logs, managing domains, and listening to real-time webhook events.
          </p>
        </div>
        <Link
          href="/docs/getting-started"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
        >
          View API Reference <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}