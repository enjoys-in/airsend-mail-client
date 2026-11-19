"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Send, Mail, User, Loader2 } from "lucide-react"

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
import { FormActions, NextSteps, Pill, Section, SplitForm } from "./kit"

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
                    title: "Invitation sent",
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

    const aside = (
        <>
            <NextSteps
                steps={[
                    "They get an email with a secure invitation link.",
                    "They sign in with their own Outlook, Gmail or other account and accept.",
                    "Their mailbox is set up on the chosen domain with the role and access you picked.",
                ]}
            />
            <MailboxFormulaPreview
                orgSlug={orgSlug}
                externalEmail={deferredEmail}
                targetDomain={targetDomainName}
                role={role}
            />

            <FormActions>
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
                    className="flex-1 gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Send invitation
                        </>
                    )}
                </Button>
            </FormActions>
        </>
    )

    return (
        <form onSubmit={handleSubmit}>
            <SplitForm aside={aside}>
            <Section title="Recipient" description="Who to invite and where the invitation link goes.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* External Email Input */}
                    <div className="space-y-1.5">
                        <div className="flex min-h-6 items-center justify-between gap-2">
                            <Label htmlFor="ext-email" className="text-sm">
                                External email <span className="text-destructive">*</span>
                            </Label>
                            {providerBadge && <Pill tone="blue">{providerBadge}</Pill>}
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="ext-email"
                                type="email"
                                placeholder="colleague@outlook.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-9 pl-9 font-mono text-sm"
                                required
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">The inbox that receives the invitation link.</p>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-1.5">
                        <div className="flex min-h-6 items-center">
                            <Label htmlFor="ext-name" className="text-sm">
                                Display name
                            </Label>
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="ext-name"
                                type="text"
                                placeholder="e.g. Alex Johnson"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 pl-9 text-sm"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Used in the invitation email and the member list.</p>
                    </div>
                </div>
            </Section>

            <Section title="Access" description="Where they join and what role they get.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label className="text-sm">
                            Organization <span className="text-destructive">*</span>
                        </Label>
                        <Select value={orgId} onValueChange={setOrgId}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={String(org.id)} className="text-sm">
                                        {org.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm">
                            Domain <span className="text-destructive">*</span>
                        </Label>
                        <Select value={domainId} onValueChange={setDomainId}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                            <SelectContent>
                                {domains.map((dom) => (
                                    <SelectItem key={dom.id} value={String(dom.id)} className="text-sm">
                                        @{dom.domain_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member" className="text-sm">Member</SelectItem>
                                <SelectItem value="admin" className="text-sm">Administrator</SelectItem>
                                <SelectItem value="viewer" className="text-sm">Viewer</SelectItem>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.name} className="text-sm">
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Section>

            <Section title="Feature access">
                <ScopeSelectorGrid scopes={scopes} onChange={handleScopeChange} disabled={submitting} />
            </Section>

            </SplitForm>
        </form>
    )
}
