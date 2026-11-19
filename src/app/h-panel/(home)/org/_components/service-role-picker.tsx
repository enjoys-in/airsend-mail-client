"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { IServiceRoles, OrgService, OrgServiceRole, ServiceRoleChanges } from "../_lib/types"

export const ORG_SERVICES: { key: OrgService; label: string; hint: string }[] = [
    { key: "files", label: "Files", hint: "Admins connect and manage the organization's storage." },
    { key: "tasks", label: "Tasks", hint: "Admins manage projects and members in Tasks." },
    { key: "workspace", label: "Workspace", hint: "Admins can create teams and manage the workspace." },
]

/** "inherit" = no override: the service follows the organization-wide role. */
export type ServiceRoleChoice = "inherit" | "admin" | "member"
export type ServiceRoleChoices = Record<OrgService, ServiceRoleChoice>

export const INHERIT_ALL: ServiceRoleChoices = { files: "inherit", tasks: "inherit", workspace: "inherit" }

export const roleLabel = (role: string) => (role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Member")

/** Starting choices for a member: a service whose role differs from the org-wide role is an override. */
export function choicesFromMember(orgRole: string | undefined, roles: IServiceRoles | undefined): ServiceRoleChoices {
    const base = (orgRole || "member").trim().toLowerCase()
    const next = { ...INHERIT_ALL }
    if (!roles) return next
    for (const { key } of ORG_SERVICES) {
        const effective = roles[key]
        // An owner row is the creator's: it cannot be changed here, and an unchanged service is not an override.
        if (effective && effective !== "owner" && effective !== base) next[key] = effective
    }
    return next
}

/** The request body part for the choices: `null` clears an override. Only `changedOnly` services are sent when given. */
export function choicesToChanges(choices: ServiceRoleChoices, only?: OrgService[]): ServiceRoleChanges {
    const out: ServiceRoleChanges = {}
    for (const { key } of ORG_SERVICES) {
        if (only && !only.includes(key)) continue
        out[key] = choices[key] === "inherit" ? null : choices[key]
    }
    return out
}

/** Services whose choice differs from `before`. */
export const changedServices = (before: ServiceRoleChoices, after: ServiceRoleChoices): OrgService[] =>
    ORG_SERVICES.map((s) => s.key).filter((k) => before[k] !== after[k])

interface ServiceRolePickerProps {
    value: ServiceRoleChoices
    onChange: (service: OrgService, choice: ServiceRoleChoice) => void
    /** The organization-wide role, named in the "same as" option. */
    orgRole?: string
    disabled?: boolean
    /** The services the creator holds as owner: shown but locked. */
    locked?: OrgService[]
}

/** One Select per service: "Same as org role (default)", Member or Admin. */
export function ServiceRolePicker({ value, onChange, orgRole, disabled, locked = [] }: ServiceRolePickerProps) {
    return (
        <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
                The organization role is the default everywhere. Override a service to give this account a different role
                there, for example <strong>Admin in Files</strong> but <strong>Member in Tasks</strong>.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
                {ORG_SERVICES.map((service) => (
                    <div key={service.key} className="space-y-1.5">
                        <Label className="text-xs font-semibold">{service.label}</Label>
                        <Select
                            value={value[service.key]}
                            onValueChange={(v) => onChange(service.key, v as ServiceRoleChoice)}
                            disabled={disabled || locked.includes(service.key)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inherit" className="text-xs">
                                    Same as org role{orgRole ? ` (${roleLabel(orgRole.toLowerCase())})` : ""}
                                </SelectItem>
                                <SelectItem value="member" className="text-xs">Member</SelectItem>
                                <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] leading-snug text-muted-foreground">{service.hint}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const BADGE_STYLES: Record<OrgServiceRole, string> = {
    owner: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    admin: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
    member: "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300",
}

/** Compact "Files Admin · Tasks Member · Workspace Member" row for the members table. */
export function ServiceRoleBadges({ roles }: { roles?: IServiceRoles }) {
    if (!roles) return <span className="text-xs text-muted-foreground">—</span>
    return (
        <div className="flex flex-wrap items-center gap-1 max-w-[230px]">
            {ORG_SERVICES.map(({ key, label }) => {
                const role = roles[key] ?? "member"
                return (
                    <span
                        key={key}
                        title={`${label}: ${roleLabel(role)}`}
                        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${BADGE_STYLES[role] ?? BADGE_STYLES.member}`}
                    >
                        {label}
                        <span className="font-semibold">{roleLabel(role)}</span>
                    </span>
                )
            })}
        </div>
    )
}
