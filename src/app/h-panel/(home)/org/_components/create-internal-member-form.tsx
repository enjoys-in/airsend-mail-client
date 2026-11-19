"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    UserPlus,
    Lock,
    Eye,
    EyeOff,
    RefreshCw,
    User,
    AtSign,
    Loader2,
    ShieldCheck,
    ChevronDown,
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
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { IRole, OrgService } from "../_lib/types"
import { Section } from "./kit"
import {
    INHERIT_ALL,
    ServiceRolePicker,
    choicesToChanges,
    type ServiceRoleChoice,
    type ServiceRoleChoices,
} from "./service-role-picker"

export interface CreateInternalMemberFormProps {
    domains: any[]
    roles: IRole[]
    initialDomainId?: string
    onSuccess?: () => void
    onCancel?: () => void
}

function generateSecurePassword(): string {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 16; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pass
}

export function CreateInternalMemberForm({
    domains,
    roles,
    initialDomainId,
    onSuccess,
    onCancel,
}: CreateInternalMemberFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const [name, setName] = React.useState("")
    const [username, setUsername] = React.useState("")
    const [domainId, setDomainId] = React.useState(
        initialDomainId || (domains[0] ? String(domains[0].id) : "")
    )
    const [password, setPassword] = React.useState("")
    const [role, setRole] = React.useState("member")
    const [serviceChoices, setServiceChoices] = React.useState<ServiceRoleChoices>(INHERIT_ALL)
    const [showPassword, setShowPassword] = React.useState(false)
    const [submitting, setSubmitting] = React.useState(false)

    React.useEffect(() => {
        if (!domainId && domains.length > 0) {
            setDomainId(String(domains[0].id))
        }
    }, [domains, domainId])

    const selectedDomain = React.useMemo(
        () => domains.find((d) => String(d.id) === String(domainId)),
        [domains, domainId]
    )

    const cleanUser = username.trim().toLowerCase().replace(/@.*/, "").replace(/[^a-z0-9._-]/g, "")
    const fullEmailPreview = `${cleanUser || "user"}@${selectedDomain?.domain_name || "yourdomain.com"}`

    const handleGeneratePassword = () => {
        const generated = generateSecurePassword()
        setPassword(generated)
        setShowPassword(true)
        toast({
            title: "Password generated",
            description: "A strong 16-character password was generated. Copy it before you leave this page.",
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast({ title: "Name required", description: "Please enter a full name", variant: "destructive" })
            return
        }

        if (!cleanUser) {
            toast({ title: "Username required", description: "Please enter a username", variant: "destructive" })
            return
        }

        if (!password) {
            toast({ title: "Password required", description: "Please provide a mailbox password", variant: "destructive" })
            return
        }

        if (!domainId || !selectedDomain) {
            toast({ title: "Domain required", description: "Please select an active domain", variant: "destructive" })
            return
        }

        const fullEmail = `${cleanUser}@${selectedDomain.domain_name}`

        setSubmitting(true)
        try {
            // 1. Create native mail account
            const { data: userRes } = await API.handleAddUser({
                name: name.trim(),
                email: fullEmail,
                password,
                domain_name_id: selectedDomain.id,
            })

            if (!userRes?.success) {
                throw new Error(userRes?.message || "Failed to create mailbox")
            }

            // 2. Assign organization role
            await API.inviteMember({
                email: fullEmail,
                name: name.trim(),
                role,
                // Only overrides are sent; "same as org role" services follow the role above.
                ...(Object.values(serviceChoices).some((c) => c !== "inherit")
                    ? { service_roles: choicesToChanges(serviceChoices) }
                    : {}),
            }).catch(() => {})

            toast({
                title: "Mailbox created",
                description: `${fullEmail} has been provisioned and is ready for login.`,
            })

            if (onSuccess) {
                onSuccess()
            } else {
                router.push("/h-panel/org/members")
            }
        } catch (error: any) {
            toast({
                title: "Failed to create mailbox",
                description: error.message || "An error occurred while creating the account.",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Section title="Account" description="The person and the address of their new mailbox.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="internal-name" className="text-sm">
                            Full name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="internal-name"
                                placeholder="e.g. Sarah Connor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 pl-9 text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Email / Username */}
                    <div className="space-y-1.5">
                        <Label htmlFor="internal-username" className="text-sm">
                            Username and domain <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="internal-username"
                                    placeholder="sconnor"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-9 pl-9 font-mono text-sm"
                                    required
                                />
                            </div>

                            <Select value={domainId} onValueChange={setDomainId}>
                                <SelectTrigger className="h-9 w-[170px] font-mono text-xs">
                                    <SelectValue placeholder="Domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {domains.map((dom) => (
                                        <SelectItem key={dom.id} value={String(dom.id)} className="font-mono text-xs">
                                            @{dom.domain_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Address: <span className="font-mono text-foreground">{fullEmailPreview}</span>
                        </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5 md:col-span-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="internal-password" className="text-sm">
                                Mailbox password <span className="text-destructive">*</span>
                            </Label>
                            <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <RefreshCw className="h-3 w-3" /> Generate
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="internal-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-9 pl-9 pr-9 font-mono text-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Used for webmail, IMAP and SMTP sign-in.</p>
                    </div>
                </div>
            </Section>

            <Section title="Access" description="What this person can do in the organization.">
                <div className="max-w-sm space-y-1.5">
                    <Label className="text-sm">Organization role</Label>
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
                    <p className="text-xs text-muted-foreground">Governs access rights in the h-panel and is the default in every service.</p>
                </div>
            </Section>

            <Section>
                <Collapsible className="space-y-3">
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="group flex w-full items-center justify-between gap-2 text-left"
                        >
                            <span>
                                <span className="block text-sm font-medium">Advanced: per-service roles</span>
                                <span className="block text-xs text-muted-foreground">
                                    Optional. Give a different role in Files, Tasks or Workspace.
                                </span>
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="border-t border-border/70 pt-4">
                            <ServiceRolePicker
                                value={serviceChoices}
                                orgRole={role}
                                disabled={submitting}
                                onChange={(service: OrgService, choice: ServiceRoleChoice) =>
                                    setServiceChoices((prev) => ({ ...prev, [service]: choice }))
                                }
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Section>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel || (() => router.push("/h-panel/org/members"))}
                    disabled={submitting}
                >
                    Cancel
                </Button>

                <Button type="submit" disabled={submitting || !name || !username || !password} className="min-w-[150px] gap-2">
                    {submitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4" />
                            Create mailbox
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
