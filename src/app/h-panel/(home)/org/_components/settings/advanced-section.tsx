"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { FormSwitchField, SettingRow } from "./setting-row"
import { FormInputField } from "./form-input-field"
import { ensureDefaultCalendar, createAppPassword } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-api"
import { API } from "@/lib/api/handler"
import type { AccountSettings } from "@/lib/types/account-settings.interface"
import { useAppSelector } from "@/store/hooks"
import { useUserConfigStore } from "@/store/settings/user-config"

interface AdvancedSectionProps {
    account?: string
}

export function AdvancedSection({ account }: AdvancedSectionProps) {
    const { watch, setValue, getValues } = useFormContext<AccountSettings>()
    const mid = useAppSelector((s) => s.accounts?.currAccount?.mid)
    const autoSyncEnabled = watch("auto_sync.enabled")
    const calenderEnabled = watch("calender_config.enable_calender")
    const lastSyncedAt = watch("last_synced_at")
    const syncError = watch("sync_error")
    const personalization = watch("personalization")

    // Calendar enable flow state
    const [calendarLoading, setCalendarLoading] = useState(false)
    const [showAppPasswordDialog, setShowAppPasswordDialog] = useState(false)
    const [appPassword, setAppPassword] = useState("")
    const [appPasswordLoading, setAppPasswordLoading] = useState(false)

    const handleCalendarToggle = async (enabled: boolean) => {
        if (!enabled) {
            // Turning off — just update the form value
            setValue("calender_config.enable_calender", false, { shouldDirty: true })
            return
        }

        // Turning on — provision calendar first
        setCalendarLoading(true)
        try {
            console.log('[h-panel advanced] handleCalendarToggle — calling ensureDefaultCalendar with mid:', mid)
            const ok = await ensureDefaultCalendar(mid)
            console.log('[h-panel advanced] ensureDefaultCalendar returned:', ok)
            if (!ok) {
                toast.error("Failed to create calendar. Please try again.")
                return
            }
            // Calendar created/exists → ask for app password
            setValue("calender_config.enable_calender", true, { shouldDirty: true })
            setShowAppPasswordDialog(true)
        } catch (err) {
            console.error('[h-panel advanced] handleCalendarToggle error:', err)
            toast.error("Failed to create calendar.")
        } finally {
            setCalendarLoading(false)
        }
    }

    const saveCalendarSettings = async () => {
        if (!account) return
        try {
            const values = getValues()
            await API.handleUpdateAccountSettings(account, values)
        } catch {
            // Settings will be saved on next manual save
        }
    }

    const handleAppPasswordSubmit = async () => {
        if (!appPassword.trim()) return
        setAppPasswordLoading(true)
        try {
            await createAppPassword("Calendar", appPassword, mid)
            await saveCalendarSettings()

            // Re-hydrate user-config store so sidebar/feature flags update immediately
            const values = getValues()
            useUserConfigStore.getState().hydrate(values)

            toast.success("Calendar enabled and app password created.")
            setShowAppPasswordDialog(false)
            setAppPassword("")
        } catch (err) {
            console.error('[h-panel advanced] handleAppPasswordSubmit error:', err)
            toast.error("Failed to create app password.")
        } finally {
            setAppPasswordLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Auto Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="auto_sync.enabled" label="Enable Auto Sync" description="Automatically sync mailbox" />
                    {autoSyncEnabled && (
                        <div className="ml-4">
                            <FormInputField
                                name="auto_sync.interval"
                                label="Sync Interval (seconds)"
                                type="number"
                                className="max-w-[150px]"
                                transformValue={(v) => parseInt(v) || 0}
                            />
                        </div>
                    )}
                    {lastSyncedAt && (
                        <p className="text-xs text-muted-foreground">Last synced: {new Date(lastSyncedAt).toLocaleString()}</p>
                    )}
                    {syncError && (
                        <p className="text-xs text-destructive">Sync error: {syncError}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Calendar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingRow
                        label="Enable Calendar"
                        description="Enable calendar integration"
                        checked={calenderEnabled}
                        onChange={handleCalendarToggle}
                        disabled={calendarLoading}
                    />
                    {calendarLoading && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Creating calendar…
                        </p>
                    )}
                    {calenderEnabled && (
                        <div className="ml-4 space-y-4">
                            <FormInputField
                                name="calender_config.calender_sync_interval"
                                label="Sync Interval (seconds)"
                                type="number"
                                className="max-w-[150px]"
                                transformValue={(v) => parseInt(v) || 0}
                            />
                            <FormSwitchField name="calender_config.notifications" label="Notifications" description="Enable calendar notifications" />
                            <FormSwitchField name="calender_config.sharing" label="Sharing" description="Allow calendar sharing" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* App Password Dialog — non-dismissable, user must create a password */}
            <Dialog open={showAppPasswordDialog} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} hideCloseButton>
                    <DialogHeader>
                        <DialogTitle>Create App Password</DialogTitle>
                        <DialogDescription>
                            An app password is required to complete your calendar setup. This password allows external calendar clients to sync with your calendar securely.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="app-password">App Password</Label>
                            <Input
                                id="app-password"
                                type="password"
                                placeholder="Enter a secure password"
                                className="rounded-none"
                                value={appPassword}
                                onChange={(e) => setAppPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && appPassword.trim() && handleAppPasswordSubmit()}
                            />
                        </div>
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                            <p className="text-xs text-blue-800 dark:text-blue-300">
                                <strong>Use this password</strong> to connect your calendar with <strong>Apple Calendar</strong>, <strong>Microsoft Outlook</strong>, <strong>Thunderbird</strong>, or any CalDAV-compatible app. You'll need your email address and this app password to sign in.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleAppPasswordSubmit}
                            disabled={!appPassword.trim() || appPasswordLoading}
                        >
                            {appPasswordLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInputField name="user.first_name" label="First Name" transformValue={(v) => v || null} />
                        <FormInputField name="user.last_name" label="Last Name" transformValue={(v) => v || null} />
                    </div>
                    <FormInputField name="user.display_name" label="Display Name" transformValue={(v) => v || null} />
                    <FormSwitchField name="user.use_display_name" label="Use Display Name" description="Use display name instead of email address" />
                    <FormInputField name="user.timezone" label="Timezone" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Personalization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select value={personalization.theme}
                            onValueChange={(v) => setValue("personalization.theme", v as "dark" | "light", { shouldDirty: true })}>
                            <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Layout</Label>
                        <Select value={personalization.layout}
                            onValueChange={(v) => setValue("personalization.layout", v as "grid" | "list" | "2-column", { shouldDirty: true })}>
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
        </div>
    )
}
