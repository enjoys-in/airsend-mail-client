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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  logo: z.string().optional(),
  banner: z.string().optional(),
  footer: z.string().optional(),
  headerColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  permissions: z.array(z.string()),
  role: z.string(),
  domains: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>

interface OrganizationFormProps {
  mode: "add" | "edit"
  initialData?: Partial<FormData>
}

const availablePermissions = ["read", "write", "admin", "delete", "manage_users", "manage_settings"]

const availableRoles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Administrator" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
]

const availableDomains = ["acme.com", "acme.org", "example.com", "test.com", "demo.org"]

export function OrganizationForm({ mode, initialData }: OrganizationFormProps) {
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(initialData?.permissions || [])
  const [selectedDomains, setSelectedDomains] = React.useState<string[]>(initialData?.domains || [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      logo: initialData?.logo || "",
      banner: initialData?.banner || "",
      footer: initialData?.footer || "",
      headerColor: initialData?.headerColor || "#3b82f6",
      permissions: initialData?.permissions || [],
      role: initialData?.role || "",
      domains: initialData?.domains || [],
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
    // Handle form submission
  }

  const togglePermission = (permission: string) => {
    const updated = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission]

    setSelectedPermissions(updated)
    form.setValue("permissions", updated)
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Banner URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/banner.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headerColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="#3b82f6" {...field} />
                        <div className="w-10 h-10 rounded border" style={{ backgroundColor: field.value }} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="footer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Footer</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter footer text" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Permissions</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availablePermissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant={selectedPermissions.includes(permission) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePermission(permission)}
                  >
                    {permission}
                    {selectedPermissions.includes(permission) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel>Domains</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableDomains.map((domain) => (
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
