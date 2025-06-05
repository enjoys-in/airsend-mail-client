"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { toast } from '@/components/ui/use-toast';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import React, { useCallback, useState } from "react"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"
import { API } from "@/lib/api/handler"
import { Checkbox } from "@/components/ui/checkbox"
const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
});

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    enable_tracing: z.boolean().default(false).optional(),
    selected_emails: z.array(optionSchema, {
        required_error: "Please select at least one email.",
        invalid_type_error: "Please select at least one email.",
        message: "Please select at least one email.",
    }).min(1, {
        message: "Please select at least one email.",
    }).max(3),
    domain: z.string({
        required_error: "Please select a domain.",
    }),
})

export function APIKeyForm() {
    const [isLocked, setIsLocked] = useState(false)
    const [myDomains, setMyDomains] = useState<any[]>([])
    const [domainAccounts, setDomainAccounts] = useState<Option[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            enable_tracing: false
        },
    })


    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLocked(true)
            const { data } = await API.handleCreateAPIKey(values)
            if (!data.success) {
                throw new Error(data.message)
            }

            setIsLocked(false)
            toast({
                title: "API Key Created",
                description: "Your API key has been created successfully.",
            })
            window.location.reload()
        } catch (error) {
            setIsLocked(false)

        }
    }

    const filterAccounts = (value: string) => {
        const selectedDomain = myDomains.find((domain: any) => domain.id === value)
        setDomainAccounts(selectedDomain.accounts.map((domain: any) => ({ label: domain.email, value: domain.email })))
    }
    const fetchAllDomains = useCallback(async () => {
        try {
            const { data } = await API.handleGetAllDomains(`?select=status,domain_name,id`)
            if (!data.success) {
                throw new Error(data.message)
            }
            setMyDomains(data.result.map((domain: any) => domain.status === DOMAIN_STATUS.VERIFIED && ({ domain_name: domain.domain_name, id: domain.id, accounts: domain.accounts })))


            return data.result.map((domain: any) => domain.status === DOMAIN_STATUS.VERIFIED && ({ label: domain.domain_name, value: domain.id }))
        } catch (error) {
            return []
        }

    }, [])
    React.useEffect(() => {
        fetchAllDomains()
    }, [])
    const watchDomain = form.watch("domain")
    React.useEffect(() => {
        if (form.watch("domain")) {
            filterAccounts(form.getValues("domain"))
        }
    }, [watchDomain])
    return (
        <div className="w-full max-w-2xl mx-auto mt-2 rounded-none">

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>API Key Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="My API Key" className="rounded-none" {...field} />
                                </FormControl>
                                <FormDescription>
                                    A friendly name to identify this API key.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Domain</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}   >
                                    <FormControl>
                                        <SelectTrigger className="rounded-none">
                                            <SelectValue placeholder="Select a domain" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-none">
                                        {myDomains.map((domain: any) => (
                                            <SelectItem value={domain.id} key={domain.id}>{domain.domain_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Select the domain where this API key will be used.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {watchDomain && domainAccounts.length > 0 && (
                        <FormField
                            control={form.control}
                            name="selected_emails"
                            render={({ field }) => (
                                <FormItem>
                                    <MultipleSelector

                                        className="rounded-none"
                                        maxSelected={3}
                                        onMaxSelected={(maxLimit) => {
                                            toast({
                                                title: `You have reached max selected: ${maxLimit}`,
                                            });
                                        }}
                                        {...field}
                                        defaultOptions={domainAccounts}
                                        placeholder="Select emails"
                                        emptyIndicator={
                                            <p className="text-center  items-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                    <FormDescription>
                                        Select Email Accounts that you want to link with this API key
                                    </FormDescription>
                                    <FormMessage className="mt-2 text-red-500" />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="enable_tracing"
                        render={({ field }) => (
                            <FormItem>

                                <FormControl>
                                    <Checkbox
                                    disabled
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Enable Tracing to tracking mail sending via APIs
                                </FormDescription>
                                <FormMessage className="mt-2 text-red-500" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLocked} className="w-full rounded-none">Generate API Credentials</Button>
                </form>
            </Form>

        </div>
    )
}