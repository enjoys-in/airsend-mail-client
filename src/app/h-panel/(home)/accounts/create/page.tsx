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
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { validateMailboxSize } from '@/lib/utils'
import { Trash2Icon, Plus, ArrowLeft } from 'lucide-react'

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

type UserFormData = z.infer<typeof userSchema>
const sizes = ["MB", "GB"]

const Page = () => {
    const { toast } = useToast()
    const router = useRouter()
    const [myDomains, setMyDomains] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedSize, setSelectedSize] = useState("MB")
    const form = useForm<UserFormData>({
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

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <Link href="/h-panel/accounts">
                        <Button variant="outline" className="rounded-none gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-300">Add New User</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
                <Card className="p-4 sm:p-6 rounded-none">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Section: Basic Info */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">Basic Information</legend>

                            <div className="space-y-1">
                                <Label htmlFor="name">Login/Display Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    className="rounded-none"
                                    {...register("name", { required: "Name is required" })}
                                    aria-invalid={errors.name ? "true" : "false"}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Username"
                                        {...form.register("username")}
                                        className="bg-transparent border-white/20 text-white rounded-none"
                                    />
                                    {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label>Domain</Label>
                                    <Select onValueChange={field => form.setValue("domain_name_id", field)}>
                                        <SelectTrigger className="bg-transparent border-white/20 text-white rounded-none">
                                            <SelectValue placeholder="Select Your Domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myDomains.map((domain: any) => (
                                                <SelectItem value={domain.id} key={domain.id}>{domain.domain_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.domain_name_id && <p className="text-sm text-red-500">{errors.domain_name_id.message}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* Section: Security & Storage */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">Security & Storage</legend>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Password"
                                        className="rounded-none"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 8, message: "Password must be at least 8 characters" }
                                        })}
                                        aria-invalid={errors.password ? "true" : "false"}
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="mailbox_size">Mailbox Size</Label>
                                    <div className="flex flex-row gap-2">
                                        <Input
                                            id="mailbox_size"
                                            className="rounded-none flex-1"
                                            type="number"
                                            placeholder="0"
                                            {...register("mailbox_size", { valueAsNumber: true })}
                                        />
                                        <Select onValueChange={field => setSelectedSize(field)}>
                                            <SelectTrigger className="bg-transparent border-white/20 text-white rounded-none w-24">
                                                <SelectValue placeholder="Unit" defaultValue={selectedSize} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sizes.map((size: any) => (
                                                    <SelectItem value={size} key={size}>{size}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <small className="text-xs text-purple-400">(leave blank/0 for unlimited)</small>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section: Limits & Alerts */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">Limits & Alerts</legend>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="limit_per_minute">Limit Per Minute</Label>
                                    <Input
                                        id="limit_per_minute"
                                        className="rounded-none"
                                        type="number"
                                        {...register("limit_per_minute", { valueAsNumber: true })}
                                    />
                                    <small className="text-xs text-purple-400">(0 for unlimited, Max 60/min)</small>
                                    {errors.limit_per_minute && <p className="text-red-500 text-sm">{errors.limit_per_minute.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="usage_alert">Usage Alert (%)</Label>
                                    <Input
                                        id="usage_alert"
                                        className="rounded-none"
                                        type="number"
                                        {...register("usage_alert", { valueAsNumber: true })}
                                    />
                                    <small className="text-xs text-purple-400">(0 min, 100 max)</small>
                                    {errors.usage_alert && <p className="text-red-500 text-sm">{errors.usage_alert.message}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* Section: Routing */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">Email Routing</legend>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="catch_all">Catch-all Email Sent to</Label>
                                    <Input
                                        id="catch_all"
                                        className="rounded-none"
                                        type="email"
                                        {...register("catch_all")}
                                    />
                                    <div className="flex flex-row gap-2 items-center">
                                        <small className="text-xs text-indigo-400">(leave blank for none)</small>
                                        {errors.catch_all && <p className="text-red-500 text-sm">{errors.catch_all.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="forward_to">Forward To</Label>
                                    <Input
                                        id="forward_to"
                                        className="rounded-none"
                                        type="email"
                                        {...register("forward_to")}
                                    />
                                    <div className="flex flex-row gap-2 items-center">
                                        <small className="text-xs text-indigo-400">(leave blank for none)</small>
                                        {errors.forward_to && <p className="text-red-500 text-sm">{errors.forward_to.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section: Aliases */}
                        <fieldset className="space-y-4">
                            <legend className="text-sm font-medium text-gray-400 uppercase tracking-wide">Email Aliases</legend>

                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <div className="flex flex-col flex-1">
                                        <Input
                                            type="text"
                                            placeholder="Alias"
                                            className="rounded-none"
                                            {...register(`aliases.${index}.alias`, { required: "Email Alias is required" })}
                                            aria-invalid={errors.aliases?.[index]?.alias ? "true" : "false"}
                                        />
                                        {errors.aliases?.[index]?.alias && (
                                            <p className="text-sm text-red-500 mt-1">{errors.aliases?.[index]?.alias?.message}</p>
                                        )}
                                    </div>
                                    {index > 0 && (
                                        <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => remove(index)}>
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {index === fields.length - 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
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
                        </fieldset>

                        <Button type="submit" className="w-full rounded-none" disabled={myDomains.length === 0 || isSubmitting}>
                            {isSubmitting ? 'Creating User...' : 'Create User'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default Page