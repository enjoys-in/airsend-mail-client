"use client"
import React, { useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { API } from '@/lib/api/handler'
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { validateMailboxSize } from '@/lib/utils'
import { Trash2Icon, Plus, Loader2 } from 'lucide-react'
import { FormActions, NextSteps, PageHeader, PageShell, Section, SplitForm } from "@/components/h-panel/kit"

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(6, "Username must be at least 6 characters")
        .max(32, "Username must be at most 32 characters")
        .regex(/^[a-zA-Z0-9.-]+$/, "Username can only contain letters, numbers, dots, and hyphens"),
    domain_name_id: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    mailbox_size: z.number().optional().default(0),
    limit_per_minute: z.number().int().positive("Limit per minute must be a positive integer").optional(),
    usage_alert: z.number().min(0).max(100, "Usage alert must be between 0 and 100").optional(),
    aliases: z.array(z.object({ alias: z.string().min(1, "Alias is required") })).optional(),
    catch_all: z.string().email("Invalid catch-all email address").or(z.literal("")).optional(),
    forward_to: z.string().email("Invalid forward-to email address").or(z.literal("")).optional(),
})

// zod 4: defaults make input and output differ, so the form is typed with both.
type UserFormInput = z.input<typeof userSchema>
type UserFormData = z.output<typeof userSchema>
const sizes = ["MB", "GB"]

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-xs text-red-600 dark:text-red-400">{message}</p> : null

const Page = () => {
    const { toast } = useToast()
    const router = useRouter()
    const [myDomains, setMyDomains] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedSize, setSelectedSize] = useState("MB")
    const form = useForm<UserFormInput, unknown, UserFormData>({
        resolver: zodResolver(userSchema),
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
        },
    })
    const { register, handleSubmit, formState: { errors }, control } = form
    const { fields, append, remove } = useFieldArray({ control, name: "aliases" })

    const onSubmit: SubmitHandler<UserFormData> = (input) => handleAddUser(input)

    const handleAddUser = async (input: UserFormData) => {
        try {
            if (!validateMailboxSize(input.mailbox_size, selectedSize)) {
                throw new Error(`❌ Mailbox size exceeds limit is 1GB.`)
            }
            setIsSubmitting(true)
            if (!input.domain_name_id) {
                throw new Error("Domain name is required")
            }
            const selectedDomain = myDomains.find((domain: any) => domain.id === input.domain_name_id)

            if (input.username.includes("@")) {
                input.username = input.username.split("@")[0]
            }

            const { data } = await API.handleAddUser({
                name: input.name,
                password: input.password,
                domain_name_id: selectedDomain.id,
                mailbox_size: input.mailbox_size,
                limit_per_minute: input.limit_per_minute,
                usage_alert: input.usage_alert,
                email: `${input.username}@${selectedDomain.domain_name}`,
            })
            if (!data.success) {
                throw new Error(data.message)
            }
            toast({
                title: data.message,
                variant: "default",
            })
            setIsSubmitting(false)
            router.back()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
            setIsSubmitting(false)
        }
    }

    const fetchAllDomains = useCallback(async () => {
        try {
            const { data } = await API.handleGetAllDomains()
            if (!data.success) {
                throw new Error(data.message)
            }
            setMyDomains(data.result.map((domain: any) => domain.status === DOMAIN_STATUS.VERIFIED && ({ domain_name: domain.domain_name, id: domain.id })))
        } catch (error) {
            // silently fail
        }
    }, [])

    React.useEffect(() => {
        fetchAllDomains()
    }, [])

    const aside = (
        <>
            <NextSteps
                steps={[
                    "The mailbox is created on the domain you pick, ready to sign in.",
                    "They use the username and password you set for webmail, IMAP and SMTP.",
                    "Quota, send limit and usage alerts apply from the first message.",
                ]}
            />
            <FormActions>
                <Button type="button" variant="outline" asChild>
                    <Link href="/h-panel/accounts">Cancel</Link>
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={myDomains.length === 0 || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating user
                        </>
                    ) : (
                        "Create user"
                    )}
                </Button>
            </FormActions>
        </>
    )

    return (
        <PageShell>
            <PageHeader
                back={{ href: "/h-panel/accounts", label: "Users" }}
                title="Add a user"
                description="Create a mailbox on one of your verified domains, with its limits and routing."
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <SplitForm aside={aside}>
                    <Section title="Basic information" description="Who the mailbox belongs to and its address.">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-sm">Login / display name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    className="h-9"
                                    {...register("name", { required: "Name is required" })}
                                    aria-invalid={errors.name ? "true" : "false"}
                                />
                                <FieldError message={errors.name?.message} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="username" className="text-sm">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Username"
                                        className="h-9"
                                        {...form.register("username")}
                                    />
                                    <FieldError message={errors.username?.message} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm">Domain</Label>
                                    <Select onValueChange={field => form.setValue("domain_name_id", field)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select your domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myDomains.filter(Boolean).map((domain: any) => (
                                                <SelectItem value={domain.id} key={domain.id}>{domain.domain_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.domain_name_id?.message} />
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Security and storage" description="Sign-in password and how much space the mailbox gets.">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    className="h-9"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Password must be at least 8 characters" }
                                    })}
                                    aria-invalid={errors.password ? "true" : "false"}
                                />
                                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                                <FieldError message={errors.password?.message} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="mailbox_size" className="text-sm">Mailbox size</Label>
                                <div className="flex flex-row gap-2">
                                    <Input
                                        id="mailbox_size"
                                        className="h-9 flex-1"
                                        type="number"
                                        placeholder="0"
                                        {...register("mailbox_size", { valueAsNumber: true })}
                                    />
                                    <Select onValueChange={field => setSelectedSize(field)}>
                                        <SelectTrigger className="h-9 w-24">
                                            <SelectValue placeholder="Unit" defaultValue={selectedSize} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sizes.map((size: any) => (
                                                <SelectItem value={size} key={size}>{size}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-xs text-muted-foreground">Leave blank or 0 for unlimited.</p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Limits and alerts" description="Throttle sending and get warned before the mailbox fills up.">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="limit_per_minute" className="text-sm">Limit per minute</Label>
                                <Input
                                    id="limit_per_minute"
                                    className="h-9"
                                    type="number"
                                    {...register("limit_per_minute", { valueAsNumber: true })}
                                />
                                <p className="text-xs text-muted-foreground">0 for unlimited, max 60 per minute.</p>
                                <FieldError message={errors.limit_per_minute?.message} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="usage_alert" className="text-sm">Usage alert (%)</Label>
                                <Input
                                    id="usage_alert"
                                    className="h-9"
                                    type="number"
                                    {...register("usage_alert", { valueAsNumber: true })}
                                />
                                <p className="text-xs text-muted-foreground">Between 0 and 100.</p>
                                <FieldError message={errors.usage_alert?.message} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Email routing" description="Optional: where mail for this mailbox should also go.">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="catch_all" className="text-sm">Catch-all email sent to</Label>
                                <Input
                                    id="catch_all"
                                    className="h-9"
                                    type="email"
                                    {...register("catch_all")}
                                />
                                <p className="text-xs text-muted-foreground">Leave blank for none.</p>
                                <FieldError message={errors.catch_all?.message} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="forward_to" className="text-sm">Forward to</Label>
                                <Input
                                    id="forward_to"
                                    className="h-9"
                                    type="email"
                                    {...register("forward_to")}
                                />
                                <p className="text-xs text-muted-foreground">Leave blank for none.</p>
                                <FieldError message={errors.forward_to?.message} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Email aliases" description="Extra addresses that deliver to this mailbox.">
                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-2">
                                    <div className="flex flex-1 flex-col gap-1">
                                        <Input
                                            type="text"
                                            placeholder="Alias"
                                            className="h-9"
                                            {...register(`aliases.${index}.alias`, { required: "Email Alias is required" })}
                                            aria-invalid={errors.aliases?.[index]?.alias ? "true" : "false"}
                                        />
                                        <FieldError message={errors.aliases?.[index]?.alias?.message} />
                                    </div>
                                    {index > 0 && (
                                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 text-red-600 hover:text-red-600 dark:text-red-400" onClick={() => remove(index)}>
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {index === fields.length - 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 shrink-0"
                                            onClick={() => {
                                                const lastAlias = form.getValues(`aliases.${index}.alias`);
                                                if (!lastAlias?.trim()) {
                                                    form.setError(`aliases.${index}.alias`, {
                                                        type: "manual",
                                                        message: "Email Alias cannot be empty before adding a new one",
                                                    });
                                                    return;
                                                }
                                                form.clearErrors(`aliases.${index}.alias`);
                                                append({ alias: "" });
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                </SplitForm>
            </form>
        </PageShell>
    )
}

export default Page
