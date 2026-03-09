"use client"

import * as React from "react"
import { useActionState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, Shield, Eye, Server, RefreshCw } from "lucide-react"
import { API } from "@/lib/api/handler"
import { useToast } from "@/components/ui/use-toast"
import type { AccountSettings } from "@/lib/types/account-settings.interface"
import { SubmitButton } from "./submit-button"
import { NotificationsSection } from "./notifications-section"
import { SecuritySection } from "./security-section"
import { EmailSection } from "./email-section"
import { ServerSection } from "./server-section"
import { PrivacySection } from "./privacy-section"
import { AdvancedSection } from "./advanced-section"

export const DEFAULT_SETTINGS: AccountSettings = {
    usage: 0,
    mailbox_size: 0,
    quota_in_percent: "0",
    notifications: { new_email: true, delivery_failed: false, delivery_success: false, undelivered_email: false, push_notification: false },
    security: { password_confirmation: false, password_expiration: { enabled: false, days: 0 }, change_on_first_login: false },
    blocked_sent_domain: [],
    blocked_recepient_domain: [],
    aliases: [],
    forwarding_rules: [],
    catch_emails: [],
    smtp_config: { enable_smtp: true, enable_smtp_from_alias: false, allow_email_tracking: false },
    auto_reply: { enabled: false, ON_NEW_MESSAGE: {}, ON_REPLY_MESSAGE: {} },
    vacationSender: { enabled: false, message: "", startDate: "", endDate: "" },
    user: { display_name: null, first_name: null, last_name: null, use_display_name: true, timezone: "Asia/Kolkata" },
    personalization: { theme: "dark", layout: "2-column" },
    email_settings: {
        autoShowImages: false, keepMessages: true, excludeSpam: true, confirmLinks: true,
        conversationGrouping: true, autoDeleteUnwanted: false, stickyLabels: false,
        monthly_limit: 1000, thresold_limit: 500, secure_email_enabled: true,
        email_footer: { footer_enabled: false, footer_text: null },
        system_email: { is_system_email: false, system_email_reply: null },
        system_email_reply: null,
    },
    email_privacy: { autoShowImages: false, block_email_tracking: false },
    imap_config: { enable_imap: false },
    calender_config: { enable_calender: false, calender_sync_interval: 60, notifications: true, sharing: false, config: [] },
    display: { showMeetings: true, showRightSidebar: true, showCalendar: true, showQuota: true, settings: true },
    auto_sync: { enabled: true, interval: 5 },
    encryption: { prompt_trust_keys: false, verify_key_transparency: false, sign_external_messages: false, attach_public_key: false, default_pgp_scheme: "PGP/MIME" },
    folders_settings: { use_folder_colors: false, inherit_parent_color: false },
    composing: { composer_mode: "normal", conversations_per_page: 25, text_direction: "ltr", default_font: "Arial", default_font_size: 14 },
    signatures: [],
    organization: { id: "", current_org_id: null },
    last_synced_at: null,
    sync_error: null,
    sync_status: null,
}

type ActionState = { success: boolean; message: string }

interface SettingsFormProps {
    account: string
    initialData?: Partial<AccountSettings>
}

export function SettingsForm({ account, initialData }: SettingsFormProps) {
    const { toast } = useToast()

    const form = useForm<AccountSettings>({
        defaultValues: { ...DEFAULT_SETTINGS, ...initialData },
    })

    // Reset form when initialData changes (new account loaded)
    React.useEffect(() => {
        if (initialData) {
            form.reset({ ...DEFAULT_SETTINGS, ...initialData })
        }
    }, [initialData, form])

    const [state, formAction, isPending] = useActionState<ActionState>(
        async (prevState: ActionState) => {
            const isValid = await form.trigger()
            if (!isValid) return { success: false, message: "Validation failed" }

            const values = form.getValues()
            try {
                const { data } = await API.handleUpdateAccountSettings(account, values)
                if (data?.success) {
                    form.reset(values)
                    return { success: true, message: "Settings saved successfully" }
                }
                return { success: false, message: data?.message || "Failed to save settings" }
            } catch (err: any) {
                return { success: false, message: err.message || "An error occurred" }
            }
        },
        { success: false, message: "" }
    )

    // Show toast on state change
    React.useEffect(() => {
        if (!state.message) return
        toast({
            title: state.success ? "Success" : "Error",
            description: state.message,
            variant: state.success ? "default" : "destructive",
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    return (
        <FormProvider {...form}>
            <form action={formAction} className="space-y-4">
                <div className="flex justify-end">
                    <SubmitButton />
                </div>

                <Tabs defaultValue="notifications" className="w-full">
                    <TabsList className="flex w-full overflow-x-auto h-auto">
                        <TabsTrigger value="notifications" className="text-xs gap-1 flex-1 min-w-0">
                            <Bell className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="text-xs gap-1 flex-1 min-w-0">
                            <Shield className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="email" className="text-xs gap-1 flex-1 min-w-0">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Email</span>
                        </TabsTrigger>
                        <TabsTrigger value="server" className="text-xs gap-1 flex-1 min-w-0">
                            <Server className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Server</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="text-xs gap-1 flex-1 min-w-0">
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Privacy</span>
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="text-xs gap-1 flex-1 min-w-0">
                            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Advanced</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="mt-4">
                        <NotificationsSection />
                    </TabsContent>
                    <TabsContent value="security" className="mt-4">
                        <SecuritySection />
                    </TabsContent>
                    <TabsContent value="email" className="mt-4">
                        <EmailSection />
                    </TabsContent>
                    <TabsContent value="server" className="mt-4">
                        <ServerSection />
                    </TabsContent>
                    <TabsContent value="privacy" className="mt-4">
                        <PrivacySection />
                    </TabsContent>
                    <TabsContent value="advanced" className="mt-4">
                        <AdvancedSection />
                    </TabsContent>
                </Tabs>
            </form>
        </FormProvider>
    )
}
