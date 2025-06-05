"use client"
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
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Organizations",
    items: [
      {
        title: "All Organizations",
        url: "/",
        icon: Building2,
      },
      {
        title: "Add Organization",
        url: "/organizations/add",
        icon: Plus,
      },
      {
        title: "Members",
        url: "/members",
        icon: Users,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Roles & Permissions",
        url: "/roles",
        icon: Shield,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Domains",
        url: "/domains",
        icon: Globe,
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        title: "Logs",
        url: "/logs",
        icon: FileText,
      },
      {
        title: "Metrics",
        url: "/metrics",
        icon: BarChart3,
      },
      {
        title: "IP Sessions",
        url: "/sessions",
        icon: Activity,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Danger Zone",
        url: "/danger-zone",
        icon: AlertTriangle,
      },
    ],
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold">Org Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
