"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Check, Bell, Mail, AlertTriangle, CheckCircle2, ShieldAlert, Smartphone, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { airsendDB } from "@/db"
import { useSettingsStore } from "@/store/settings"
import { SettingsPageHeader, SettingsSection, SettingToggleRow } from "./shared"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Define the schema based on the provided interface
const notificationFormSchema = z.object({
  new_email: z.boolean(),
  delivery_failed: z.boolean(),
  delivery_success: z.boolean(),
  undelivered_email: z.boolean(),
  push_notification: z.boolean(),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

export default function NotificationPreferencesForm({ email }: { email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setSettings = useSettingsStore((s) => s.setSettings)
  const settings = useSettingsStore((s) => s.settings)

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
    try {
      await airsendDB.updateNestedItem("settings", email, "settings.notifications", data)
      setSettings({ notifications: data })
      toast.success("Notification preferences saved")
    } catch (err) {
      toast.error("Failed to update notification settings")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDirty = form.formState.isDirty

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Notifications"
        description="Choose how and when you receive in-app alerts, delivery notifications, and push messages."
        icon={<Bell className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Alerts</Badge>}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Event Notifications */}
        <SettingsSection
          title="Email Activity Alerts"
          description="In-app and toast notifications triggered by incoming or outgoing messages"
          icon={<Mail className="size-4" />}
        >
          <Controller
            name="new_email"
            control={form.control}
            render={({ field }) => (
              <SettingToggleRow
                label="New email arrival"
                description="Show toast notifications when new messages arrive in your inbox"
                icon={<Mail className="size-4 text-primary" />}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Controller
            name="delivery_success"
            control={form.control}
            render={({ field }) => (
              <SettingToggleRow
                label="Delivery success confirmation"
                description="Notify when outgoing emails are accepted by the recipient's mail exchange server"
                icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Controller
            name="delivery_failed"
            control={form.control}
            render={({ field }) => (
              <SettingToggleRow
                label="Delivery failed warning"
                description="Immediately alert when an outgoing email bounces or fails delivery"
                icon={<AlertTriangle className="size-4 text-amber-500" />}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Controller
            name="undelivered_email"
            control={form.control}
            render={({ field }) => (
              <SettingToggleRow
                label="Undelivered email warning"
                description="Alert for emails that have not been received or confirmed in your mailbox"
                tooltip="Receive alerts for messages flagged as delayed or rejected upstream"
                icon={<ShieldAlert className="size-4 text-rose-500" />}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </SettingsSection>

        {/* Browser & Push Notifications */}
        <SettingsSection
          title="Browser & Push Notifications"
          description="System-level push alerts when Airsend is running in the background"
          icon={<Smartphone className="size-4" />}
        >
          <Controller
            name="push_notification"
            control={form.control}
            render={({ field }) => (
              <SettingToggleRow
                label="WebPush notifications"
                description="Allow OS-level browser push notifications even when the browser tab is inactive"
                tooltip="Uses standard WebPush API supported by Chrome, Firefox, Safari, and Edge"
                icon={<Bell className="size-4 text-blue-500" />}
                checked={field.value}
                onCheckedChange={field.onChange}
                badge={
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    WebPush
                  </Badge>
                }
              />
            )}
          />
        </SettingsSection>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => form.reset()}
            disabled={!isDirty || isSubmitting}
            className="rounded-xl"
          >
            <RotateCcw className="size-3.5 mr-1.5 opacity-70" />
            Reset to defaults
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl px-5 gap-1.5"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Check className="size-4" />
                Save preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
