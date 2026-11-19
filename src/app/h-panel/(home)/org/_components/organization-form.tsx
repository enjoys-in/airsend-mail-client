"use client"

import * as React from "react"
import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Globe, Upload, Link2, ImageIcon, Mail, Phone, Check, Info, Loader2 } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { API } from "@/lib/api/handler"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import type { IOrganization } from "../_lib/types"
import { EmptyState, Pill, Section } from "./kit"

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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <IdentitySection
                        form={form}
                        orgSlug={orgSlug}
                        logoMode={logoMode}
                        setLogoMode={setLogoMode}
                        logoPreview={logoPreview}
                        setLogoPreview={setLogoPreview}
                        fileInputRef={fileInputRef}
                        onFileChange={handleFileChange}
                    />

                    <DomainsSection
                        availableDomains={availableDomains}
                        selectedDomains={selectedDomains}
                        toggleDomain={toggleDomain}
                        orgSlug={orgSlug}
                        primaryDomain={primaryDomain}
                    />

                    <ContactSection form={form} />

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-5">
                        <Button type="button" variant="ghost" onClick={() => router.push("/h-panel/org")} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="min-w-[140px]">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : mode === "add" ? (
                                "Create organization"
                            ) : (
                                "Save changes"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    )
}

/* ─────────────────────────────── sections ─────────────────────────────── */

function IdentitySection({
    form,
    orgSlug,
    logoMode,
    setLogoMode,
    logoPreview,
    setLogoPreview,
    fileInputRef,
    onFileChange,
}: {
    form: UseFormReturn<FormData>
    orgSlug: string
    logoMode: "url" | "upload"
    setLogoMode: (mode: "url" | "upload") => void
    logoPreview: string | null
    setLogoPreview: (value: string | null) => void
    fileInputRef: React.RefObject<HTMLInputElement | null>
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <Section title="Identity" description="How the organization appears to members and in email.">
            <div className="space-y-5">
                {/* Logo */}
                <div className="space-y-2">
                    <FormLabel>Logo</FormLabel>
                    <div className="flex flex-col items-start gap-4 sm:flex-row">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/40">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-1" />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                            )}
                        </div>

                        <div className="w-full flex-1 space-y-2.5">
                            <div className="flex gap-1.5">
                                <Button
                                    type="button"
                                    variant={logoMode === "url" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setLogoMode("url")}
                                >
                                    <Link2 className="mr-1 h-3 w-3" /> Image URL
                                </Button>
                                <Button
                                    type="button"
                                    variant={logoMode === "upload" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setLogoMode("upload")}
                                >
                                    <Upload className="mr-1 h-3 w-3" /> Upload file
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
                                        onChange={onFileChange}
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        Select image
                                    </Button>
                                    {logoPreview && (
                                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                            <Check className="h-3.5 w-3.5" /> Uploaded
                                        </span>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Recommended 256×256px. PNG, SVG or WebP, up to 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Name & Title */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Name <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Acme Corporation" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Slug: <code className="font-mono text-foreground">{orgSlug}</code>
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
                                <FormLabel>Tagline</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Cloud & Operations" {...field} />
                                </FormControl>
                                <FormDescription>Shown on team invitations and headers.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* BIMI */}
                <FormField
                    control={form.control}
                    name="bimi_record"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-1.5">
                                <FormLabel>BIMI record</FormLabel>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 cursor-pointer text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-xs">
                                        Brand Indicators for Message Identification (BIMI) displays your verified brand logo in supported client inboxes (Gmail, Apple Mail, Yahoo).
                                    </TooltipContent>
                                </Tooltip>
                                <span className="text-xs text-muted-foreground">Optional</span>
                            </div>
                            <FormControl>
                                <Input placeholder="v=BIMI1; l=https://yourcompany.com/logo.svg" className="font-mono text-xs" {...field} />
                            </FormControl>
                            <FormDescription>An SVG logo pointer for outgoing mail headers.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Section>
    )
}

function DomainsSection({
    availableDomains,
    selectedDomains,
    toggleDomain,
    orgSlug,
    primaryDomain,
}: {
    availableDomains: any[]
    selectedDomains: string[]
    toggleDomain: (domainName: string) => void
    orgSlug: string
    primaryDomain: string
}) {
    return (
        <Section
            title="Domains"
            description="Members can get mailboxes under any selected domain."
            actions={<Pill>{selectedDomains.length} selected</Pill>}
        >
            <div className="space-y-4">
                {availableDomains.length === 0 ? (
                    <EmptyState
                        icon={Globe}
                        title="No domains yet"
                        description="You can add and verify domains at any time under Domains management."
                        className="py-8"
                        action={
                            <Button variant="outline" size="sm" asChild>
                                <a href="/h-panel/domains">Configure domains</a>
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {availableDomains.map((dom) => {
                            const isSelected = selectedDomains.includes(dom.domain_name)
                            const isVerified = dom.status === DOMAIN_STATUS.VERIFIED

                            return (
                                <div
                                    key={dom.id || dom.domain_name}
                                    onClick={() => toggleDomain(dom.domain_name)}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-3 transition-colors",
                                        isSelected ? "border-primary/60 bg-primary/5" : "border-border/70 hover:bg-muted/40"
                                    )}
                                >
                                    <div className="min-w-0 space-y-1">
                                        <div className="truncate text-sm font-medium">{dom.domain_name}</div>
                                        {isVerified ? <Pill tone="green">Verified</Pill> : <Pill tone="amber">Pending DNS</Pill>}
                                    </div>
                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleDomain(dom.domain_name)} onClick={(e) => e.stopPropagation()} />
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="rounded-lg bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
                    <p>External members (for example from Gmail or Outlook) get a connected mailbox in this format:</p>
                    <p className="mt-1.5 break-all font-mono text-foreground">
                        ext.{orgSlug}.[id].user@{primaryDomain}
                    </p>
                </div>
            </div>
        </Section>
    )
}

function ContactSection({ form }: { form: UseFormReturn<FormData> }) {
    return (
        <Section title="Contact" description="Where DMARC reports, abuse notices and legal mail go.">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="report_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Report email</FormLabel>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input type="email" placeholder="reports@yourcompany.com" className="pl-9" {...field} />
                                </div>
                                <FormDescription>Receives aggregate deliverability and bounce reports.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Support phone</FormLabel>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="+1 (555) 234-5678" className="pl-9" {...field} />
                                </div>
                                <FormDescription>Optional.</FormDescription>
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
                            <FormLabel>Legal address</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Street, city, country" className="min-h-[72px] resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Section>
    )
}
