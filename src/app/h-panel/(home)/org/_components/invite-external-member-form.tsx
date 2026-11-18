"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Send,
    Sparkles,
    Building2,
    Globe,
    UserCheck,
    Mail,
    User,
    Loader2,
    ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import {
    SCOPE_FEATURES,
    type ScopeFeature,
    type ScopePermission,
} from "@/lib/types/workspace.interface"
import { buildScope } from "@/lib/workspace-utils"
import type { IOrganization, IRole } from "../_lib/types"
import { ScopeSelectorGrid, type PermissionLevel } from "./scope-selector-grid"
import { MailboxFormulaPreview } from "./mailbox-formula-preview"

export interface InviteExternalMemberFormProps {
    organizations: IOrganization[]
    domains: any[]
    roles: IRole[]
    initialOrgId?: string
    initialDomainId?: string
    onSuccess?: () => void
    onCancel?: () => void
}

function detectEmailProvider(email: string): string | null {
    if (!email.includes("@")) return null
    const domain = email.split("@")[1]?.toLowerCase()
    if (!domain) return null
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live") || domain.includes("msn")) {
        return "Microsoft Outlook"
    }
    if (domain.includes("gmail") || domain.includes("google")) {
        return "Google Workspace / Gmail"
    }
    if (domain.includes("yahoo") || domain.includes("ymail")) {
        return "Yahoo Mail"
    }
    if (domain.includes("icloud") || domain.includes("me.com")) {
        return "Apple iCloud"
    }
    if (domain.includes("proton") || domain.includes("protonmail")) {
        return "ProtonMail"
    }
    return domain
}

function slugify(name: string): string {
    return (name || "org")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32) || "org"
}

export function InviteExternalMemberForm({
    organizations,
    domains,
    roles,
    initialOrgId,
    initialDomainId,
    onSuccess,
    onCancel,
}: InviteExternalMemberFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    // ── Local Form State (Optimized to prevent typing latency) ──
    const [email, setEmail] = React.useState("")
    const [name, setName] = React.useState("")
    const [orgId, setOrgId] = React.useState(initialOrgId || (organizations[0] ? String(organizations[0].id) : ""))
    const [domainId, setDomainId] = React.useState(initialDomainId || (domains[0] ? String(domains[0].id) : ""))
    const [role, setRole] = React.useState("member")
    const [submitting, setSubmitting] = React.useState(false)

    // Feature scopes state
    const [scopes, setScopes] = React.useState<Record<ScopeFeature, PermissionLevel>>({
        mail: "rw",
        calendar: "rw",
        tasks: "rw",
        workspace: "rw",
        files: "rw",
        contacts: "ro",
    })

    // Sync initial selections if loaded asynchronously
    React.useEffect(() => {
        if (!orgId && organizations.length > 0) {
            setOrgId(String(organizations[0].id))
        }
    }, [organizations, orgId])

    React.useEffect(() => {
        if (!domainId && domains.length > 0) {
            setDomainId(String(domains[0].id))
        }
    }, [domains, domainId])

    // Deferred values: Decouple user typing from background preview calculations
    const deferredEmail = React.useDeferredValue(email)
    const providerBadge = React.useMemo(() => detectEmailProvider(deferredEmail), [deferredEmail])

    // Memoize scope handler so ScopeSelectorGrid never re-renders while typing
    const handleScopeChange = React.useCallback((feature: ScopeFeature, permission: PermissionLevel) => {
        setScopes((prev) => ({ ...prev, [feature]: permission }))
    }, [])

    // Derive active org & domain info
    const selectedOrg = React.useMemo(
        () => organizations.find((o) => String(o.id) === String(orgId)),
        [organizations, orgId]
    )
    const selectedDomain = React.useMemo(
        () => domains.find((d) => String(d.id) === String(domainId)),
        [domains, domainId]
    )

    const orgSlug = selectedOrg ? slugify(selectedOrg.name) : "org"
    const targetDomainName = selectedDomain?.domain_name || "yourdomain.com"

    // ── Submission Handler ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedEmail = email.trim().toLowerCase()
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid external email address (e.g. user@outlook.com)",
                variant: "destructive",
            })
            return
        }

        if (!orgId) {
            toast({
                title: "Organization required",
                description: "Please select an organization for this invitation.",
                variant: "destructive",
            })
            return
        }

        if (!domainId) {
            toast({
                title: "Domain required",
                description: "Please select a verified domain for mailbox provisioning.",
                variant: "destructive",
            })
            return
        }

        // Convert scopes into string array e.g. ["mail:rw", "calendar:rw", ...]
        const scopeList: string[] = []
        SCOPE_FEATURES.forEach((feature) => {
            const perm = scopes[feature]
            if (perm && perm !== "none") {
                scopeList.push(buildScope(feature, perm as ScopePermission))
            }
        })

        setSubmitting(true)
        try {
            const { data: res } = await API.createInvitation({
                email: trimmedEmail,
                name: name.trim() || undefined,
                org_id: orgId,
                domain_id: domainId,
                role,
                scopes: scopeList,
            })

            if (res?.success) {
                toast({
                    title: "Invitation sent successfully!",
                    description: `An invite email was delivered to ${trimmedEmail}.`,
                })
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push("/h-panel/org/members")
                }
            } else {
                throw new Error(res?.message || "Failed to create invitation")
            }
        } catch (error: any) {
            toast({
                title: "Failed to send invitation",
                description: error.message || "Something went wrong. Please check details and retry.",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Section 1: Member Profile & Recipient ── */}
            <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-2 border-b pb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground">
                            Recipient & Role Assignment
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Specify the external email recipient and their target workspace organization.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* External Email Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="ext-email" className="text-xs font-semibold">
                                External Email Address <span className="text-destructive">*</span>
                            </Label>
                            {providerBadge && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/30 text-primary">
                                    {providerBadge}
                                </Badge>
                            )}
                        </div>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            <Input
                                id="ext-email"
                                type="email"
                                placeholder="colleague@outlook.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9 text-xs sm:text-sm font-mono"
                                required
                                autoFocus
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            The external inbox where the branded invitation link will be sent.
                        </p>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="ext-name" className="text-xs font-semibold">
                            Recipient Display Name
                        </Label>
                        <div className="relative">
                            <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            <Input
                                id="ext-name"
                                type="text"
                                placeholder="e.g. Alex Johnson"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9 text-xs sm:text-sm"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Personalizes the invitation template and directory listing.
                        </p>
                    </div>
                </div>

                {/* Organization, Domain & Role Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                            Organization <span className="text-destructive">*</span>
                        </Label>
                        <Select value={orgId} onValueChange={setOrgId}>
                            <SelectTrigger className="text-xs h-9">
                                <SelectValue placeholder="Select Organization" />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={String(org.id)} className="text-xs">
                                        {org.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                            Target Domain <span className="text-destructive">*</span>
                        </Label>
                        <Select value={domainId} onValueChange={setDomainId}>
                            <SelectTrigger className="text-xs h-9">
                                <SelectValue placeholder="Select Domain" />
                            </SelectTrigger>
                            <SelectContent>
                                {domains.map((dom) => (
                                    <SelectItem key={dom.id} value={String(dom.id)} className="text-xs">
                                        @{dom.domain_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Assigned Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="text-xs h-9">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member" className="text-xs">Member</SelectItem>
                                <SelectItem value="admin" className="text-xs">Administrator</SelectItem>
                                <SelectItem value="viewer" className="text-xs">Viewer</SelectItem>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.name} className="text-xs">
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Reusable Scope Selector Grid ── */}
            <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-xs">
                <ScopeSelectorGrid
                    scopes={scopes}
                    onChange={handleScopeChange}
                    disabled={submitting}
                />
            </div>

            {/* ── Section 3: Reusable Mailbox Formula Preview ── */}
            <MailboxFormulaPreview
                orgSlug={orgSlug}
                externalEmail={deferredEmail}
                targetDomain={targetDomainName}
                role={role}
            />

            {/* ── Action Buttons ── */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel || (() => router.push("/h-panel/org/members"))}
                    disabled={submitting}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={submitting || !email.includes("@") || !orgId || !domainId}
                    className="min-w-[190px] gap-2 shadow-xs"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Invitation...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Send Invitation Email
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
