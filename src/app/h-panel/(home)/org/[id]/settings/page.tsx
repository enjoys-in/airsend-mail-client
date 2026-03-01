"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Loader2, Mail, Shield, Bell, Eye, Server, Calendar, RefreshCw, X, Plus } from "lucide-react"
import Link from "next/link"
import { API } from "@/lib/api/handler"
import { useToast } from "@/components/ui/use-toast"
import type { IAccountSettings } from "../../_lib/types"
import { DEFAULT_ACCOUNT_SETTINGS } from "../../_lib/mock-data"

export default function ManageSettingsPage() {
    const params = useParams()
    const { toast } = useToast()
    const [selectedDomain, setSelectedDomain] = React.useState<string>("")
    const [selectedAccount, setSelectedAccount] = React.useState<string>("")
    const [domains, setDomains] = React.useState<any[]>([])
    const [accounts, setAccounts] = React.useState<any[]>([])
    const [settings, setSettings] = React.useState<IAccountSettings>(DEFAULT_ACCOUNT_SETTINGS)
    const [loading, setLoading] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const [newBlockedDomain, setNewBlockedDomain] = React.useState("")
    const [newBlockedRecipient, setNewBlockedRecipient] = React.useState("")

    React.useEffect(() => {
        API.handleGetAllDomains().then(({ data }) => {
            if (data.success) setDomains(data.result || [])
        }).catch(() => {})
    }, [])

    React.useEffect(() => {
        if (!selectedDomain) { setAccounts([]); setSelectedAccount(""); return }
        setLoading(true)
        API.handleGetAllAccounts(selectedDomain).then(({ data }: any) => {
            if (data.success) setAccounts(data.result || [])
        }).catch(() => {}).finally(() => setLoading(false))
    }, [selectedDomain])

    React.useEffect(() => {
        if (!selectedAccount) return
        setLoading(true)
        API.handleGetAccountSettings(selectedAccount).then(({ data }: any) => {
            if (data.success && data.result) setSettings({ ...DEFAULT_ACCOUNT_SETTINGS, ...data.result })
        }).catch(() => {}).finally(() => setLoading(false))
    }, [selectedAccount])

    const handleSave = async () => {
        try {
            setSaving(true)
            const { data } = await API.handleUpdateAccountSettings(selectedAccount, settings)
            if (data?.success) {
                toast({ title: "Settings saved successfully" })
            } else {
                throw new Error(data?.message || "Failed to save")
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const updateSettings = <K extends keyof IAccountSettings>(key: K, value: IAccountSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const addBlockedDomain = (type: "sent" | "recipient") => {
        const val = type === "sent" ? newBlockedDomain : newBlockedRecipient
        if (!val.trim()) return
        if (type === "sent") {
            updateSettings("blocked_sent_domain", [...settings.blocked_sent_domain, val.trim()])
            setNewBlockedDomain("")
        } else {
            updateSettings("blocked_recepient_domain", [...settings.blocked_recepient_domain, val.trim()])
            setNewBlockedRecipient("")
        }
    }

    const removeBlockedDomain = (type: "sent" | "recipient", domain: string) => {
        if (type === "sent") {
            updateSettings("blocked_sent_domain", settings.blocked_sent_domain.filter(d => d !== domain))
        } else {
            updateSettings("blocked_recepient_domain", settings.blocked_recepient_domain.filter(d => d !== domain))
        }
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/org">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Account Settings — Org {params.id}</h1>
                {selectedAccount && (
                    <div className="ml-auto">
                        <Button size="sm" onClick={handleSave} disabled={saving || !selectedAccount}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Settings
                        </Button>
                    </div>
                )}
            </header>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4 max-w-5xl">
                    {/* Domain & Account Selection */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Domain & Account Selection</CardTitle>
                            <CardDescription>Select a domain and account to manage its settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Domain</Label>
                                    <Select value={selectedDomain} onValueChange={(v) => { setSelectedDomain(v); setSelectedAccount("") }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {domains.map((d: any) => (
                                                <SelectItem key={d.id || d.domain_name} value={d.domain_name}>{d.domain_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Account</Label>
                                    <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={!selectedDomain || loading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loading ? "Loading..." : "Select account"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((a: any) => (
                                                <SelectItem key={a.email || a.id} value={a.email}>{a.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedAccount && !loading && (
                        <Tabs defaultValue="notifications" className="w-full">
                            <TabsList className="grid w-full grid-cols-6 h-auto">
                                <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="h-3.5 w-3.5" />Notifications</TabsTrigger>
                                <TabsTrigger value="security" className="text-xs gap-1"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
                                <TabsTrigger value="email" className="text-xs gap-1"><Mail className="h-3.5 w-3.5" />Email</TabsTrigger>
                                <TabsTrigger value="server" className="text-xs gap-1"><Server className="h-3.5 w-3.5" />Server</TabsTrigger>
                                <TabsTrigger value="privacy" className="text-xs gap-1"><Eye className="h-3.5 w-3.5" />Privacy</TabsTrigger>
                                <TabsTrigger value="advanced" className="text-xs gap-1"><RefreshCw className="h-3.5 w-3.5" />Advanced</TabsTrigger>
                            </TabsList>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Notification Preferences</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="New Email" description="Notify on new incoming emails"
                                            checked={settings.notifications.new_email}
                                            onChange={(v) => updateSettings("notifications", { ...settings.notifications, new_email: v })} />
                                        <SettingRow label="Delivery Failed" description="Notify when email delivery fails"
                                            checked={settings.notifications.delivery_failed}
                                            onChange={(v) => updateSettings("notifications", { ...settings.notifications, delivery_failed: v })} />
                                        <SettingRow label="Delivery Success" description="Notify on successful delivery"
                                            checked={settings.notifications.delivery_success}
                                            onChange={(v) => updateSettings("notifications", { ...settings.notifications, delivery_success: v })} />
                                        <SettingRow label="Undelivered Email" description="Notify for undelivered emails"
                                            checked={settings.notifications.undelivered_email}
                                            onChange={(v) => updateSettings("notifications", { ...settings.notifications, undelivered_email: v })} />
                                        <SettingRow label="Push Notifications" description="Enable browser push notifications"
                                            checked={settings.notifications.push_notification}
                                            onChange={(v) => updateSettings("notifications", { ...settings.notifications, push_notification: v })} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Security Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Password Confirmation" description="Require password for sensitive actions"
                                            checked={settings.security.password_confirmation}
                                            onChange={(v) => updateSettings("security", { ...settings.security, password_confirmation: v })} />
                                        <SettingRow label="Change on First Login" description="Force password change on first login"
                                            checked={settings.security.change_on_first_login}
                                            onChange={(v) => updateSettings("security", { ...settings.security, change_on_first_login: v })} />
                                        <Separator />
                                        <SettingRow label="Password Expiration" description="Enable password expiration policy"
                                            checked={settings.security.password_expiration.enabled}
                                            onChange={(v) => updateSettings("security", {
                                                ...settings.security,
                                                password_expiration: { ...settings.security.password_expiration, enabled: v }
                                            })} />
                                        {settings.security.password_expiration.enabled && (
                                            <div className="ml-4 space-y-2">
                                                <Label>Expiration Days</Label>
                                                <Input type="number" className="max-w-[150px]" value={settings.security.password_expiration.days}
                                                    onChange={(e) => updateSettings("security", {
                                                        ...settings.security,
                                                        password_expiration: { ...settings.security.password_expiration, days: parseInt(e.target.value) || 0 }
                                                    })} />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Email Tab */}
                            <TabsContent value="email" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Email Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Auto Show Images" description="Automatically show images in emails"
                                            checked={settings.email_settings.autoShowImages}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, autoShowImages: v })} />
                                        <SettingRow label="Keep Messages" description="Keep messages after reading"
                                            checked={settings.email_settings.keepMessages}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, keepMessages: v })} />
                                        <SettingRow label="Exclude Spam" description="Exclude spam from inbox view"
                                            checked={settings.email_settings.excludeSpam}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, excludeSpam: v })} />
                                        <SettingRow label="Confirm Links" description="Ask before opening external links"
                                            checked={settings.email_settings.confirmLinks}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, confirmLinks: v })} />
                                        <SettingRow label="Conversation Grouping" description="Group related emails into conversations"
                                            checked={settings.email_settings.conversationGrouping}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, conversationGrouping: v })} />
                                        <SettingRow label="Auto Delete Unwanted" description="Automatically delete unwanted emails"
                                            checked={settings.email_settings.autoDeleteUnwanted}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, autoDeleteUnwanted: v })} />
                                        <SettingRow label="Secure Email" description="Enable end-to-end encryption"
                                            checked={settings.email_settings.secure_email_enabled}
                                            onChange={(v) => updateSettings("email_settings", { ...settings.email_settings, secure_email_enabled: v })} />
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Monthly Limit</Label>
                                                <Input type="number" value={settings.email_settings.monthly_limit}
                                                    onChange={(e) => updateSettings("email_settings", { ...settings.email_settings, monthly_limit: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Threshold Limit</Label>
                                                <Input type="number" value={settings.email_settings.thresold_limit}
                                                    onChange={(e) => updateSettings("email_settings", { ...settings.email_settings, thresold_limit: e.target.value })} />
                                            </div>
                                        </div>
                                        <Separator />
                                        <SettingRow label="Email Footer" description="Add a footer to all outgoing emails"
                                            checked={settings.email_settings.email_footer.footer_enabled}
                                            onChange={(v) => updateSettings("email_settings", {
                                                ...settings.email_settings,
                                                email_footer: v ? { footer_enabled: true, footer_text: "" } : { footer_enabled: false, footer_text: null }
                                            })} />
                                        {settings.email_settings.email_footer.footer_enabled && (
                                            <div className="ml-4">
                                                <Textarea placeholder="Enter footer text..."
                                                    value={settings.email_settings.email_footer.footer_text || ""}
                                                    onChange={(e) => updateSettings("email_settings", {
                                                        ...settings.email_settings,
                                                        email_footer: { footer_enabled: true, footer_text: e.target.value }
                                                    })} />
                                            </div>
                                        )}
                                        <Separator />
                                        <SettingRow label="System Email" description="Mark this as a system email account"
                                            checked={settings.email_settings.system_email.is_system_email}
                                            onChange={(v) => updateSettings("email_settings", {
                                                ...settings.email_settings,
                                                system_email: v ? { is_system_email: true, system_email_reply: "" } : { is_system_email: false, system_email_reply: null }
                                            })} />
                                        {settings.email_settings.system_email.is_system_email && (
                                            <div className="ml-4 space-y-2">
                                                <Label>System Email Reply Address</Label>
                                                <Input placeholder="noreply@domain.com"
                                                    value={settings.email_settings.system_email.system_email_reply || ""}
                                                    onChange={(e) => updateSettings("email_settings", {
                                                        ...settings.email_settings,
                                                        system_email: { is_system_email: true, system_email_reply: e.target.value }
                                                    })} />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Vacation / Auto Reply */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Vacation / Auto-Reply
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Enable Vacation Sender" description="Automatically reply when you are away"
                                            checked={settings.vacationSender.enabled}
                                            onChange={(v) => updateSettings("vacationSender", { ...settings.vacationSender, enabled: v })} />
                                        {settings.vacationSender.enabled && (
                                            <div className="space-y-3 ml-4">
                                                <div className="space-y-2">
                                                    <Label>Auto-Reply Message</Label>
                                                    <Textarea placeholder="I am currently out of office..."
                                                        value={settings.vacationSender.message}
                                                        onChange={(e) => updateSettings("vacationSender", { ...settings.vacationSender, message: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Start Date</Label>
                                                        <Input type="date" value={settings.vacationSender.startDate}
                                                            onChange={(e) => updateSettings("vacationSender", { ...settings.vacationSender, startDate: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>End Date</Label>
                                                        <Input type="date" value={settings.vacationSender.endDate}
                                                            onChange={(e) => updateSettings("vacationSender", { ...settings.vacationSender, endDate: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Server Tab */}
                            <TabsContent value="server" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">SMTP Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Enable SMTP" description="Allow sending emails via SMTP"
                                            checked={settings.smtp_config.enable_smtp}
                                            onChange={(v) => updateSettings("smtp_config", { ...settings.smtp_config, enable_smtp: v })} />
                                        <SettingRow label="SMTP from Alias" description="Allow sending emails from aliases"
                                            checked={settings.smtp_config.enable_smtp_from_alias}
                                            onChange={(v) => updateSettings("smtp_config", { ...settings.smtp_config, enable_smtp_from_alias: v })} />
                                        <SettingRow label="Email Tracking" description="Allow email open/click tracking"
                                            checked={settings.smtp_config.allow_email_tracking}
                                            onChange={(v) => updateSettings("smtp_config", { ...settings.smtp_config, allow_email_tracking: v })} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">IMAP Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <SettingRow label="Enable IMAP" description="Allow receiving emails via IMAP"
                                            checked={settings.imap_config.enable_imap}
                                            onChange={(v) => updateSettings("imap_config", { enable_imap: v })} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Blocked Domains</CardTitle>
                                        <CardDescription>Block specific domains from sending or receiving</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Blocked Sender Domains</Label>
                                            <div className="flex gap-2">
                                                <Input placeholder="example.com" value={newBlockedDomain}
                                                    onChange={(e) => setNewBlockedDomain(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && addBlockedDomain("sent")} />
                                                <Button size="sm" variant="outline" onClick={() => addBlockedDomain("sent")}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {settings.blocked_sent_domain.map((d) => (
                                                    <Badge key={d} variant="secondary" className="gap-1">
                                                        {d}
                                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeBlockedDomain("sent", d)} />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <Label>Blocked Recipient Domains</Label>
                                            <div className="flex gap-2">
                                                <Input placeholder="example.com" value={newBlockedRecipient}
                                                    onChange={(e) => setNewBlockedRecipient(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && addBlockedDomain("recipient")} />
                                                <Button size="sm" variant="outline" onClick={() => addBlockedDomain("recipient")}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {settings.blocked_recepient_domain.map((d) => (
                                                    <Badge key={d} variant="secondary" className="gap-1">
                                                        {d}
                                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeBlockedDomain("recipient", d)} />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Privacy Tab */}
                            <TabsContent value="privacy" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Email Privacy</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Auto Show Images" description="Automatically display images in emails"
                                            checked={settings.email_privacy.autoShowImages}
                                            onChange={(v) => updateSettings("email_privacy", { ...settings.email_privacy, autoShowImages: v })} />
                                        <SettingRow label="Block Email Tracking" description="Block tracking pixels and read receipts"
                                            checked={settings.email_privacy.block_email_tracking}
                                            onChange={(v) => updateSettings("email_privacy", { ...settings.email_privacy, block_email_tracking: v })} />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Display Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Show Meetings" description="Display meeting invites in sidebar"
                                            checked={settings.display.showMeetings}
                                            onChange={(v) => updateSettings("display", { ...settings.display, showMeetings: v })} />
                                        <SettingRow label="Show Right Sidebar" description="Show the right sidebar panel"
                                            checked={settings.display.showRightSidebar}
                                            onChange={(v) => updateSettings("display", { ...settings.display, showRightSidebar: v })} />
                                        <SettingRow label="Show Calendar" description="Display calendar in sidebar"
                                            checked={settings.display.showCalendar}
                                            onChange={(v) => updateSettings("display", { ...settings.display, showCalendar: v })} />
                                        <SettingRow label="Show Quota" description="Display storage quota info"
                                            checked={settings.display.showQuota}
                                            onChange={(v) => updateSettings("display", { ...settings.display, showQuota: v })} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Advanced Tab */}
                            <TabsContent value="advanced" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Auto Sync</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SettingRow label="Enable Auto Sync" description="Automatically sync mailbox"
                                            checked={settings.auto_sync.enabled}
                                            onChange={(v) => updateSettings("auto_sync", { ...settings.auto_sync, enabled: v })} />
                                        {settings.auto_sync.enabled && (
                                            <div className="ml-4 space-y-2">
                                                <Label>Sync Interval (seconds)</Label>
                                                <Input type="number" className="max-w-[150px]" value={settings.auto_sync.interval}
                                                    onChange={(e) => updateSettings("auto_sync", { ...settings.auto_sync, interval: e.target.value })} />
                                            </div>
                                        )}
                                        {settings.last_synced_at && (
                                            <p className="text-xs text-muted-foreground">Last synced: {new Date(settings.last_synced_at).toLocaleString()}</p>
                                        )}
                                        {settings.sync_error && (
                                            <p className="text-xs text-destructive">Sync error: {settings.sync_error}</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Calendar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <SettingRow label="Enable Calendar" description="Enable calendar integration"
                                            checked={settings.calender_config.enable_calender}
                                            onChange={(v) => updateSettings("calender_config", { enable_calender: v })} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">User Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>First Name</Label>
                                                <Input value={settings.user.first_name || ""}
                                                    onChange={(e) => updateSettings("user", { ...settings.user, first_name: e.target.value || null })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Last Name</Label>
                                                <Input value={settings.user.last_name || ""}
                                                    onChange={(e) => updateSettings("user", { ...settings.user, last_name: e.target.value || null })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Display Name</Label>
                                            <Input value={settings.user.display_name || ""}
                                                onChange={(e) => updateSettings("user", { ...settings.user, display_name: e.target.value || null })} />
                                        </div>
                                        <SettingRow label="Use Display Name" description="Use display name instead of email address"
                                            checked={settings.user.use_display_name}
                                            onChange={(v) => updateSettings("user", { ...settings.user, use_display_name: v })} />
                                        <div className="space-y-2">
                                            <Label>Timezone</Label>
                                            <Input value={settings.user.timezone}
                                                onChange={(e) => updateSettings("user", { ...settings.user, timezone: e.target.value })} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Personalization</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Theme</Label>
                                            <Select value={settings.personalization.theme}
                                                onValueChange={(v) => updateSettings("personalization", { ...settings.personalization, theme: v as any })}>
                                                <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="light">Light</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Layout</Label>
                                            <Select value={settings.personalization.layout}
                                                onValueChange={(v) => updateSettings("personalization", { ...settings.personalization, layout: v as any })}>
                                                <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="list">List</SelectItem>
                                                    <SelectItem value="grid">Grid</SelectItem>
                                                    <SelectItem value="2-column">2 Column</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}

                    {loading && selectedAccount && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

function SettingRow({ label, description, checked, onChange }: {
    label: string
    description: string
    checked: boolean
    onChange: (value: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    )
}
