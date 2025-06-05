"use client"

import Link from "next/link"
import {
  Building2,
  Settings,
  Shield,
  Activity,
  FileText,
  Plus,
  BarChart3,
  Globe,
  AlertTriangle,
  Users,
} from "lucide-react"

const navigationItems = [
  {
    title: "Organizations",
    items: [
      { title: "All Organizations", url: "/h-panel/org", icon: Building2 },
      { title: "Add Organization", url: "/h-panel/org/add", icon: Plus },
      { title: "Members", url: "/h-panel/org/members", icon: Users },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Roles & Permissions", url: "/h-panel/org/roles", icon: Shield },
      { title: "Settings", url: "/h-panel/org/settings", icon: Settings },
      { title: "Domains", url: "/h-panel/org/domains", icon: Globe },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { title: "Logs", url: "/h-panel/org/logs", icon: FileText },
      { title: "Metrics", url: "/h-panel/org/metrics", icon: BarChart3 },
      { title: "IP Sessions", url: "/h-panel/org/sessions", icon: Activity },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Danger Zone", url: "/h-panel/org/danger-zone", icon: AlertTriangle },
    ],
  },
]

export function OrgSidebar() {
  return (
    <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <span className="text-lg font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
          Org Manager
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {navigationItems.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide px-2 mb-2">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium 
                    text-neutral-700 hover:text-blue-600 hover:bg-neutral-100 
                    dark:text-neutral-300 dark:hover:text-blue-400 dark:hover:bg-neutral-800 
                    transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      
     
    </div>
  )
}
