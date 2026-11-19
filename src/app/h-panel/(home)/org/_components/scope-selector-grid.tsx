"use client"

import * as React from "react"
import { Mail, Calendar, ListTodo, Boxes, FileText, Users } from "lucide-react"
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
    mail: { label: "Mail", description: "Webmail, IMAP and SMTP sending", icon: Mail },
    calendar: { label: "Calendar", description: "Events, bookings and RSVPs", icon: Calendar },
    tasks: { label: "Tasks", description: "Boards, checklists and assignees", icon: ListTodo },
    workspace: { label: "Workspace", description: "Team channels, chats and mentions", icon: Boxes },
    files: { label: "Files", description: "Cloud drive, sharing and attachments", icon: FileText },
    contacts: { label: "Contacts", description: "Address book and directory", icon: Users },
}

const PERMISSION_OPTIONS: { value: PermissionLevel; label: string }[] = [
    { value: "rw", label: "Read and write" },
    { value: "ro", label: "Read only" },
    { value: "none", label: "No access" },
]

/** Per-feature access level: one quiet card per feature with a three-way segmented control. */
export const ScopeSelectorGrid = React.memo(function ScopeSelectorGrid({
    scopes,
    onChange,
    disabled = false,
    className,
}: ScopeSelectorGridProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                    Choose what this member can use in each module of the workspace.
                </p>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => SCOPE_FEATURES.forEach((f) => onChange(f, "rw"))}
                        className="text-xs text-foreground underline-offset-4 hover:underline disabled:opacity-50"
                    >
                        Allow all
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => SCOPE_FEATURES.forEach((f) => onChange(f, "ro"))}
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                    >
                        Read only for all
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {SCOPE_FEATURES.map((feature) => {
                    const meta = FEATURE_META[feature]
                    const currentPerm = scopes[feature] || "none"
                    const Icon = meta.icon

                    return (
                        <div
                            key={feature}
                            className="flex flex-col justify-between gap-3 rounded-lg border border-border/70 bg-card p-3.5"
                        >
                            <div className="flex items-start gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium">{meta.label}</div>
                                    <div className="text-xs leading-tight text-muted-foreground">{meta.description}</div>
                                </div>
                            </div>

                            <div role="radiogroup" aria-label={`${meta.label} access`} className="grid grid-cols-3 gap-0.5 rounded-md bg-muted/60 p-0.5">
                                {PERMISSION_OPTIONS.map((opt) => {
                                    const isSelected = currentPerm === opt.value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            disabled={disabled}
                                            onClick={() => onChange(feature, opt.value)}
                                            className={cn(
                                                "select-none rounded px-1 py-1 text-center text-[11px] leading-4 transition-colors disabled:opacity-60",
                                                isSelected
                                                    ? cn(
                                                          "bg-background font-medium shadow-sm",
                                                          opt.value === "rw" && "text-emerald-700 dark:text-emerald-400",
                                                          opt.value === "ro" && "text-blue-700 dark:text-blue-400",
                                                          opt.value === "none" && "text-foreground"
                                                      )
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {opt.value === "rw" ? "Read/write" : opt.value === "ro" ? "Read" : "None"}
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
