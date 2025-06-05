"use client"
import React, { useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
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
import { Plus, Trash2Icon } from 'lucide-react'


const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(6, "Username must be at least 6 characters")
        .max(32, "Username must be at most 32 characters")
        .regex(/^[a-zA-Z0-9.-]+$/, "Username can only contain letters, numbers, dots, and hyphens"),
    domain_name_id: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    mailbox_size: z.number().optional(),
    // limit_per_minute: z.number().int().positive("Limit per minute must be a positive integer").optional(),
    // usage_alert: z.number().min(0).max(100, "Usage alert must be between 0 and 100").optional(),
    // aliases: z.array(z.object({ alias: z.string().email("Invalid email address") })).optional(),
    // catch_all: z.string().email("Invalid catch-all email address").optional(),
    // forward_to: z.string().email("Invalid forward-to email address").optional(),
})
type UserFormData = z.infer<typeof userSchema>
const sizes = ["KB", "MB", "GB"]
const page = () => {
    const { toast } = useToast()
    const router = useRouter()
    const [myDomains, setMyDomains] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            username: "",
            password: "",
            domain_name_id: "",
            mailbox_size: 0,
            // limit_per_minute: 0,
            // usage_alert: 0,
            // aliases: [{ alias: "" }],
            // catch_all: "",
            // forward_to: "",
        },
    })
    const { register, handleSubmit, formState: { errors }, control, } = form

    // const { fields, append, remove } = useFieldArray({ control, name: "aliases" })

    const onSubmit: SubmitHandler<UserFormData> = (input) => handleAddUser(input)
    const handleAddUser = async (input: UserFormData) => {
        try {
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
                // limit_per_minute: input.limit_per_minute,
                // usage_alert: input.usage_alert,
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

        }

    }, [])
    React.useEffect(() => {
        fetchAllDomains()
    }, [])
    return (
        <div className="bg-background">
            <div className="container mx-auto p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <Link href="/h-panel/domains" className="btn btn-primary"><Button className="rounded-none">Go Back</Button></Link>
                    <h1 className="text-2xl font-semibold text-gray-300">Add New User</h1>
                </div>
                <Card className='container mx-auto p-4 rounded-none mt-4'>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
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
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Username"
                                {...form.register("username")}
                                className="bg-transparent border-white/20 text-white rounded-none"
                            />

                            <Select onValueChange={field => form.setValue("domain_name_id", field)}>
                                <SelectTrigger className="bg-transparent border-white/20 text-white rounded-none">
                                    <SelectValue placeholder="Select Your Domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectContent>
                                        {myDomains.map((domain: any) => (
                                            <SelectItem value={domain.id} key={domain.id}>{domain.domain_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        {errors.domain_name_id && <p className="text-sm text-red-500">{errors.domain_name_id.message}</p>}
                        <div className="flex flex-col sm:flex-row gap-4 ">
                            <div className='w-2/3'>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder='Password'
                                    className="rounded-none"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 8, message: "Password must be at least 8 characters" }
                                    })}
                                    aria-invalid={errors.password ? "true" : "false"}
                                />
                                {errors.password && <p className="text-sm  text-red-500">{errors.password.message}</p>}
                            </div>
                            <div className='w-1/3 flex flex-row'>
                                <Input id="mailbox_size" className="rounded-none" type="number" placeholder='(leave blank/0 for unlimited)' {...register("mailbox_size", { valueAsNumber: true })} />

                                <Select onValueChange={field => form.setValue("domain_name_id", field)}>
                                    <SelectTrigger className="bg-transparent border-white/20 text-white rounded-none w-18">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectContent>
                                            {sizes.map((size: any) => (
                                                <SelectItem value={size} key={size}>{size}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* <div className="flex flex-col sm:flex-row gap-4">

                            <div className="w-full">
                                <Label htmlFor="limit_per_minute">Limit Per Minute</Label>
                                <Input id="limit_per_minute" className="rounded-none" type="number" {...register("limit_per_minute", { valueAsNumber: true })} />
                                <small className='text-xs text-purple-400'>(0 for unlimited, Max 60/min)</small>
                                {errors.limit_per_minute && <p className="text-red-500 text-sm">{errors.limit_per_minute.message}</p>}
                            </div>

                            <div className="w-full">
                                <Label htmlFor="usage_alert">Usage Alert (%)</Label>
                                <Input id="usage_alert" className="rounded-none" type="number" {...register("usage_alert", { valueAsNumber: true })} />
                                <small className='text-xs text-purple-400'>(0 min, 100 max)</small>
                                {errors.usage_alert && <p className="text-red-500 text-sm">{errors.usage_alert.message}</p>}
                            </div>
                            <div className="w-full">
                                <Label htmlFor="catch_all">Catch-all Email Sent to</Label>
                                <Input id="catch_all" className="rounded-none" type="email" {...register("catch_all")} />
                                <div className='flex flex-row'>
                                    <small className='text-xs text-indigo-400'>(leave blank for none)</small>
                                    {errors.catch_all && <p className="text-red-500 text-sm">{errors.catch_all.message}</p>}
                                </div>
                            </div>

                            <div className="w-full">
                                <Label htmlFor="forward_to">Forward To</Label>
                                <Input id="forward_to" className="rounded-none" type="email" {...register("forward_to")} />
                                <div className='flex flex-row'>
                                    <small className='text-xs text-indigo-400'>(leave blank for none)</small>
                                    {errors.forward_to && <p className="text-red-500 text-sm">{errors.forward_to.message}</p>}
                                </div>
                            </div>
                        </div>
                        <div className='items-center'>
                            <Label htmlFor="aliases">Email Aliases</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center space-x-2 mt-2">
                                    <div className='flex flex-col w-full'>
                                        <Input
                                            type="text"
                                            className="rounded-none w-[80%]"
                                            {...register(`aliases.${index}.alias`, { required: "Email Alias is required" })}
                                            aria-invalid={errors.aliases?.[index]?.alias ? "true" : "false"}
                                        />
                                        {errors.aliases?.[index]?.alias && (
                                            <p className="text-sm text-red-500">{errors.aliases?.[index]?.alias.message}</p>
                                        )}
                                    </div>
                                    {index > 0 && (
                                        <Button type="button" variant="destructive" onClick={() => remove(index)}>
                                            <Trash2Icon />
                                        </Button>
                                    )}
                                    {index === fields.length - 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const lastAlias = form.getValues(`aliases.${index}.alias`);
                                                if (!lastAlias.trim()) {
                                                    form.setError(`aliases.${index}.alias`, {
                                                        type: "manual",
                                                        message: "Email Alias cannot be empty before adding a new one",
                                                    });
                                                    return;
                                                }
                                                form.clearErrors(`aliases.${index}.alias`);
                                                append({ alias: "" });
                                            }}
                                            className="h-[38px]"
                                        >
                                            <Plus />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div> */}

                        <Button type="submit" className="w-full rounded-none" disabled={myDomains.length === 0 || isSubmitting} >
                            {isSubmitting ? 'Creating User' : 'Create User'}
                        </Button>
                    </form>
                </Card>
            </div>

        </div>

    )
}

export default page