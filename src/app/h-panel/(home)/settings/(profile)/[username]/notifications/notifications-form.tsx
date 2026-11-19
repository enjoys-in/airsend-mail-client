"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Section } from "@/components/h-panel/kit"
import { FormFooter } from "../../../_components/settings-shell"

const notificationsFormSchema = z.object({
  type: z.enum(["all", "mentions", "none"], {
    error: "You need to select a notification type.",
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
  social_emails: true,
  security_emails: true,
}

export function NotificationsForm() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  })

  function onSubmit(data: NotificationsFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  /** One email-notification switch as a "label + helper left, switch right" row. */
  const emailRow = (
    name: "communication_emails" | "marketing_emails" | "social_emails" | "security_emails",
    label: string,
    description: string,
    locked?: boolean
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between gap-4 space-y-0 py-4 first:pt-0 last:pb-0">
          <div className="min-w-0 space-y-0.5">
            <FormLabel className="text-sm">{label}</FormLabel>
            <FormDescription className="text-xs">{description}</FormDescription>
          </div>
          <FormControl>
            {locked ? (
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled aria-readonly />
            ) : (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Section title="Notify me about" description="What triggers an in-app notification.">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="all" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        All new messages
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="mentions" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Direct messages and mentions
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="none" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">Nothing</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Email notifications" description="Which emails we may send you.">
          <div className="divide-y divide-border/70">
            {emailRow("communication_emails", "Communication emails", "Receive emails about your account activity.")}
            {emailRow("marketing_emails", "Marketing emails", "Receive emails about new products, features, and more.")}
            {emailRow("social_emails", "Social emails", "Receive emails for friend requests, follows, and more.")}
            {emailRow("security_emails", "Security emails", "Receive emails about your account activity and security.", true)}
          </div>
        </Section>

        <Section title="Devices">
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    Use different settings for my mobile devices
                  </FormLabel>
                  <FormDescription>
                    You can manage your mobile notifications in the{" "}
                    <Link href="/examples/forms" className="underline underline-offset-4 hover:text-foreground">mobile settings</Link> page.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </Section>

        <FormFooter>
          <Button type="submit">Update notifications</Button>
        </FormFooter>
      </form>
    </Form>
  )
}
