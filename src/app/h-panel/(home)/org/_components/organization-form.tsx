"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IOrganization } from "../_lib/types"
import { MOCK_DOMAINS } from "../_lib/mock-data"

const formSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  title: z.string().min(1, "Title is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  report_email: z.string().email("Invalid email address").or(z.literal("")),
  logo_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
  bimi_record: z.string().optional(),
  domains: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>

interface OrganizationFormProps {
  mode: "add" | "edit"
  initialData?: Partial<IOrganization>
}

export function OrganizationForm({ mode, initialData }: OrganizationFormProps) {
  const initialDomainNames = initialData?.domains?.map((d) => d.domain_name) || []
  const [selectedDomains, setSelectedDomains] = React.useState<string[]>(initialDomainNames)

  const availableDomainNames = MOCK_DOMAINS.map((d) => d.domain_name)

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

  const onSubmit = (data: FormData) => {
    console.log(data)
    // Handle form submission
  }

  const toggleDomain = (domain: string) => {
    const updated = selectedDomains.includes(domain)
      ? selectedDomains.filter((d) => d !== domain)
      : [...selectedDomains, domain]

    setSelectedDomains(updated)
    form.setValue("domains", updated)
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{mode === "add" ? "Add New Organization" : "Edit Organization"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Short display title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1-555-000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="report_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Email</FormLabel>
                    <FormControl>
                      <Input placeholder="reports@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bimi_record"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIMI Record</FormLabel>
                    <FormControl>
                      <Input placeholder="v=BIMI1; l=https://example.com/logo.svg" {...field} />
                    </FormControl>
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter organization address" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Domains</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableDomainNames.map((domain) => (
                  <Badge
                    key={domain}
                    variant={selectedDomains.includes(domain) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDomain(domain)}
                  >
                    {domain}
                    {selectedDomains.includes(domain) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">{mode === "add" ? "Create Organization" : "Update Organization"}</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
