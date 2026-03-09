"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Building2,
    Settings,
    Shield,
    FileText,
    Plus,
    Globe,
    AlertTriangle,
    Users,
    History,
    Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const navigationItems = [
    {
        title: "Organizations",
        items: [
            { title: "All Organizations", url: "/h-panel/org", icon: Building2 },
            { title: "Create Organization", url: "/h-panel/org/create", icon: Plus },
            { title: "Members", url: "/h-panel/org/members", icon: Users },
            { title: "Add Member", url: "/h-panel/org/members/add", icon: Plus },
        ],
    },
    {
        title: "Management",
        items: [
            { title: "Roles & Permissions", url: "/h-panel/org/roles", icon: Shield },
            { title: "Domains", url: "/h-panel/org/domains", icon: Globe },
            { title: "Domain History", url: "/h-panel/org/domain-history", icon: History },
        ],
    },
    {
        title: "Monitoring",
        items: [
            { title: "Logs", url: "/h-panel/org/logs", icon: FileText },
        ],
    },
    {
        title: "Administration",
        items: [
            { title: "Danger Zone", url: "/h-panel/org/danger-zone", icon: AlertTriangle },
        ],
    },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()

    return (
        <nav className="px-2">
            {navigationItems.map((section) => (
                <div key={section.title} className="mb-4">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1.5">
                        {section.title}
                    </div>
                    <div className="space-y-0.5">
                        {section.items.map((item) => {
                            const isActive =
                                pathname === item.url ||
                                (item.url !== "/h-panel/org" && pathname.startsWith(item.url + "/"))
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    onClick={onNavigate}
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                                        isActive
                                            ? "bg-neutral-100 dark:bg-neutral-800 text-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span>{item.title}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            ))}
        </nav>
    )
}

export default function OrgLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    // Defer portal rendering until after hydration
    React.useEffect(() => { setMounted(true) }, [])

    // Close sheet on every route change to prevent portal/DOM cleanup race
    React.useEffect(() => { setMobileOpen(false) }, [pathname])

    return (
        <div className="flex w-full">
            {/* ── Desktop sidebar ── */}
            <aside className="hidden md:block w-60 shrink-0 border-r border-neutral-200 dark:border-neutral-800">
                <div className="sticky top-16 h-[calc(100svh-4rem)] flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold tracking-tight">Org Manager</span>
                    </div>
                    <ScrollArea className="flex-1 py-2">
                        <SidebarNav />
                    </ScrollArea>
                </div>
            </aside>

            {/* ── Mobile sheet (only mount portal after hydration) ── */}
            {mounted && (
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="left" className="w-64 p-0 md:hidden">
                        <div className="flex items-center gap-2 px-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold tracking-tight">Org Manager</span>
                        </div>
                        <ScrollArea className="flex-1 py-2">
                            <SidebarNav onNavigate={() => setMobileOpen(false)} />
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            )}

            <div className="flex flex-1 flex-col min-w-0">
                {/* ── Mobile header bar ── */}
                <div className="flex md:hidden h-12 shrink-0 items-center gap-2 border-b px-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open navigation</span>
                    </Button>
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold">Org Manager</span>
                </div>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
