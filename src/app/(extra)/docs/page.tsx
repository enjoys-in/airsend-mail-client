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
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    description: "Set up your account and start using Airsend in minutes.",
    href: "/docs/getting-started",
    icon: <Settings className="h-6 w-6" />,
  },
  {
    title: "Account & Workspace",
    description: "Create accounts, manage workspaces, and generate API keys.",
    href: "/docs/account",
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Domain Setup",
    description: "Add and verify your custom domain for sending emails.",
    href: "/docs/domain",
    icon: <Globe className="h-6 w-6" />,
  },
  {
    title: "DNS Records",
    description: "Configure MX, SPF, DKIM, DMARC, and PTR records for email authentication.",
    href: "/docs/dns-records",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: "Sending Emails",
    description: "Learn how to compose, send, and manage emails with Airsend.",
    href: "/docs/sending-emails",
    icon: <Send className="h-6 w-6" />,
  },
  {
    title: "Bulk Sending",
    description: "Guidelines for sending at scale while maintaining deliverability.",
    href: "/docs/bulk-sending",
    icon: <Mail className="h-6 w-6" />,
  },
  {
    title: "Calendar",
    description: "Manage events and scheduling with the built-in calendar.",
    href: "/docs/calendar",
    icon: <Calendar className="h-6 w-6" />,
  },
  {
    title: "Logs",
    description: "Track activity, email delivery, and bounce logs.",
    href: "/docs/logs",
    icon: <ScrollText className="h-6 w-6" />,
  },
  {
    title: "Error Messages",
    description: "Understand common email server errors and how to resolve them.",
    href: "/docs/error-messages",
    icon: <AlertTriangle className="h-6 w-6" />,
  },
  {
    title: "IMAP & SMTP Setup",
    description: "Configure email clients with IMAP and SMTP server settings.",
    href: "/docs/imap-smtp",
    icon: <MonitorSmartphone className="h-6 w-6" />,
  },
  {
    title: "SMTP Response Codes",
    description: "Complete reference of SMTP status codes and their meanings.",
    href: "/docs/smtp-codes",
    icon: <Server className="h-6 w-6" />,
  },
];

export default function DocsHome() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Airsend Documentation
          </h1>
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            v2
          </Badge>
        </div>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Everything you need to set up, configure, and use Airsend for reliable email delivery.
          From account creation to DNS configuration and troubleshooting.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <Card className="h-full transition-colors border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 dark:text-blue-400">{section.icon}</div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Need the API reference?</strong> Check out the{" "}
            <Link href="/docs/getting-started" className="underline font-medium">
              Getting Started
            </Link>{" "}
            guide which includes interactive API documentation and testing tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
