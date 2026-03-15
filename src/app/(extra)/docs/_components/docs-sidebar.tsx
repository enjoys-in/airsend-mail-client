"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  ChevronDown,
  ChevronRight,
  MonitorSmartphone,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  children?: { title: string; href: string }[]
}

const navigation: NavItem[] = [
  {
    title: "Overview",
    href: "/docs",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Account & Workspace",
    href: "/docs/account",
    icon: <Users className="h-4 w-4" />,
    children: [
      { title: "Create Account", href: "/docs/account#create-account" },
      { title: "Workspace", href: "/docs/account#workspace" },
      { title: "API Keys", href: "/docs/account#api-keys" },
    ],
  },
  {
    title: "Domain Setup",
    href: "/docs/domain",
    icon: <Globe className="h-4 w-4" />,
    children: [
      { title: "Add Domain", href: "/docs/domain#add-domain" },
      { title: "Verify Domain", href: "/docs/domain#verify-domain" },
      { title: "Domain Settings", href: "/docs/domain#domain-settings" },
    ],
  },
  {
    title: "DNS Records",
    href: "/docs/dns-records",
    icon: <Shield className="h-4 w-4" />,
    children: [
      { title: "MX Record", href: "/docs/dns-records#mx" },
      { title: "SPF Record", href: "/docs/dns-records#spf" },
      { title: "DKIM Record", href: "/docs/dns-records#dkim" },
      { title: "DMARC Record", href: "/docs/dns-records#dmarc" },
      { title: "PTR Record", href: "/docs/dns-records#ptr" },
    ],
  },
  {
    title: "Sending Emails",
    href: "/docs/sending-emails",
    icon: <Send className="h-4 w-4" />,
    children: [
      { title: "Compose & Send", href: "/docs/sending-emails#compose" },
      { title: "Attachments", href: "/docs/sending-emails#attachments" },
      { title: "Templates", href: "/docs/sending-emails#templates" },
      { title: "Requirements", href: "/docs/sending-emails#requirements" },
    ],
  },
  {
    title: "Bulk Sending",
    href: "/docs/bulk-sending",
    icon: <Mail className="h-4 w-4" />,
    children: [
      { title: "Warmup", href: "/docs/bulk-sending#warmup" },
      { title: "Best Practices", href: "/docs/bulk-sending#best-practices" },
      { title: "Mailing Lists", href: "/docs/bulk-sending#mailing-lists" },
    ],
  },
  {
    title: "Calendar",
    href: "/docs/calendar",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: "Logs",
    href: "/docs/logs",
    icon: <ScrollText className="h-4 w-4" />,
    children: [
      { title: "Activity Logs", href: "/docs/logs#activity-logs" },
      { title: "Email Logs", href: "/docs/logs#email-logs" },
      { title: "Bounce Logs", href: "/docs/logs#bounce-logs" },
    ],
  },
  {
    title: "Error Messages",
    href: "/docs/error-messages",
    icon: <AlertTriangle className="h-4 w-4" />,
    children: [
      { title: "Common Errors", href: "/docs/error-messages#common-errors" },
      { title: "Bounce Types", href: "/docs/error-messages#bounce-types" },
    ],
  },
  {
    title: "IMAP & SMTP Setup",
    href: "/docs/imap-smtp",
    icon: <MonitorSmartphone className="h-4 w-4" />,
    children: [
      { title: "IMAP Configuration", href: "/docs/imap-smtp#imap" },
      { title: "SMTP Configuration", href: "/docs/imap-smtp#smtp" },
      { title: "Email Clients", href: "/docs/imap-smtp#email-clients" },
    ],
  },
  {
    title: "SMTP Response Codes",
    href: "/docs/smtp-codes",
    icon: <Server className="h-4 w-4" />,
    children: [
      { title: "2xx Success", href: "/docs/smtp-codes#2xx" },
      { title: "4xx Temporary", href: "/docs/smtp-codes#4xx" },
      { title: "5xx Permanent", href: "/docs/smtp-codes#5xx" },
    ],
  },
]

export default function DocsSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (href: string) => {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  const isActive = (href: string) => {
    if (href === "/docs") return pathname === "/docs"
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100/80 dark:bg-[#201B39]/80 backdrop-blur-sm overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 px-2">
          Documentation
        </p>
        {navigation.map((item) => (
          <div key={item.href}>
            <div className="flex items-center">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md flex-1 transition-colors",
                  isActive(item.href)
                    ? "bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-white/5"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
              {item.children && (
                <button
                  onClick={() => toggleExpand(item.href)}
                  className="p-1 rounded hover:bg-neutral-200/50 dark:hover:bg-white/5"
                >
                  {expanded[item.href] || isActive(item.href) ? (
                    <ChevronDown className="h-3 w-3 text-neutral-500" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-neutral-500" />
                  )}
                </button>
              )}
            </div>
            {item.children && (expanded[item.href] || isActive(item.href)) && (
              <div className="ml-6 mt-1 space-y-0.5 border-l border-neutral-300/50 dark:border-neutral-700/50 pl-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
