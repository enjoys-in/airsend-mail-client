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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Plus, Mail, CalendarIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { airsendDB } from "@/db"
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
    ON_NEW_MESSAGE: z.object({}).optional(),
    ON_REPLY_MESSAGE: z.object({}).optional(),
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

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blockedSenders: [],
      blockedRecipients: [],
      catchAllEmails: [{ value: "*" }],
      autoReply: {
        enabled: false,
        ON_NEW_MESSAGE: {},
        ON_REPLY_MESSAGE: {}
      },
      vacationSender: {
        enabled: false,
        message: "",
        startDate: "",
        endDate: "",
      },
    },
  })
  const {

    reset, watch,
    formState: { errors },
  } = form
  // Set up field arrays for lists
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
    const obj = {
      blocked_sent_domain: data.blockedSenders.map((sender) => sender.value) || [],
      blocked_recepient_domain: data.blockedRecipients.map((recipient) => recipient.value) || [],
      catch_emails: data.catchAllEmails.map((email) => email.value) || [],
      auto_reply: data.autoReply,
      vacationSender: data.vacationSender,
    }
    await airsendDB.updateMultipleNestedItems("settings", currAccount?.email as string, {
      "settings.blocked_sent_domain": data?.blockedSenders?.map((sender) => sender.value) as string[] || [],
      "settings.blocked_recepient_domain": data?.blockedRecipients?.map((recipient) => recipient.value) as string[] || [],
      "settings.catch_emails": data?.catchAllEmails?.map((email) => email.value) as string[] || [],
      "settings.auto_reply": data.autoReply as any|| {},
      "settings.vacationSender": data.vacationSender as any || {}
    })
    setSettings(obj as any)

  }

  // Add a new blocked sender
  const handleAddBlockedSender = () => {
    if (newBlockedSender && emailOrDomainRegex.test(newBlockedSender)) {
      appendBlockedSender({ value: newBlockedSender })
      setNewBlockedSender("")
    }
  }

  // Add a new blocked recipient
  const handleAddBlockedRecipient = () => {
    if (newBlockedRecipient && emailOrDomainRegex.test(newBlockedRecipient)) {
      appendBlockedRecipient({ value: newBlockedRecipient })
      setNewBlockedRecipient("")
    }
  }

  // Add a new catch-all email
  const handleAddCatchAllEmail = () => {
    if (newCatchAllEmail && (emailRegex.test(newCatchAllEmail) || newCatchAllEmail === "*")) {
      appendCatchAllEmail({ value: newCatchAllEmail })
      setNewCatchAllEmail("")
    }
  }



  useEffect(() => {
    reset({
      blockedSenders: settings?.blocked_sent_domain?.map((domain) => ({ value: domain })) || [],
      blockedRecipients: settings?.blocked_recepient_domain?.map((domain) => ({ value: domain })) || [],
      catchAllEmails: settings?.catch_emails?.map((email) => ({ value: email })) || [{ value: "*" }],

      autoReply: settings?.auto_reply,
      vacationSender: settings?.vacationSender || { enabled: false, message: "", startDate: "", endDate: "" },

    });
  }, [settings, reset]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="blocking" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 mb-4">
            <TabsTrigger value="blocking">Blocking</TabsTrigger>

            <TabsTrigger value="catchall">Catch All</TabsTrigger>
            <TabsTrigger value="autoreply">Auto Reply</TabsTrigger>
            <TabsTrigger value="vacation">Vacation</TabsTrigger>

          </TabsList>

          {/* Blocking Tab */}
          <TabsContent value="blocking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blocked Senders</CardTitle>
                <CardDescription>
                  Add email addresses or domains you want to block from sending you emails.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter email or domain to block"
                      value={newBlockedSender}
                      onChange={(e) => setNewBlockedSender(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddBlockedSender}
                      disabled={!newBlockedSender || !emailOrDomainRegex.test(newBlockedSender)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {blockedSendersFields.map((field, index) => (
                      <Badge key={field.id} variant="secondary" className="px-3 py-1.5 text-sm">
                        {field.value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2"
                          onClick={() => removeBlockedSender(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {blockedSendersFields.length === 0 && (
                      <p className="text-sm text-muted-foreground">No blocked senders added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blocked Recipients</CardTitle>
                <CardDescription>Add email addresses or domains you want to prevent sending emails to.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter email or domain to block"
                      value={newBlockedRecipient}
                      onChange={(e) => setNewBlockedRecipient(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddBlockedRecipient}
                      disabled={!newBlockedRecipient || !emailOrDomainRegex.test(newBlockedRecipient)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {blockedRecipientsFields.map((field, index) => (
                      <Badge key={field.id} variant="secondary" className="px-3 py-1.5 text-sm">
                        {field.value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2"
                          onClick={() => removeBlockedRecipient(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {blockedRecipientsFields.length === 0 && (
                      <p className="text-sm text-muted-foreground">No blocked recipients added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>




          {/* Catch All Tab */}
          <TabsContent value="catchall" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catch All Email Addresses</CardTitle>
                <CardDescription>
                  Add email addresses that will receive all emails sent to non-existent addresses in your domain. Use * as
                  a wildcard to catch all emails.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter email address or *"
                      value={newCatchAllEmail}
                      onChange={(e) => setNewCatchAllEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCatchAllEmail}
                      disabled={!newCatchAllEmail || !(emailRegex.test(newCatchAllEmail) || newCatchAllEmail === "*")}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {catchAllEmailsFields.map((field, index) => (
                      <Badge key={field.id} variant="secondary" className="px-3 py-1.5 text-sm">
                        {field.value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2"
                          onClick={() => removeCatchAllEmail(index)}
                          disabled={catchAllEmailsFields.length === 1 && field.value === "*"}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto Reply Tab */}
          <TabsContent value="autoreply" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto Reply Settings</CardTitle>
                <CardDescription>Configure automatic replies to incoming emails.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="autoReply.enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} id="auto-reply-enabled" />
                      )}
                    />
                    <Label htmlFor="auto-reply-enabled">Enable Auto Reply</Label>
                  </div>

                  {form.watch("autoReply.enabled") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="auto-reply-message">Auto Reply on New Message</Label>
                        <textarea
                          id="auto-reply-message"
                          className="w-full min-h-[120px] p-2 border rounded-md"
                          placeholder="Thank you for your email. I am currently unavailable and will respond as soon as possible."
                          {...form.register("autoReply.ON_NEW_MESSAGE", { required: "Auto reply message is required" })}
                        />
                        {form.formState.errors.autoReply?.message && (
                          <p className="text-sm text-red-500">{form.formState.errors.autoReply.message.toString()}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auto-reply-message">Auto Reply on Reply of Existing Message</Label>
                        <textarea
                          id="auto-reply-message"
                          className="w-full min-h-[120px] p-2 border rounded-md"
                          placeholder="Thank you for your email. I am currently unavailable and will respond as soon as possible."
                          {...form.register("autoReply.ON_REPLY_MESSAGE", { required: "Auto reply message is required" })}
                        />
                        {form.formState.errors.autoReply?.message && (
                          <p className="text-sm text-red-500">{form.formState.errors.autoReply.message.toString()}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vacation Tab */}
          <TabsContent value="vacation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vacation Auto-Responder</CardTitle>
                <CardDescription>Set up an automatic response when you're away.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="vacationSender.enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} id="vacation-enabled" />
                      )}
                    />
                    <Label htmlFor="vacation-enabled">Enable Vacation Auto-Responder</Label>
                  </div>

                  {form.watch("vacationSender.enabled") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">

                          <FormField
                            control={form.control}
                            name="vacationSender.startDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={new Date(field.value || new Date())}

                                      onSelect={(date) => field.onChange(date?.toISOString())}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="space-y-2">

                          <FormField
                            control={form.control}
                            name="vacationSender.endDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={new Date(field.value || new Date())}
                                      onSelect={(date) => field.onChange(date?.toISOString())}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>

                                <FormMessage />
                              </FormItem>
                            )}
                          />



                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vacation-message">Vacation Message</Label>
                        <textarea
                          id="vacation-message"
                          className="w-full min-h-[120px] p-2 border rounded-md"
                          placeholder="I am currently on vacation until [return date]. I will have limited access to email during this time."
                          {...form.register("vacationSender.message")}
                        />
                        {form.formState.errors.vacationSender?.message && (
                          <p className="text-sm text-red-500">{(form.formState.errors.vacationSender.message as any).message.toString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}

        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  )
}
