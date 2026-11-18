"use client"

import * as React from "react"
import {
    Mail,
    Calendar,
    ListTodo,
    Boxes,
    FileText,
    Users,
    Shield,
    Check,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    SCOPE_FEATURES,
    type ScopeFeature,
    type ScopePermission,
} from "@/lib/types/workspace.interface"
import { cn } from "@/lib/utils"

export type PermissionLevel = ScopePermission | "none"

export interface ScopeSelectorGridProps {
    scopes: Record<ScopeFeature, PermissionLevel>
    onChange: (feature: ScopeFeature, permission: PermissionLevel) => void
    disabled?: boolean
    className?: string
}

interface FeatureMetadata {
    label: string
    description: string
    icon: React.ElementType
}

const FEATURE_META: Record<ScopeFeature, FeatureMetadata> = {
    mail: {
        label: "Mail",
        description: "Webmail, IMAP & SMTP sending",
        icon: Mail,
    },
    calendar: {
        label: "Calendar",
        description: "Events, bookings & RSVP tracking",
        icon: Calendar,
    },
    tasks: {
        label: "Tasks",
        description: "Boards, checklists & task assignees",
        icon: ListTodo,
    },
    workspace: {
        label: "Workspace",
        description: "Team channels, chats & mentions",
        icon: Boxes,
    },
    files: {
        label: "Files",
        description: "Cloud drive, sharing & attachments",
        icon: FileText,
    },
    contacts: {
        label: "Contacts",
        description: "Address book & organization directory",
        icon: Users,
    },
}

const PERMISSION_OPTIONS: { value: PermissionLevel; label: string; short: string; badge: string }[] = [
    {
        value: "rw",
        label: "Read & Write",
        short: "Full Access",
        badge: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800",
    },
    {
        value: "ro",
        label: "Read Only",
        short: "View Only",
        badge: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800",
    },
    {
        value: "none",
        label: "No Access",
        short: "Disabled",
        badge: "text-muted-foreground bg-muted/40 border-border",
    },
]

export const ScopeSelectorGrid = React.memo(function ScopeSelectorGrid({
    scopes,
    onChange,
    disabled = false,
    className,
}: ScopeSelectorGridProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        Feature Scopes & Permissions
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Grant granular read/write rights for this member across workspace modules.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            SCOPE_FEATURES.forEach((f) => onChange(f, "rw"))
                        }}
                        className="text-[11px] font-medium text-primary hover:underline transition-colors disabled:opacity-50"
                    >
                        Grant All
                    </button>
                    <span className="text-muted-foreground text-xs">•</span>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            SCOPE_FEATURES.forEach((f) => onChange(f, "ro"))
                        }}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        View Only All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SCOPE_FEATURES.map((feature) => {
                    const meta = FEATURE_META[feature]
                    const currentPerm = scopes[feature] || "none"
                    const Icon = meta.icon

                    return (
                        <div
                            key={feature}
                            className="p-3.5 rounded-xl border bg-card/60 hover:bg-card transition-colors flex flex-col justify-between gap-3 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">
                                            {meta.label}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground leading-tight">
                                            {meta.description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segmented Pill Selector (No truncation, zero lag, instant feedback) */}
                            <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
                                {PERMISSION_OPTIONS.map((opt) => {
                                    const isSelected = currentPerm === opt.value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onChange(feature, opt.value)}
                                            className={cn(
                                                "py-1 px-1.5 rounded-md text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1 select-none",
                                                isSelected
                                                    ? cn(
                                                          "shadow-xs border",
                                                          opt.value === "rw" &&
                                                              "bg-background text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-semibold",
                                                          opt.value === "ro" &&
                                                              "bg-background text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 font-semibold",
                                                          opt.value === "none" &&
                                                              "bg-background text-muted-foreground border-border font-normal"
                                                      )
                                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                            )}
                                        >
                                            {isSelected && opt.value !== "none" && (
                                                <Check className="w-3 h-3 shrink-0" />
                                            )}
                                            <span className="truncate">{opt.short}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
})
