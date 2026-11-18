"use client"

import { useState, useEffect, useMemo } from "react"
import {
    User,
    Paintbrush,
    Import,
    MessageSquare,
    Lock,
    UserCircle,
    Folder,
    Filter,
    Forward,
    Key,
    Server,
    Bell,
    Pen,
    CalendarDays,
    Search,
    SlidersHorizontal,
    Mail,
    X,
} from "lucide-react"
import { useSettingsStore } from "@/store/settings"
import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface SettingsMenuItem {
    icon: React.ReactNode
    label: string
    key: string
    description?: string
}

export const accountItems: SettingsMenuItem[] = [
    { icon: <User size={16} />, label: "Account and password", key: "account-and-password", description: "Profile, name, quota" },
    { icon: <Pen size={16} />, label: "Signatures", key: "signatures", description: "Email signature manager" },
    { icon: <Paintbrush size={16} />, label: "Appearance", key: "appearance", description: "Themes, layouts, fonts" },
    { icon: <Bell size={16} />, label: "Notifications", key: "notifications", description: "Alerts & push updates" },
    { icon: <Import size={16} />, label: "Import via Easy Switch", key: "import-via-easy-switch", description: "Migrate from other providers" },
]

export const mailItems: SettingsMenuItem[] = [
    { icon: <Filter size={16} />, label: "Filters", key: "filters", description: "Rules & sieve filters" },
    { icon: <Server size={16} />, label: "IMAP/SMTP", key: "imap-smtp", description: "Protocol & alias access" },
    { icon: <EnvelopeOpenIcon height={16} width={16} />, label: "Email Config", key: "email-config", description: "Blocklists, auto-reply, vacation" },
    { icon: <Lock size={16} />, label: "Email privacy", key: "email-privacy", description: "Tracker & image protection" },
    { icon: <Key size={16} />, label: "Encryption and keys", key: "encryption-and-keys", description: "PGP encryption keys" },
    { icon: <Folder size={16} />, label: "Folders and labels", key: "folders-and-labels", description: "Folder colors & tags" },
    { icon: <Forward size={16} />, label: "Email Forwarding", key: "email-forwarding", description: "Forwarding destination rules" },
    { icon: <UserCircle size={16} />, label: "Identity and addresses", key: "identity-and-addresses", description: "Aliases and sending identities" },
    { icon: <MessageSquare size={16} />, label: "Messages and composing", key: "messages-and-composing", description: "Threading, limits, footers" },
    { icon: <CalendarDays size={16} />, label: "Calendar", key: "calendar", description: "CalDAV sync & subscriptions" },
]

export const allSettingsItems: SettingsMenuItem[] = [...accountItems, ...mailItems]

export const SettingsMenu = () => {
    const activeItem = useSettingsStore((s) => s.activeItem)
    const setActiveItem = useSettingsStore((s) => s.setActiveItem)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const updateTabFromHash = () => {
            const hash = decodeURIComponent(window.location.hash.replace("#", ""))
            if (hash) {
                setActiveItem(hash)
            }
        }

        updateTabFromHash()
        window.addEventListener("hashchange", updateTabFromHash)
        return () => window.removeEventListener("hashchange", updateTabFromHash)
    }, [setActiveItem])

    useEffect(() => {
        if (activeItem) {
            window.location.hash = encodeURIComponent(activeItem)
        }
    }, [activeItem])

    const filterItem = (item: SettingsMenuItem) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
            item.label.toLowerCase().includes(query) ||
            item.key.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        )
    }

    const filteredAccountItems = useMemo(
        () => accountItems.filter(filterItem),
        [searchQuery]
    )

    const filteredMailItems = useMemo(
        () => mailItems.filter(filterItem),
        [searchQuery]
    )

    const handleSelect = (key: string) => {
        if (activeItem !== key) {
            setActiveItem(key)
        }
    }

    return (
        <div className="flex flex-col h-full text-sidebar-foreground">
            {/* Header with Title & Search */}
            <div className="p-3 border-b border-border/40 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-primary" />
                        <h2 className="text-sm font-semibold tracking-tight text-foreground">
                            Settings
                        </h2>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                        {allSettingsItems.length} tabs
                    </span>
                </div>

                {/* Quick Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search settings..."
                        className="h-8 pl-8 pr-7 text-xs bg-background/60 border-border/60 rounded-lg placeholder:text-muted-foreground/60"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav Links */}
            <ScrollArea className="flex-1 px-2 py-3">
                <div className="space-y-4">
                    {/* Account Section */}
                    {filteredAccountItems.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-2 mb-1.5">
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                                    Account
                                </h3>
                                <span className="text-[10px] text-muted-foreground/60 font-mono">
                                    {filteredAccountItems.length}
                                </span>
                            </div>
                            <nav className="space-y-0.5" aria-label="Account settings">
                                {filteredAccountItems.map((item) => {
                                    const isActive = activeItem === item.key
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleSelect(item.key)}
                                            className={cn(
                                                "group flex items-center w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg transition-all duration-150 text-left",
                                                isActive
                                                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "mr-2.5 shrink-0 transition-colors",
                                                    isActive
                                                        ? "text-primary-foreground"
                                                        : "text-muted-foreground group-hover:text-foreground"
                                                )}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="truncate flex-1">{item.label}</span>
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                    )}

                    {/* Airsend Mail Section */}
                    {filteredMailItems.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-2 mb-1.5">
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                                    Airsend Mail
                                </h3>
                                <span className="text-[10px] text-muted-foreground/60 font-mono">
                                    {filteredMailItems.length}
                                </span>
                            </div>
                            <nav className="space-y-0.5" aria-label="Mail settings">
                                {filteredMailItems.map((item) => {
                                    const isActive = activeItem === item.key
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleSelect(item.key)}
                                            className={cn(
                                                "group flex items-center w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg transition-all duration-150 text-left",
                                                isActive
                                                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "mr-2.5 shrink-0 transition-colors",
                                                    isActive
                                                        ? "text-primary-foreground"
                                                        : "text-muted-foreground group-hover:text-foreground"
                                                )}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="truncate flex-1">{item.label}</span>
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                    )}

                    {filteredAccountItems.length === 0 && filteredMailItems.length === 0 && (
                        <div className="py-8 text-center px-4">
                            <p className="text-xs text-muted-foreground">No settings found matching &quot;{searchQuery}&quot;</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-xs text-primary hover:underline font-medium"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
