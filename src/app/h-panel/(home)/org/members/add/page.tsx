"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Send,
    Mail,
    Shield,
    Sparkles,
    CheckCircle2,
    Building2,
    Globe,
    Sliders,
    UserCheck,
    UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import {
    SCOPE_FEATURES,
    SCOPE_PERMISSIONS,
    type ScopeFeature,
    type ScopePermission,
} from "@/lib/types/workspace.interface"
import { buildScope } from "@/lib/workspace-utils"
import type { IOrganization, IRole } from "../../_lib/types"

function slugify(name: string): string {
    return (name || "org")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32) || "org"
}

function cleanLocalPart(email: string): string {
    const raw = (email || "").split("@")[0] || "user"
    const cleaned = raw.toLowerCase().trim().replace(/[^a-z0-9.-]/g, "").replace(/^\.+|\.+$/g, "")
    return cleaned.slice(0, 32) || "user"
}

export default function AddMemberPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [mode, setMode] = React.useState<"invite" | "internal">("invite")
    const [organizations, setOrganizations] = React.useState<IOrganization[]>([])
    const [domains, setDomains] = React.useState<any[]>([])
    const [roles, setRoles] = React.useState<IRole[]>([])
    const [loading, setLoading] = React.useState(true)
    const [submitting, setSubmitting] = React.useState(false)

    // ── Invite Form State ──
    const [inviteEmail, setInviteEmail] = React.useState("")
    const [inviteName, setInviteName] = React.useState("")
    const [selectedOrgId, setSelectedOrgId] = React.useState("")
    const [selectedDomainId, setSelectedDomainId] = React.useState("")
    const [selectedRole, setSelectedRole] = React.useState("member")
    const [scopes, setScopes] = React.useState<Record<ScopeFeature, ScopePermission>>({
        mail: "rw",
        calendar: "rw",
        tasks: "rw",
        workspace: "rw",
        files: "rw",
        contacts: "ro",
    })

    // ── Internal Account Form State ──
    const [internalName, setInternalName] = React.useState("")
    const [internalUsername, setInternalUsername] = React.useState("")
    const [internalPassword, setInternalPassword] = React.useState("")
    const [internalDomainId, setInternalDomainId] = React.useState("")
    const [internalRole, setInternalRole] = React.useState("member")

    // Fetch Orgs, Domains, and Roles
    React.useEffect(() => {
        Promise.all([
            API.getOrganizations().catch(() => ({ data: { result: [] } })),
            API.handleGetAllDomains().catch(() => ({ data: { result: [] } })),
            API.getRoles().catch(() => ({ data: { result: [] } })),
        ])
            .then(([oRes, dRes, rRes]) => {
                const orgList: IOrganization[] = oRes.data?.result || oRes.data || []
                const domainList = (dRes.data?.result || dRes.data || []).filter(
                    (d: any) => d.status === DOMAIN_STATUS.VERIFIED
                )
                const roleList: IRole[] = rRes.data?.result || rRes.data || []

                setOrganizations(orgList)
                setDomains(domainList)
                setRoles(roleList)

                if (orgList.length > 0) setSelectedOrgId(String(orgList[0].id))
                if (domainList.length > 0) {
                    setSelectedDomainId(domainList[0].id)
                    setInternalDomainId(domainList[0].id)
                }
            })
            .finally(() => setLoading(false))
    }, [])

    const activeOrg = organizations.find((o) => String(o.id) === selectedOrgId)
    const activeDomain = domains.find((d) => d.id === selectedDomainId)

    // Compute live preview of generated email address
    const previewOrgSlug = activeOrg ? slugify(activeOrg.name) : "org"
    const previewLocalPart = inviteEmail.includes("@") ? cleanLocalPart(inviteEmail) : "user"
    const previewDomain = activeDomain?.domain_name || "yourdomain.com"
    const generatedEmailPreview = `ext.${previewOrgSlug}.[id].${previewLocalPart}@${previewDomain}`

    const handleScopeToggle = (feature: ScopeFeature, perm: ScopePermission) => {
        setScopes((prev) => ({ ...prev, [feature]: perm }))
    }

    // ── Handle External Invite Submission ──
    const handleSendInvitation = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!inviteEmail || !inviteEmail.includes("@")) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid external email address (e.g. user@outlook.com)",
                variant: "destructive",
            })
            return
        }

        if (!selectedOrgId) {
            toast({ title: "Organization required", description: "Please select an organization", variant: "destructive" })
            return
        }

        if (!selectedDomainId) {
            toast({ title: "Domain required", description: "Please select a verified domain", variant: "destructive" })
            return
        }

        const scopeList = (Object.keys(scopes) as ScopeFeature[]).map((feat) =>
            buildScope(feat, scopes[feat])
        )

        setSubmitting(true)
        try {
            const { data: res } = await API.createInvitation({
                email: inviteEmail.trim().toLowerCase(),
                name: inviteName.trim() || undefined,
                org_id: selectedOrgId,
                domain_id: selectedDomainId,
                role: selectedRole,
                scopes: scopeList,
            })

            if (res?.success) {
                toast({
                    title: "Invitation sent!",
                    description: `An invite email was sent to ${inviteEmail}. Mailbox will be created as ${generatedEmailPreview} once accepted.`,
                })
                router.push("/h-panel/org/members")
            } else {
                throw new Error(res?.message || "Failed to create invitation")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send invitation",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    // ── Handle Direct Internal Account Submission ──
    const handleCreateInternal = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!internalName.trim() || !internalUsername.trim() || !internalPassword) {
            toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" })
            return
        }

        const domain = domains.find((d) => d.id === internalDomainId)
        if (!domain) {
            toast({ title: "Domain required", description: "Please choose a domain", variant: "destructive" })
            return
        }

        const cleanUser = internalUsername.includes("@")
            ? internalUsername.split("@")[0]
            : internalUsername
        const fullEmail = `${cleanUser}@${domain.domain_name}`

        setSubmitting(true)
        try {
            // 1. Add direct mailbox
            const { data: userRes } = await API.handleAddUser({
                name: internalName,
                email: fullEmail,
                password: internalPassword,
                domain_name_id: domain.id,
            })

            if (!userRes?.success) throw new Error(userRes?.message || "Failed to create mailbox")

            // 2. Set org role
            await API.inviteMember({
                email: fullEmail,
                name: internalName,
                role: internalRole,
            }).catch(() => {})

            toast({
                title: "Mailbox created",
                description: `${fullEmail} has been added to your organization.`,
            })
            router.push("/h-panel/org/members")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Could not create mailbox",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center gap-3 border-b px-6 bg-card">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/org/members">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Members
                    </Link>
                </Button>
                <div className="h-4 w-px bg-border" />
                <h1 className="text-base font-semibold">Add Member to Organization</h1>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
                <div className="container max-w-4xl mx-auto space-y-6">
                    {/* Mode Selector Tabs */}
                    <div className="flex justify-center">
                        <Tabs
                            value={mode}
                            onValueChange={(v) => setMode(v as any)}
                            className="w-full max-w-lg"
                        >
                            <TabsList className="grid w-full grid-cols-2 p-1">
                                <TabsTrigger value="invite" className="gap-2">
                                    <Send className="w-4 h-4" />
                                    Invite External User
                                </TabsTrigger>
                                <TabsTrigger value="internal" className="gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Create Internal Mailbox
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* ══════════════ TAB 1: INVITE EXTERNAL USER ══════════════ */}
                    {mode === "invite" && (
                        <form onSubmit={handleSendInvitation} className="space-y-6">
                            <Card className="border shadow-none">
                                <CardContent className="p-6 space-y-6">
                                    <div className="border-b pb-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            Invite External Team Member
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Invite a collaborator from any email provider (e.g. Outlook,
                                            Gmail). Upon accepting, an organization mailbox is
                                            provisioned for them under your domain.
                                        </p>
                                    </div>

                                    {/* Recipient Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="inviteEmail">
                                                External Email Address <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="inviteEmail"
                                                type="email"
                                                placeholder="colleague@outlook.com"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                required
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                The email address where the invitation link will be sent.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="inviteName">Display Name</Label>
                                            <Input
                                                id="inviteName"
                                                placeholder="e.g. Alex Johnson"
                                                value={inviteName}
                                                onChange={(e) => setInviteName(e.target.value)}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Recipient name displayed in the invite email.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Org & Domain Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Organization <span className="text-destructive">*</span></Label>
                                            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Organization" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {organizations.map((org) => (
                                                        <SelectItem key={org.id} value={String(org.id)}>
                                                            {org.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Target Domain <span className="text-destructive">*</span></Label>
                                            <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Domain" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {domains.map((dom) => (
                                                        <SelectItem key={dom.id} value={dom.id}>
                                                            {dom.domain_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Assigned Role</Label>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.name}>
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Feature Scopes Matrix */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                    <Sliders className="w-4 h-4 text-primary" />
                                                    Feature Scopes & Permissions
                                                </Label>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Configure access levels for Mail, Calendar, Tasks, Workspace, Files, and Contacts.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {SCOPE_FEATURES.map((feature) => (
                                                <div
                                                    key={feature}
                                                    className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="text-xs font-semibold capitalize">
                                                            {feature}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {feature === "mail" && "Webmail & SMTP"}
                                                            {feature === "calendar" && "Events & RSVP"}
                                                            {feature === "tasks" && "Tasks & Boards"}
                                                            {feature === "workspace" && "Team Channel"}
                                                            {feature === "files" && "Documents"}
                                                            {feature === "contacts" && "Address Book"}
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={scopes[feature]}
                                                        onValueChange={(val) =>
                                                            handleScopeToggle(feature, val as ScopePermission)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[100px] h-7 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SCOPE_PERMISSIONS.map((p) => (
                                                                <SelectItem key={p.value} value={p.value} className="text-xs">
                                                                    {p.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Generated Mailbox Formula Preview Card ── */}
                                    <div className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            Generated Mailbox Format (On Acceptance)
                                        </div>
                                        <div className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded border border-blue-200 dark:border-blue-800 break-all">
                                            {generatedEmailPreview}
                                        </div>
                                        <p className="text-xs text-blue-800 dark:text-blue-400">
                                            Formula: <code className="font-mono">ext.&lt;org_slug&gt;.&lt;user_id&gt;.&lt;prefix&gt;@{previewDomain}</code>
                                            <br />
                                            The user will receive an email invitation at <strong>{inviteEmail || "their external email"}</strong>. When they accept, this mailbox is created and tied to their role and scopes.
                                        </p>
                                    </div>

                                    {/* Submit Action */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/h-panel/org/members")}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={submitting} className="gap-2">
                                            <Send className="w-4 h-4" />
                                            {submitting ? "Sending Invitation..." : "Send Invitation Email"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    )}

                    {/* ══════════════ TAB 2: CREATE INTERNAL DIRECT MAILBOX ══════════════ */}
                    {mode === "internal" && (
                        <form onSubmit={handleCreateInternal} className="space-y-6">
                            <Card className="border shadow-none">
                                <CardContent className="p-6 space-y-6">
                                    <div className="border-b pb-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <UserPlus className="w-5 h-5 text-primary" />
                                            Create Direct Internal Mailbox
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Directly provision a new native mailbox under your verified domain without sending an external invitation.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="internalName">Full Name</Label>
                                            <Input
                                                id="internalName"
                                                placeholder="Jane Doe"
                                                value={internalName}
                                                onChange={(e) => setInternalName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="internalRole">Organization Role</Label>
                                            <Select value={internalRole} onValueChange={setInternalRole}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.name}>
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="internalUsername">Username / Prefix</Label>
                                            <Input
                                                id="internalUsername"
                                                placeholder="jane.doe"
                                                value={internalUsername}
                                                onChange={(e) => setInternalUsername(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Domain</Label>
                                            <Select value={internalDomainId} onValueChange={setInternalDomainId}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {domains.map((dom) => (
                                                        <SelectItem key={dom.id} value={dom.id}>
                                                            @{dom.domain_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="internalPassword">Initial Password</Label>
                                        <Input
                                            id="internalPassword"
                                            type="password"
                                            placeholder="Minimum 8 characters"
                                            value={internalPassword}
                                            onChange={(e) => setInternalPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/h-panel/org/members")}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? "Creating..." : "Create Mailbox"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
