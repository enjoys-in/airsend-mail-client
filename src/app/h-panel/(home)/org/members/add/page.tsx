"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Plus,
    Trash2,
    Bell,
    Mail,
    Shield,
    Eye,
    Server,
    RefreshCw,
    User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
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
import { validateMailboxSize } from "@/lib/utils"

import { NotificationsSection } from "../../_components/settings/notifications-section"
import { SecuritySection } from "../../_components/settings/security-section"
import { EmailSection } from "../../_components/settings/email-section"
import { ServerSection } from "../../_components/settings/server-section"
import { PrivacySection } from "../../_components/settings/privacy-section"
import { AdvancedSection } from "../../_components/settings/advanced-section"
import { DEFAULT_SETTINGS } from "../../_components/settings/settings-form"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const memberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
        .string()
        .min(6, "Username must be at least 6 characters")
        .max(32, "Username must be at most 32 characters")
        .regex(
            /^[a-zA-Z0-9.-]+$/,
            "Username can only contain letters, numbers, dots, and hyphens",
        ),
    domain_name_id: z.string().min(1, "Domain is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    mailbox_size: z.number().optional().default(0),
    limit_per_minute: z
        .number()
        .int()
        .positive("Limit per minute must be a positive integer")
        .optional(),
    usage_alert: z
        .number()
        .min(0)
        .max(100, "Usage alert must be between 0 and 100")
        .optional(),
    aliases: z
        .array(z.object({ alias: z.string().min(1, "Alias is required") }))
        .optional(),
    catch_all: z
        .string()
        .email("Invalid catch-all email address")
        .or(z.literal(""))
        .optional(),
    forward_to: z
        .string()
        .email("Invalid forward-to email address")
        .or(z.literal(""))
        .optional(),
    role: z.string().optional().default("member"),
})

type MemberFormData = z.infer<typeof memberSchema>

const sizes = ["MB", "GB"]
const roles = [
    { value: "admin", label: "Administrator" },
    { value: "member", label: "Member" },
    { value: "viewer", label: "Viewer" },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AddMemberPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [myDomains, setMyDomains] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedSize, setSelectedSize] = useState("MB")

    // ── Account creation form ──
    const memberForm = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: "",
            username: "",
            password: "",
            domain_name_id: "",
            mailbox_size: 0,
            limit_per_minute: 0,
            usage_alert: 0,
            aliases: [{ alias: "" }],
            catch_all: "",
            forward_to: "",
            role: "member",
        },
    })
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = memberForm
    const { fields, append, remove } = useFieldArray({
        control,
        name: "aliases",
    })

    // ── Settings form (same shape as accounts settings) ──
    const settingsForm = useForm<AccountSettings>({
        defaultValues: { ...DEFAULT_SETTINGS },
    })

    // ── Fetch domains ──
    const fetchAllDomains = useCallback(async () => {
        try {
            const { data } = await API.handleGetAllDomains()
            if (!data.success) throw new Error(data.message)
            setMyDomains(
                data.result
                    .filter((d: any) => d.status === DOMAIN_STATUS.VERIFIED)
                    .map((d: any) => ({ domain_name: d.domain_name, id: d.id })),
            )
        } catch {
            // silently fail
        }
    }, [])

    React.useEffect(() => {
        fetchAllDomains()
    }, [fetchAllDomains])

    // ── Submit ──
    const onSubmit = async (input: MemberFormData) => {
        try {
            if (!validateMailboxSize(input.mailbox_size ?? 0, selectedSize)) {
                throw new Error("Mailbox size exceeds limit of 1 GB.")
            }
            setIsSubmitting(true)

            const selectedDomain = myDomains.find(
                (d: any) => d.id === input.domain_name_id,
            )
            if (!selectedDomain) throw new Error("Domain not found")

            const username = input.username.includes("@")
                ? input.username.split("@")[0]
                : input.username

            // 1. Create the account
            const { data } = await API.handleAddUser({
                name: input.name,
                password: input.password,
                domain_name_id: selectedDomain.id,
                mailbox_size: input.mailbox_size,
                limit_per_minute: input.limit_per_minute,
                usage_alert: input.usage_alert,
                email: `${username}@${selectedDomain.domain_name}`,
            })
            if (!data.success) throw new Error(data.message)

            // 2. Apply settings to the newly created account
            const email = `${username}@${selectedDomain.domain_name}`
            const settings = settingsForm.getValues()
            await API.handleUpdateAccountSettings(email, settings).catch(() => {})

            // 3. Register as org member
            await API.inviteMember({
                name: input.name,
                email,
                role: input.role,
            }).catch(() => {})

            toast({ title: "Member added successfully", variant: "default" })
            router.push("/h-panel/org/members")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/org/members">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Add Member</h1>
            </header>

            {/* ── Content ── */}
            <div className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
                    {/* ── Account Creation Form ── */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <Card className="p-4 sm:p-6 rounded-none">
                            {/* Basic Information */}
                            <fieldset className="space-y-4">
                                <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                    Basic Information
                                </legend>

                                <div className="space-y-1">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        className="rounded-none"
                                        {...register("name")}
                                        aria-invalid={errors.name ? "true" : "false"}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            placeholder="Username"
                                            className="rounded-none"
                                            {...register("username")}
                                        />
                                        {errors.username && (
                                            <p className="text-sm text-red-500">
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label>Domain</Label>
                                        <Select
                                            onValueChange={(v) =>
                                                memberForm.setValue("domain_name_id", v)
                                            }
                                        >
                                            <SelectTrigger className="rounded-none">
                                                <SelectValue placeholder="Select domain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {myDomains.map((d: any) => (
                                                    <SelectItem value={d.id} key={d.id}>
                                                        {d.domain_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.domain_name_id && (
                                            <p className="text-sm text-red-500">
                                                {errors.domain_name_id.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Role</Label>
                                        <Select
                                            defaultValue="member"
                                            onValueChange={(v) =>
                                                memberForm.setValue("role", v)
                                            }
                                        >
                                            <SelectTrigger className="rounded-none">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r) => (
                                                    <SelectItem value={r.value} key={r.value}>
                                                        {r.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Security & Storage */}
                            <fieldset className="space-y-4 mt-6">
                                <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                    Security & Storage
                                </legend>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            className="rounded-none"
                                            {...register("password")}
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-500">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="mailbox_size">Mailbox Size</Label>
                                        <div className="flex flex-row gap-2">
                                            <Input
                                                id="mailbox_size"
                                                className="rounded-none flex-1"
                                                type="number"
                                                placeholder="0"
                                                {...register("mailbox_size", {
                                                    valueAsNumber: true,
                                                })}
                                            />
                                            <Select onValueChange={setSelectedSize}>
                                                <SelectTrigger className="rounded-none w-24">
                                                    <SelectValue
                                                        placeholder="Unit"
                                                        defaultValue={selectedSize}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sizes.map((s) => (
                                                        <SelectItem value={s} key={s}>
                                                            {s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <small className="text-xs text-purple-400">
                                            (leave blank/0 for unlimited)
                                        </small>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Limits & Alerts */}
                            <fieldset className="space-y-4 mt-6">
                                <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                    Limits & Alerts
                                </legend>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="limit_per_minute">
                                            Limit Per Minute
                                        </Label>
                                        <Input
                                            id="limit_per_minute"
                                            className="rounded-none"
                                            type="number"
                                            {...register("limit_per_minute", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <small className="text-xs text-purple-400">
                                            (0 for unlimited, Max 60/min)
                                        </small>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="usage_alert">Usage Alert (%)</Label>
                                        <Input
                                            id="usage_alert"
                                            className="rounded-none"
                                            type="number"
                                            {...register("usage_alert", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <small className="text-xs text-purple-400">
                                            (0 min, 100 max)
                                        </small>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Email Routing */}
                            <fieldset className="space-y-4 mt-6">
                                <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                    Email Routing
                                </legend>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="catch_all">
                                            Catch-all Email Sent to
                                        </Label>
                                        <Input
                                            id="catch_all"
                                            className="rounded-none"
                                            type="email"
                                            {...register("catch_all")}
                                        />
                                        <small className="text-xs text-indigo-400">
                                            (leave blank for none)
                                        </small>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="forward_to">Forward To</Label>
                                        <Input
                                            id="forward_to"
                                            className="rounded-none"
                                            type="email"
                                            {...register("forward_to")}
                                        />
                                        <small className="text-xs text-indigo-400">
                                            (leave blank for none)
                                        </small>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Aliases */}
                            <fieldset className="space-y-4 mt-6">
                                <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                    Email Aliases
                                </legend>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <div className="flex flex-col flex-1">
                                            <Input
                                                type="text"
                                                placeholder="Alias"
                                                className="rounded-none"
                                                {...register(`aliases.${index}.alias`)}
                                            />
                                            {errors.aliases?.[index]?.alias && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {errors.aliases[index].alias?.message}
                                                </p>
                                            )}
                                        </div>
                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {index === fields.length - 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => {
                                                    const lastAlias = memberForm.getValues(
                                                        `aliases.${index}.alias`,
                                                    )
                                                    if (!lastAlias?.trim()) {
                                                        memberForm.setError(
                                                            `aliases.${index}.alias`,
                                                            {
                                                                type: "manual",
                                                                message:
                                                                    "Alias cannot be empty before adding a new one",
                                                            },
                                                        )
                                                        return
                                                    }
                                                    memberForm.clearErrors(
                                                        `aliases.${index}.alias`,
                                                    )
                                                    append({ alias: "" })
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </fieldset>
                        </Card>

                        {/* ── Account Settings Tabs ── */}
                        <Card className="p-4 sm:p-6 rounded-none">
                            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                                Account Settings
                            </h2>

                            <FormProvider {...settingsForm}>
                                <Tabs defaultValue="notifications" className="w-full">
                                    <TabsList className="flex w-full overflow-x-auto h-auto">
                                        <TabsTrigger
                                            value="notifications"
                                            className="text-xs gap-1 flex-1 min-w-0"
                                        >
                                            <Bell className="h-3.5 w-3.5 shrink-0" />
                                            <span className="hidden sm:inline">
                                                Notifications
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="security"
                                            className="text-xs gap-1 flex-1 min-w-0"
                                        >
                                            <Shield className="h-3.5 w-3.5 shrink-0" />
                                            <span className="hidden sm:inline">Security</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="email"
                                            className="text-xs gap-1 flex-1 min-w-0"
                                        >
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                            <span className="hidden sm:inline">Email</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="server"
                                            className="text-xs gap-1 flex-1 min-w-0"
                                        >
                                            <Server className="h-3.5 w-3.5 shrink-0" />
                                            <span className="hidden sm:inline">Server</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="privacy"
                                            className="text-xs gap-1 flex-1 min-w-0"
                                        >
                                            <Eye className="h-3.5 w-3.5 shrink-0" />
                                            <span className="hidden sm:inline">Privacy</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="advanced"
                                            className="text-xs gap-1 flex-1 min-w-0"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                                            <span className="hidden sm:inline">Advanced</span>
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="notifications" className="mt-4">
                                        <NotificationsSection />
                                    </TabsContent>
                                    <TabsContent value="security" className="mt-4">
                                        <SecuritySection />
                                    </TabsContent>
                                    <TabsContent value="email" className="mt-4">
                                        <EmailSection />
                                    </TabsContent>
                                    <TabsContent value="server" className="mt-4">
                                        <ServerSection />
                                    </TabsContent>
                                    <TabsContent value="privacy" className="mt-4">
                                        <PrivacySection />
                                    </TabsContent>
                                    <TabsContent value="advanced" className="mt-4">
                                        <AdvancedSection />
                                    </TabsContent>
                                </Tabs>
                            </FormProvider>
                        </Card>

                        <Button
                            type="submit"
                            className="w-full rounded-none"
                            disabled={myDomains.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? "Adding Member..." : "Add Member"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
