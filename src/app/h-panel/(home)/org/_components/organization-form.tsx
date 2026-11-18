"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Building2,
    Globe,
    Upload,
    Link2,
    ImageIcon,
    Shield,
    Mail,
    Phone,
    MapPin,
    Check,
    CheckCircle2,
    Sparkles,
    Calendar,
    ListTodo,
    Boxes,
    Info,
    Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import type { IOrganization } from "../_lib/types"
import { MailboxFormulaPreview } from "./mailbox-formula-preview"

function slugify(name: string): string {
    return (name || "org")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32) || "org"
}

const formSchema = z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
    title: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    report_email: z.string().email("Invalid email address").or(z.literal("")).optional(),
    logo_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
    bimi_record: z.string().optional(),
    domains: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>

interface OrganizationFormProps {
    mode: "add" | "edit"
    initialData?: Partial<IOrganization> | null
}

export function OrganizationForm({ mode, initialData }: OrganizationFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const initialDomainNames = initialData?.domains?.map((d) => d.domain_name) || []
    const [selectedDomains, setSelectedDomains] = React.useState<string[]>(initialDomainNames)
    const [logoMode, setLogoMode] = React.useState<"url" | "upload">("url")
    const [logoPreview, setLogoPreview] = React.useState<string | null>(initialData?.logo_url || null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [availableDomains, setAvailableDomains] = React.useState<any[]>([])
    const [submitting, setSubmitting] = React.useState(false)

    // Load user's domains
    React.useEffect(() => {
        API.handleGetAllDomains()
            .then((res) => {
                const list = res.data?.result || res.data || []
                setAvailableDomains(list)
                // If creating and no domain selected yet, pre-select first verified domain if available
                if (mode === "add" && initialDomainNames.length === 0 && list.length > 0) {
                    const firstVerified = list.find((d: any) => d.status === DOMAIN_STATUS.VERIFIED) || list[0]
                    if (firstVerified) {
                        setSelectedDomains([firstVerified.domain_name])
                        form.setValue("domains", [firstVerified.domain_name])
                    }
                }
            })
            .catch(() => {})
    }, [mode])

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            title: initialData?.title || "",
            phone: initialData?.phone || "",
            address: initialData?.address || "",
            report_email: initialData?.report_email || "",
            logo_url: initialData?.logo_url || "",
            bimi_record: initialData?.bimi_record || "",
            domains: initialDomainNames,
        },
    })

    const watchedName = form.watch("name") || ""
    const watchedTitle = form.watch("title") || ""
    const watchedReportEmail = form.watch("report_email") || ""

    const orgSlug = slugify(watchedName)
    const primaryDomain = selectedDomains[0] || (availableDomains[0]?.domain_name ?? "yourdomain.com")

    const toggleDomain = (domainName: string) => {
        const updated = selectedDomains.includes(domainName)
            ? selectedDomains.filter((d) => d !== domainName)
            : [...selectedDomains, domainName]

        setSelectedDomains(updated)
        form.setValue("domains", updated)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Logo must be under 2MB in size.",
                variant: "destructive",
            })
            return
        }

        const reader = new FileReader()
        reader.onload = (uploadEvent) => {
            const dataUrl = uploadEvent.target?.result as string
            setLogoPreview(dataUrl)
            form.setValue("logo_url", dataUrl)
        }
        reader.readAsDataURL(file)
    }

    const onSubmit = async (values: FormData) => {
        setSubmitting(true)
        try {
            const payload = {
                ...values,
                domains: selectedDomains,
            }

            if (mode === "edit" && initialData?.id) {
                const { data } = await API.updateOrganization(initialData.id, payload)
                if (data?.success === false) throw new Error(data.message)
                toast({
                    title: "Organization updated",
                    description: `Organization ${values.name} was updated successfully.`,
                })
            } else {
                const { data } = await API.createOrganization(payload)
                if (data?.success === false) throw new Error(data.message)
                toast({
                    title: "Organization created",
                    description: `Organization ${values.name} has been created with ${selectedDomains.length} attached domain(s).`,
                })
            }
            router.push("/h-panel/org")
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Something went wrong while saving the organization.",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <TooltipProvider>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* ══════════════ LEFT COLUMN: FORM SECTIONS (8 cols) ══════════════ */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Card 1: Brand & General Identity */}
                            <Card className="shadow-none border">
                                <CardHeader className="pb-4 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                Brand & Organization Identity
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Basic organization profile and visual brand appearance.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-5">
                                    {/* Logo Section */}
                                    <div className="space-y-2">
                                        <FormLabel className="text-xs font-semibold">Organization Logo</FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                                            <div className="h-20 w-20 rounded-xl border border-dashed flex items-center justify-center bg-muted/40 shrink-0 overflow-hidden relative group">
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo Preview"
                                                        className="h-full w-full object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="text-center text-muted-foreground flex flex-col items-center">
                                                        <ImageIcon className="h-6 w-6 opacity-40 mb-1" />
                                                        <span className="text-[10px]">No Logo</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2.5 w-full">
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={logoMode === "url" ? "secondary" : "outline"}
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => setLogoMode("url")}
                                                    >
                                                        <Link2 className="h-3 w-3 mr-1" /> Image URL
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={logoMode === "upload" ? "secondary" : "outline"}
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => setLogoMode("upload")}
                                                    >
                                                        <Upload className="h-3 w-3 mr-1" /> Upload File
                                                    </Button>
                                                </div>

                                                {logoMode === "url" ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="logo_url"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="https://yourcompany.com/assets/logo.png"
                                                                        className="text-xs h-9"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(e)
                                                                            setLogoPreview(e.target.value || null)
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                            className="hidden"
                                                            onChange={handleFileChange}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            Select Image File
                                                        </Button>
                                                        {logoPreview && logoMode === "upload" && (
                                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                <Check className="h-3.5 w-3.5" /> Uploaded
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-[11px] text-muted-foreground">
                                                    Recommended size: 256×256px. Formats: PNG, SVG, or WebP.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name & Title */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold">
                                                        Organization Name <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Acme Corporation" {...field} />
                                                    </FormControl>
                                                    <FormDescription className="text-[11px]">
                                                        Derived slug: <code className="font-mono text-foreground font-semibold">{orgSlug}</code>
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold">
                                                        Display Title / Tagline
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Cloud & Operations" {...field} />
                                                    </FormControl>
                                                    <FormDescription className="text-[11px]">
                                                        Shown on team invitations and headers.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* BIMI Record */}
                                    <FormField
                                        control={form.control}
                                        name="bimi_record"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-1.5">
                                                    <FormLabel className="text-xs font-semibold">
                                                        BIMI Record (Email Branding)
                                                    </FormLabel>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs text-xs">
                                                            Brand Indicators for Message Identification (BIMI) displays your verified brand logo in supported client inboxes (Gmail, Apple Mail, Yahoo).
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        placeholder="v=BIMI1; l=https://yourcompany.com/logo.svg"
                                                        className="font-mono text-xs"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-[11px]">
                                                    Optional SVG logo pointer for outgoing mail headers.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Card 2: Associated Email Domains */}
                            <Card className="shadow-none border">
                                <CardHeader className="pb-4 border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">
                                                    Associated Domains
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Link verified domains to enable user mailboxes and team workspaces.
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className="text-xs">
                                            {selectedDomains.length} Selected
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-4">
                                    {availableDomains.length === 0 ? (
                                        <div className="p-6 border border-dashed rounded-lg text-center space-y-2">
                                            <Globe className="w-8 h-8 mx-auto text-muted-foreground/50" />
                                            <p className="text-sm font-medium">No verified domains found</p>
                                            <p className="text-xs text-muted-foreground">
                                                You can add and verify domain DNS records anytime in Domains management.
                                            </p>
                                            <Button variant="outline" size="sm" asChild className="mt-2">
                                                <a href="/h-panel/domains">Configure Domains</a>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {availableDomains.map((dom) => {
                                                const isSelected = selectedDomains.includes(dom.domain_name)
                                                const isVerified = dom.status === DOMAIN_STATUS.VERIFIED

                                                return (
                                                    <div
                                                        key={dom.id || dom.domain_name}
                                                        onClick={() => toggleDomain(dom.domain_name)}
                                                        className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                                                            isSelected
                                                                ? "bg-primary/5 border-primary shadow-xs"
                                                                : "bg-card hover:bg-muted/40 border-border"
                                                        }`}
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-semibold text-sm text-foreground">
                                                                    {dom.domain_name}
                                                                </span>
                                                                {isVerified ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                                    >
                                                                        Verified
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400"
                                                                    >
                                                                        Pending DNS
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Mailboxes & team workspace active
                                                            </p>
                                                        </div>

                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleDomain(dom.domain_name)}
                                                            className="mt-0.5"
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        Members invited to this organization can be provisioned mailboxes under any selected domain.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 3: Security & Contact Information */}
                            <Card className="shadow-none border">
                                <CardHeader className="pb-4 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                Security & Compliance Contact
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Administrative contacts for DMARC reports, abuse notices, and physical records.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="report_email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold">
                                                        Security / DMARC Report Email
                                                    </FormLabel>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            placeholder="reports@yourcompany.com"
                                                            className="pl-9"
                                                            {...field}
                                                        />
                                                    </div>
                                                    <FormDescription className="text-[11px]">
                                                        Destination for aggregate deliverability and bounce reports.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold">
                                                        Support Phone
                                                    </FormLabel>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="+1 (555) 234-5678"
                                                            className="pl-9"
                                                            {...field}
                                                        />
                                                    </div>
                                                    <FormDescription className="text-[11px]">
                                                        Optional contact telephone number.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold">
                                                    Physical / Legal Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Company Headquarters, Street Address, City, Country"
                                                        className="min-h-[70px] text-xs resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Bottom Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/h-panel/org")}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting} className="min-w-[160px] gap-2">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </>
                                    ) : mode === "add" ? (
                                        <>
                                            <Building2 className="w-4 h-4" /> Create Organization
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* ══════════════ RIGHT COLUMN: STICKY LIVE PREVIEW (4 cols) ══════════════ */}
                        <div className="lg:col-span-4 sticky top-20 space-y-4">
                            <Card className="shadow-none border overflow-hidden">
                                <div className="h-20 bg-linear-to-r from-blue-600 via-indigo-600 to-primary p-4 relative flex items-end">
                                    <div className="absolute -bottom-6 left-4 h-14 w-14 rounded-xl border-2 border-background bg-card shadow-md flex items-center justify-center overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-1" />
                                        ) : (
                                            <span className="text-xl font-bold text-primary">
                                                {watchedName ? watchedName.charAt(0).toUpperCase() : "O"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="pt-9 pb-5 px-5 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-base text-foreground">
                                                {watchedName || "Organization Name"}
                                            </h3>
                                            <Badge variant="secondary" className="font-mono text-[10px]">
                                                {orgSlug}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {watchedTitle || "Enterprise Workspace"}
                                        </p>
                                    </div>

                                    {/* Associated Domains Pills */}
                                    <div className="space-y-1.5 pt-2 border-t">
                                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Domains ({selectedDomains.length})
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedDomains.length > 0 ? (
                                                selectedDomains.map((d) => (
                                                    <span
                                                        key={d}
                                                        className="px-2 py-0.5 rounded text-[11px] bg-muted font-mono font-medium"
                                                    >
                                                        @{d}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    No domains linked yet
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* External User Email Formula Demonstration */}
                                    <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
                                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            External Member Mailbox Format
                                        </div>
                                        <div className="font-mono text-[11px] font-medium text-blue-800 dark:text-blue-300 bg-white/90 dark:bg-neutral-900 p-2 rounded border border-blue-200 dark:border-blue-800 break-all">
                                            ext.{orgSlug}.[id].user@{primaryDomain}
                                        </div>
                                        <p className="text-[11px] text-blue-700/90 dark:text-blue-400 leading-relaxed">
                                            External users (e.g. from Outlook/Gmail) invited to this org will automatically receive a connected mailbox using this pattern.
                                        </p>
                                    </div>

                                    {/* Capabilities Unlocked */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Included Capabilities
                                        </div>
                                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <Boxes className="w-3.5 h-3.5 text-primary" />
                                                <span>Multi-channel Workspace & Files</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                <span>Calendar sync & RSVP tracking</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <ListTodo className="w-3.5 h-3.5 text-primary" />
                                                <span>Task boards & role assignments</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Shield className="w-3.5 h-3.5 text-primary" />
                                                <span>DKIM/SPF authenticated delivery</span>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    )
}
