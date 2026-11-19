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
            description: "Strong 16-character password generated. Make sure to copy it.",
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
                title: "Mailbox created successfully!",
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex items-center gap-2 border-b pb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground">
                            Internal Enterprise Mailbox
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Provision an account directly under your verified corporate domain.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="internal-name" className="text-xs font-semibold">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            <Input
                                id="internal-name"
                                placeholder="e.g. Sarah Connor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9 text-xs sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Email / Username */}
                    <div className="space-y-2">
                        <Label htmlFor="internal-username" className="text-xs font-semibold">
                            Mailbox Username & Domain <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <AtSign className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                                <Input
                                    id="internal-username"
                                    placeholder="sconnor"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-9 text-xs sm:text-sm font-mono"
                                    required
                                />
                            </div>

                            <Select value={domainId} onValueChange={setDomainId}>
                                <SelectTrigger className="w-[180px] text-xs h-9 font-mono">
                                    <SelectValue placeholder="Domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    {domains.map((dom) => (
                                        <SelectItem key={dom.id} value={String(dom.id)} className="text-xs font-mono">
                                            @{dom.domain_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                            Full address: <strong className="text-foreground">{fullEmailPreview}</strong>
                        </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="internal-password" className="text-xs font-semibold">
                                Mailbox Password <span className="text-destructive">*</span>
                            </Label>
                            <button
                                type="button"
                                onClick={handleGeneratePassword}
                                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                                <RefreshCw className="w-3 h-3" /> Auto-generate
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            <Input
                                id="internal-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9 pr-9 text-xs sm:text-sm font-mono"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Used for webmail, IMAP, and SMTP authentication.
                        </p>
                    </div>

                    {/* Role */}
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
                        <p className="text-[11px] text-muted-foreground">
                            Governs access rights in the H-Panel dashboard.
                        </p>
                    </div>

                    {/* Advanced: per-service roles */}
                    <Collapsible className="space-y-3 md:col-span-2">
                        <CollapsibleTrigger asChild>
                            <button
                                type="button"
                                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                                <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                                Advanced: per-service roles
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ServiceRolePicker
                                value={serviceChoices}
                                orgRole={role}
                                disabled={submitting}
                                onChange={(service: OrgService, choice: ServiceRoleChoice) =>
                                    setServiceChoices((prev) => ({ ...prev, [service]: choice }))
                                }
                            />
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>

            {/* Actions */}
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
                    disabled={submitting || !name || !username || !password}
                    className="min-w-[170px] gap-2 shadow-xs"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Mailbox...
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4" />
                            Create Mailbox
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
