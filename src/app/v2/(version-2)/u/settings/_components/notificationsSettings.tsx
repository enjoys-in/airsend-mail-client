"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Check, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"

import { airsendDB } from "@/db"
import { useSettingsStore } from "@/store/settings"

// Define the schema based on the provided interface
const notificationFormSchema = z.object({
  new_email: z.boolean().default(true),
  delivery_failed: z.boolean().default(false),
  delivery_success: z.boolean().default(false),
  undelivered_email: z.boolean().default(true),
  push_notification: z.boolean().default(false),

})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

export default function NotificationPreferencesForm({ email }: { email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setSettings, settings } = useSettingsStore()

  // Initialize the form with default values
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: settings?.notifications || {
      new_email: true,
      delivery_failed: false,
      delivery_success: false,
      undelivered_email: false,
      push_notification: false,
    },
  })

  // Handle form submission
  async function onSubmit(data: NotificationFormValues) {
    setIsSubmitting(true)

    // Simulate API call
    await airsendDB.updateNestedItem("settings", email, "settings.notifications", data)
    setIsSubmitting(false)
    setSettings({ notifications: data })

  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Notification Preferences</CardTitle>
        <CardDescription>Choose which notifications you want to receive</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="new_email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">New Email</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Receive Toast notifications about new emails
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_failed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">Delivery Failed</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Receive Toast notifications when an email fails to deliver
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_success"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">Delivery Success</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Receive Toast notifications when an email is successfully delivered
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="undelivered_email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <div className="flex items-center gap-1">
                        <FormLabel className="text-sm font-medium">Undelivered Emails</FormLabel>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <FormDescription className="text-xs text-muted-foreground">
                        Receive Toast notifications for emails that have not been recieved/delivered in your mailbox
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="push_notification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">WebPush Notifications</FormLabel>
                      <FormDescription className="text-xs text-muted-foreground">
                        Enable/Disbale WebPush notifications for email events
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />


            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1">
              {isSubmitting ? "Saving..." : "Save preferences"}
              {!isSubmitting && <Check className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
