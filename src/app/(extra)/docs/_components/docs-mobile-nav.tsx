"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Menu,
  X,
  MonitorSmartphone,
  CheckSquare,
  FileText,
  Layers,
  Video,
  Bot,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const SUITE_ITEMS = [
  { title: "Tasks & Tickets", href: "/v2/tasks", icon: <CheckSquare className="h-4 w-4 text-emerald-400" /> },
  { title: "Files & Storage", href: "/v2/files", icon: <FileText className="h-4 w-4 text-amber-400" /> },
  { title: "Workspace Chat", href: "/v2/workspace", icon: <Layers className="h-4 w-4 text-indigo-400" /> },
  { title: "Airsend Meet", href: "/v2/workspace/calls", icon: <Video className="h-4 w-4 text-rose-400" /> },
  { title: "AI Meeting Bot", href: "/v2/workspace/calls", icon: <Bot className="h-4 w-4 text-cyan-400" /> },
  { title: "Workflows (Upcoming)", href: "/features#workflows", icon: <Workflow className="h-4 w-4 text-amber-400" />, badge: "Upcoming" },
];

const DOC_ITEMS = [
  { title: "Overview", href: "/docs", icon: <BookOpen className="h-4 w-4" /> },
  { title: "Getting Started", href: "/docs/getting-started", icon: <Settings className="h-4 w-4" /> },
  { title: "Account & Workspace", href: "/docs/account", icon: <Users className="h-4 w-4" /> },
  { title: "Domain Setup", href: "/docs/domain", icon: <Globe className="h-4 w-4" /> },
  { title: "DNS Records", href: "/docs/dns-records", icon: <Shield className="h-4 w-4" /> },
  { title: "Sending Emails", href: "/docs/sending-emails", icon: <Send className="h-4 w-4" /> },
  { title: "Bulk Sending", href: "/docs/bulk-sending", icon: <Mail className="h-4 w-4" /> },
  { title: "Calendar", href: "/docs/calendar", icon: <Calendar className="h-4 w-4" /> },
  { title: "Logs", href: "/docs/logs", icon: <ScrollText className="h-4 w-4" /> },
  { title: "Error Messages", href: "/docs/error-messages", icon: <AlertTriangle className="h-4 w-4" /> },
  { title: "IMAP & SMTP Setup", href: "/docs/imap-smtp", icon: <MonitorSmartphone className="h-4 w-4" /> },
  { title: "SMTP Response Codes", href: "/docs/smtp-codes", icon: <Server className="h-4 w-4" /> },
];

export default function DocsMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/docs") return pathname === "/docs";
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200/60 dark:bg-white/10 backdrop-blur-sm rounded-lg"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Docs Menu &amp; Suite Apps
      </button>

      {open && (
        <div className="mt-3 p-4 bg-white/95 dark:bg-[#12141a]/95 backdrop-blur-md rounded-xl border border-neutral-200 dark:border-white/10 shadow-xl space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-2 block mb-2">
              Suite Products (v2.9)
            </span>
            <div className="grid grid-cols-2 gap-1">
              {SUITE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-white/10 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-2 block mb-2">
              Documentation &amp; API
            </span>
            <div className="space-y-0.5">
              {DOC_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}