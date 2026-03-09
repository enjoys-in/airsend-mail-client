"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Upload, Link2, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IOrganization } from "../_lib/types"
import { API } from "@/lib/api/handler"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const initialDomainNames = initialData?.domains?.map((d) => d.domain_name) || []
  const [selectedDomains, setSelectedDomains] = React.useState<string[]>(initialDomainNames)
  const [logoMode, setLogoMode] = React.useState<"url" | "upload">("url")
  const [logoPreview, setLogoPreview] = React.useState<string | null>(initialData?.logo_url || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [availableDomainNames, setAvailableDomainNames] = React.useState<string[]>([])

  React.useEffect(() => {
    API.handleGetAllDomains().then((res) => {
      const domains = res.data?.result || res.data || []
      setAvailableDomainNames(domains.map((d: any) => d.domain_name))
    }).catch(() => {})
  }, [])

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

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "edit" && initialData?.id) {
        await API.updateOrganization(initialData.id, data)
      } else {
        await API.createOrganization(data)
      }
      router.push("/h-panel/org")
    } catch (err) {
      console.error(err)
    }
  }

  const toggleDomain = (domain: string) => {
    const updated = selectedDomains.includes(domain)
      ? selectedDomains.filter((d) => d !== domain)
      : [...selectedDomains, domain]

    setSelectedDomains(updated)
    form.setValue("domains", updated)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setLogoPreview(objectUrl)
    // In a real app, upload the file and set the returned URL
    form.setValue("logo_url", objectUrl)
  }

  return (
    <Card className="rounded-none w-full">
      <CardHeader>
        <CardTitle>{mode === "add" ? "Add New Organization" : "Edit Organization"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Section */}
            <div className="space-y-3">
              <FormLabel>Organization Logo</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="h-24 w-24 shrink-0 border border-dashed flex items-center justify-center bg-muted/30">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={logoMode === "url" ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setLogoMode("url")}
                    >
                      <Link2 className="h-3.5 w-3.5 mr-1.5" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={logoMode === "upload" ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setLogoMode("upload")}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload
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
                              placeholder="https://example.com/logo.png"
                              className="rounded-none"
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
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-none"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      {logoPreview && logoMode === "upload" && (
                        <span className="ml-2 text-xs text-muted-foreground">File selected</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" className="rounded-none" {...field} />
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
                      <Input placeholder="Short display title" className="rounded-none" {...field} />
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
                      <Input placeholder="+1-555-000-0000" className="rounded-none" {...field} />
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
                      <Input placeholder="reports@example.com" className="rounded-none" {...field} />
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
                      <Input placeholder="v=BIMI1; l=https://example.com/logo.svg" className="rounded-none" {...field} />
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
                    <Textarea placeholder="Enter organization address" className="min-h-[80px] rounded-none" {...field} />
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
              <Button type="submit" className="rounded-none">
                {mode === "add" ? "Create Organization" : "Update Organization"}
              </Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
