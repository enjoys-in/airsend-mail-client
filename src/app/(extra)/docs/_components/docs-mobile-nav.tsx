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
  Menu,
  X,
  MonitorSmartphone,
} from "lucide-react"
import { useState } from "react"

const navigation = [
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
]

export default function DocsMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/docs") return pathname === "/docs"
    return pathname.startsWith(href)
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200/60 dark:bg-[#201B39]/60 backdrop-blur-sm rounded-md mb-4"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Navigation
      </button>
      {open && (
        <nav className="mb-6 p-3 bg-neutral-100/80 dark:bg-[#201B39]/80 backdrop-blur-sm rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                isActive(item.href)
                  ? "bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-white/5"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
