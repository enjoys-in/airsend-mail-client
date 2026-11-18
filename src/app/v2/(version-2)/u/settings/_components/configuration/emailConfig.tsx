"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus, CalendarIcon, Ban, Inbox, MessageSquare, Palmtree, Check, Sliders } from "lucide-react"
import { useSettingsStore } from "@/store/settings"
import { useAppSelector } from "@/store/hooks"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { airsendDB } from "@/db"
import { SettingsPageHeader, SettingsSection } from "../shared"
import { toast } from "sonner"

// Define the validation schema
const emailOrDomainRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const formSchema = z.object({
  blockedSenders: z.array(
    z.object({
      value: z.string().regex(emailOrDomainRegex, "Please enter a valid email or domain").optional(),
    }),
  ),
  blockedRecipients: z.array(
    z.object({
      value: z.string().regex(emailOrDomainRegex, "Please enter a valid email or domain").optional(),
    }),
  ),
  catchAllEmails: z.array(
    z.object({
      value: z.string().regex(emailRegex, "Please enter a valid email").or(z.literal("*")).optional(),
    }),
  ),
  autoReply: z.object({
    enabled: z.boolean().optional(),
    ON_NEW_MESSAGE: z.any().optional(),
    ON_REPLY_MESSAGE: z.any().optional(),
  }),
  vacationSender: z.object({
    enabled: z.boolean().optional(),
    message: z.string().min(1, "Message is required").optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function EmailSettingsForm({ email }: { email: string }) {
  const { currAccount } = useAppSelector((state) => state.accounts)
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const [newBlockedSender, setNewBlockedSender] = useState("")
  const [newBlockedRecipient, setNewBlockedRecipient] = useState("")
  const [newCatchAllEmail, setNewCatchAllEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockedSenders: [],
      blockedRecipients: [],
      catchAllEmails: [{ value: "*" }],
      autoReply: {
        enabled: false,
        ON_NEW_MESSAGE: "",
        ON_REPLY_MESSAGE: "",
      },
      vacationSender: {
        enabled: false,
        message: "",
        startDate: "",
        endDate: "",
      },
    },
  })
  const { reset } = form

  const {
    fields: blockedSendersFields,
    append: appendBlockedSender,
    remove: removeBlockedSender,
  } = useFieldArray({
    control: form.control,
    name: "blockedSenders",
  })

  const {
    fields: blockedRecipientsFields,
    append: appendBlockedRecipient,
    remove: removeBlockedRecipient,
  } = useFieldArray({
    control: form.control,
    name: "blockedRecipients",
  })

  const {
    fields: catchAllEmailsFields,
    append: appendCatchAllEmail,
    remove: removeCatchAllEmail,
  } = useFieldArray({
    control: form.control,
    name: "catchAllEmails",
  })

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!currAccount?.email) return
    setIsSubmitting(true)
    try {
      const obj = {
        blocked_sent_domain: data.blockedSenders.map((s) => s.value).filter(Boolean) as string[],
        blocked_recepient_domain: data.blockedRecipients.map((r) => r.value).filter(Boolean) as string[],
        catch_emails: data.catchAllEmails.map((c) => c.value).filter(Boolean) as string[],
        auto_reply: data.autoReply,
        vacationSender: data.vacationSender,
      }
      await airsendDB.updateMultipleNestedItems("settings", currAccount.email, {
        "settings.blocked_sent_domain": obj.blocked_sent_domain,
        "settings.blocked_recepient_domain": obj.blocked_recepient_domain,
        "settings.catch_emails": obj.catch_emails,
        "settings.auto_reply": data.autoReply as any || {},
        "settings.vacationSender": data.vacationSender as any || {},
      })
      setSettings(obj as any)
      toast.success("Email configuration updated")
    } catch (err) {
      toast.error("Failed to update email configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddBlockedSender = () => {
    if (newBlockedSender && emailOrDomainRegex.test(newBlockedSender.trim())) {
      appendBlockedSender({ value: newBlockedSender.trim() })
      setNewBlockedSender("")
    }
  }

  const handleAddBlockedRecipient = () => {
    if (newBlockedRecipient && emailOrDomainRegex.test(newBlockedRecipient.trim())) {
      appendBlockedRecipient({ value: newBlockedRecipient.trim() })
      setNewBlockedRecipient("")
    }
  }

  const handleAddCatchAllEmail = () => {
    const trimmed = newCatchAllEmail.trim()
    if (trimmed && (emailRegex.test(trimmed) || trimmed === "*")) {
      appendCatchAllEmail({ value: trimmed })
      setNewCatchAllEmail("")
    }
  }

  useEffect(() => {
    if (settings) {
      reset({
        blockedSenders: settings?.blocked_sent_domain?.map((domain) => ({ value: domain })) || [],
        blockedRecipients: settings?.blocked_recepient_domain?.map((domain) => ({ value: domain })) || [],
        catchAllEmails: settings?.catch_emails?.map((e) => ({ value: e })) || [{ value: "*" }],
        autoReply: settings?.auto_reply || { enabled: false, ON_NEW_MESSAGE: "", ON_REPLY_MESSAGE: "" },
        vacationSender: settings?.vacationSender || { enabled: false, message: "", startDate: "", endDate: "" },
      })
    }
  }, [settings, reset])

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Email Config"
        description="Manage domain-level spam blocklists, catch-all routing, automated responses, and vacation responders."
        icon={<Sliders className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Delivery</Badge>}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="blocking" className="w-full">
            {/* Responsive Scrollable Tab List */}
            <div className="overflow-x-auto no-scrollbar pb-1">
              <TabsList className="h-10 p-1 bg-muted/60 rounded-xl inline-flex min-w-full sm:min-w-0 sm:grid sm:grid-cols-4">
                <TabsTrigger value="blocking" className="rounded-lg text-xs sm:text-sm gap-1.5 flex-1 whitespace-nowrap">
                  <Ban className="size-3.5" />
                  <span>Blocking</span>
                </TabsTrigger>
                <TabsTrigger value="catchall" className="rounded-lg text-xs sm:text-sm gap-1.5 flex-1 whitespace-nowrap">
                  <Inbox className="size-3.5" />
                  <span>Catch All</span>
                </TabsTrigger>
                <TabsTrigger value="autoreply" className="rounded-lg text-xs sm:text-sm gap-1.5 flex-1 whitespace-nowrap">
                  <MessageSquare className="size-3.5" />
                  <span>Auto Reply</span>
                </TabsTrigger>
                <TabsTrigger value="vacation" className="rounded-lg text-xs sm:text-sm gap-1.5 flex-1 whitespace-nowrap">
                  <Palmtree className="size-3.5" />
                  <span>Vacation</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ---- Blocking Tab ---- */}
            <TabsContent value="blocking" className="space-y-6 pt-2">
              <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Blocked Senders</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Emails from these addresses or entire domains will be rejected immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="e.g. spammer@domain.com or @annoying.com"
                      value={newBlockedSender}
                      onChange={(e) => setNewBlockedSender(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBlockedSender())}
                      className="h-9 text-xs sm:text-sm bg-background flex-1 rounded-xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddBlockedSender}
                      disabled={!newBlockedSender.trim() || !emailOrDomainRegex.test(newBlockedSender.trim())}
                      className="h-9 rounded-xl text-xs gap-1"
                    >
                      <Plus className="size-3.5" /> Block Sender
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {blockedSendersFields.map((field, index) => (
                      <Badge
                        key={field.id}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 bg-muted/80 border border-border/60"
                      >
                        <span>{field.value}</span>
                        <button
                          type="button"
                          onClick={() => removeBlockedSender(index)}
                          className="hover:text-destructive transition-colors p-0.5 rounded-full"
                          aria-label={`Remove ${field.value}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    {blockedSendersFields.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">No blocked senders configured.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Blocked Recipients</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Prevent outbound messages from being sent to these destination addresses or domains.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="e.g. competitor.com or restricted@org.com"
                      value={newBlockedRecipient}
                      onChange={(e) => setNewBlockedRecipient(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBlockedRecipient())}
                      className="h-9 text-xs sm:text-sm bg-background flex-1 rounded-xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddBlockedRecipient}
                      disabled={!newBlockedRecipient.trim() || !emailOrDomainRegex.test(newBlockedRecipient.trim())}
                      className="h-9 rounded-xl text-xs gap-1"
                    >
                      <Plus className="size-3.5" /> Block Recipient
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {blockedRecipientsFields.map((field, index) => (
                      <Badge
                        key={field.id}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 bg-muted/80 border border-border/60"
                      >
                        <span>{field.value}</span>
                        <button
                          type="button"
                          onClick={() => removeBlockedRecipient(index)}
                          className="hover:text-destructive transition-colors p-0.5 rounded-full"
                          aria-label={`Remove ${field.value}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    {blockedRecipientsFields.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">No blocked recipients configured.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---- Catch All Tab ---- */}
            <TabsContent value="catchall" className="space-y-6 pt-2">
              <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Catch-All Addresses</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Designate mailboxes that will intercept all emails sent to non-existent addresses on your domain. Use &quot;*&quot; to route all unmatched mail.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter catch email or *"
                      value={newCatchAllEmail}
                      onChange={(e) => setNewCatchAllEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCatchAllEmail())}
                      className="h-9 text-xs sm:text-sm bg-background flex-1 rounded-xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCatchAllEmail}
                      disabled={!newCatchAllEmail.trim() || !(emailRegex.test(newCatchAllEmail.trim()) || newCatchAllEmail.trim() === "*")}
                      className="h-9 rounded-xl text-xs gap-1"
                    >
                      <Plus className="size-3.5" /> Add Catch-All
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {catchAllEmailsFields.map((field, index) => (
                      <Badge
                        key={field.id}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-mono rounded-lg flex items-center gap-1.5 bg-muted/80 border border-border/60"
                      >
                        <span>{field.value}</span>
                        <button
                          type="button"
                          onClick={() => removeCatchAllEmail(index)}
                          disabled={catchAllEmailsFields.length === 1 && field.value === "*"}
                          className="hover:text-destructive transition-colors p-0.5 rounded-full disabled:opacity-40"
                          aria-label={`Remove ${field.value}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---- Auto Reply Tab ---- */}
            <TabsContent value="autoreply" className="space-y-6 pt-2">
              <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Automated Responses</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Automatically dispatch pre-written replies when incoming messages arrive
                      </CardDescription>
                    </div>
                    <Controller
                      name="autoReply.enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="auto-reply-enabled"
                        />
                      )}
                    />
                  </div>
                </CardHeader>
                {form.watch("autoReply.enabled") && (
                  <CardContent className="space-y-4 pt-2 border-t border-border/40 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <Label htmlFor="auto-reply-new" className="text-xs sm:text-sm font-medium">
                        Reply on New Inbound Threads
                      </Label>
                      <textarea
                        id="auto-reply-new"
                        className="w-full min-h-[100px] p-3 text-xs sm:text-sm border rounded-xl bg-background/80 outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Thank you for reaching out. We have received your message and will get back to you shortly."
                        {...form.register("autoReply.ON_NEW_MESSAGE")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="auto-reply-thread" className="text-xs sm:text-sm font-medium">
                        Reply on Existing Thread Follow-ups
                      </Label>
                      <textarea
                        id="auto-reply-thread"
                        className="w-full min-h-[100px] p-3 text-xs sm:text-sm border rounded-xl bg-background/80 outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Your reply has been logged. Our team is continuing to investigate."
                        {...form.register("autoReply.ON_REPLY_MESSAGE")}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* ---- Vacation Tab ---- */}
            <TabsContent value="vacation" className="space-y-6 pt-2">
              <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Out of Office Responder</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Notify senders that you are away during a scheduled date range
                      </CardDescription>
                    </div>
                    <Controller
                      name="vacationSender.enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="vacation-enabled"
                        />
                      )}
                    />
                  </div>
                </CardHeader>
                {form.watch("vacationSender.enabled") && (
                  <CardContent className="space-y-4 pt-2 border-t border-border/40 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Start Date */}
                      <FormField
                        control={form.control}
                        name="vacationSender.startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-1">
                            <FormLabel className="text-xs font-medium">Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-9 pl-3 text-left font-normal text-xs sm:text-sm rounded-xl",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Pick start date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date: any) => field.onChange(date?.toISOString())}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* End Date */}
                      <FormField
                        control={form.control}
                        name="vacationSender.endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-1">
                            <FormLabel className="text-xs font-medium">End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-9 pl-3 text-left font-normal text-xs sm:text-sm rounded-xl",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Pick return date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date: any) => field.onChange(date?.toISOString())}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="vacation-message" className="text-xs sm:text-sm font-medium">
                        Vacation Auto-Reply Message
                      </Label>
                      <textarea
                        id="vacation-message"
                        className="w-full min-h-[120px] p-3 text-xs sm:text-sm border rounded-xl bg-background/80 outline-none focus:ring-1 focus:ring-primary"
                        placeholder="I am currently away and will have limited access to email until [return date]."
                        {...form.register("vacationSender.message")}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="rounded-xl px-6 gap-1.5">
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Check className="size-4" />
                  Save Email Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
